import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import Hero from '../components/Hero.jsx';
import AboutSection from '../components/AboutSection.jsx';
import StagesGrid from '../components/StagesGrid.jsx';
import PostsList from '../components/PostsList.jsx';
import VisitUsSection from '../components/VisitUsSection.jsx';
import EventsSection from '../components/EventsSection.jsx';
import ContactSection from '../components/ContactSection.jsx';
import Seo from '../components/Seo.jsx';
import { LOCAL_STAGES } from '../lib/stages.js';
import { organizationLd, websiteLd, DEFAULT_DESCRIPTION } from '../lib/seo.js';

export default function Home() {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    const t = setTimeout(() => {
      if (target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState({}, '');
    }, 150);
    return () => clearTimeout(t);
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      api.get('/posts', { params: { limit: 4 } }),
      api.get('/events', { params: { upcoming: true } }),
    ]).then((results) => {
      if (cancelled) return;
      const [p, e] = results;
      if (p.status === 'fulfilled') {
        const all = p.value.data;
        setHasMorePosts(all.length > 3);
        setPosts(all.slice(0, 3));
      }
      if (e.status === 'fulfilled') setEvents(e.value.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Seo
        description={DEFAULT_DESCRIPTION}
        path="/"
        type="website"
        jsonLd={[organizationLd(), websiteLd()]}
      />
      <Hero />
      <AboutSection />
      <StagesGrid stages={LOCAL_STAGES} />
      <PostsList posts={posts} title="Ultimas novedades" showViewAll={hasMorePosts} />
      <EventsSection events={events} />
      <VisitUsSection />
      <ContactSection />
    </>
  );
}
