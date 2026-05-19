import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import Hero from '../components/Hero.jsx';
import AboutSection from '../components/AboutSection.jsx';
import StagesGrid from '../components/StagesGrid.jsx';
import PostsList from '../components/PostsList.jsx';
import Gallery from '../components/Gallery.jsx';
import EventsSection from '../components/EventsSection.jsx';
import ContactSection from '../components/ContactSection.jsx';

export default function Home() {
  const location = useLocation();
  const [stages, setStages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
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
      api.get('/stages'),
      api.get('/posts', { params: { limit: 6 } }),
      api.get('/gallery'),
      api.get('/events', { params: { upcoming: true } }),
    ]).then((results) => {
      if (cancelled) return;
      const [s, p, g, e] = results;
      if (s.status === 'fulfilled') setStages(s.value.data);
      if (p.status === 'fulfilled') setPosts(p.value.data);
      if (g.status === 'fulfilled') setGallery(g.value.data);
      if (e.status === 'fulfilled') setEvents(e.value.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Hero />
      <AboutSection />
      <StagesGrid stages={stages} />
      <PostsList posts={posts} title="Últimas novedades" />
      <Gallery images={gallery} />
      <EventsSection events={events} />
      <ContactSection />
    </>
  );
}
