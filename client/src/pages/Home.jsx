import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import Hero from '../components/Hero.jsx';
import AboutSection from '../components/AboutSection.jsx';
import StagesGrid from '../components/StagesGrid.jsx';
import ListaPublicaciones from '../components/ListaPublicaciones.jsx';
import VisitUsSection from '../components/VisitUsSection.jsx';
import EventsSection from '../components/EventsSection.jsx';
import ContactSection from '../components/ContactSection.jsx';
import { LOCAL_STAGES } from '../lib/stages.js';

export default function Home() {
  const location = useLocation();
  const [publicaciones, setPublicaciones] = useState([]);
  const [hayMasPublicaciones, setHayMasPublicaciones] = useState(false);
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
      api.get('/publicaciones', { params: { etapa: 'general', limite: 4 } }),
      api.get('/events', { params: { upcoming: true } }),
    ]).then((results) => {
      if (cancelled) return;
      const [p, e] = results;
      if (p.status === 'fulfilled') {
        const all = p.value.data;
        setHayMasPublicaciones(all.length > 3);
        setPublicaciones(all.slice(0, 3));
      }
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
      <StagesGrid stages={LOCAL_STAGES} />
      <ListaPublicaciones publicaciones={publicaciones} titulo="Ultimas novedades" mostrarVerTodas={hayMasPublicaciones} />
      <EventsSection events={events} />
      <VisitUsSection />
      <ContactSection />
    </>
  );
}
