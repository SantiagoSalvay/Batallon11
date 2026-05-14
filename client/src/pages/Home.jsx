import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import Hero from '../components/Hero.jsx';
import VideoSection from '../components/VideoSection.jsx';
import StagesGrid from '../components/StagesGrid.jsx';
import PostsList from '../components/PostsList.jsx';
import Gallery from '../components/Gallery.jsx';
import EventsSection from '../components/EventsSection.jsx';

export default function Home() {
  const location = useLocation();
  const [hero, setHero] = useState(null);
  const [video, setVideo] = useState(null);
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
      api.get('/hero'),
      api.get('/video'),
      api.get('/stages'),
      api.get('/posts', { params: { limit: 6 } }),
      api.get('/gallery'),
      api.get('/events', { params: { upcoming: true } }),
    ]).then((results) => {
      if (cancelled) return;
      const [h, v, s, p, g, e] = results;
      if (h.status === 'fulfilled') setHero(h.value.data);
      if (v.status === 'fulfilled') setVideo(v.value.data);
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
      <Hero hero={hero} />
      <VideoSection video={video} />
      <StagesGrid stages={stages} />
      <PostsList posts={posts} title="Últimas novedades" />
      <Gallery images={gallery} />
      <EventsSection events={events} />
    </>
  );
}
