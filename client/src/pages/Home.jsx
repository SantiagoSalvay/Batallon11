import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import Hero from '../components/Hero.jsx';
import AboutSection from '../components/AboutSection.jsx';
import StagesGrid from '../components/StagesGrid.jsx';
import Gallery from '../components/Gallery.jsx';
import VisitUsSection from '../components/VisitUsSection.jsx';
import EventsSection from '../components/EventsSection.jsx';
import ContactSection from '../components/ContactSection.jsx';
import Seo from '../components/Seo.jsx';
import { LOCAL_STAGES } from '../lib/stages.js';
import { organizationLd, websiteLd, DEFAULT_DESCRIPTION } from '../lib/seo.js';

export default function Home() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [stageGalleryImages, setStageGalleryImages] = useState([]);

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
      api.get('/events', { params: { upcoming: true } }),
      api.get('/stage-gallery/mixed', { params: { limit: 8 } }),
    ]).then((results) => {
      if (cancelled) return;
      const [e, g] = results;
      if (e.status === 'fulfilled') setEvents(e.value.data);
      if (g.status === 'fulfilled') setStageGalleryImages(g.value.data);
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
      <EventsSection events={events} />
      <Gallery
        title="Galeria de Nuestro Batallon"
        images={stageGalleryImages}
        maxItems={8}
        layout="carousel"
        viewAllLink="/galeria"
        viewAllLabel="Ver todas las fotos"
        viewAllThreshold={3}
      />
      <VisitUsSection />
      <ContactSection />
    </>
  );
}
