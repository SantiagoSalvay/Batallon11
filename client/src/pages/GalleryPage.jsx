import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../services/api.js';
import Gallery from '../components/Gallery.jsx';
import Seo from '../components/Seo.jsx';
import { LOCAL_STAGES } from '../lib/stages.js';
import { breadcrumbLd } from '../lib/seo.js';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled(
      LOCAL_STAGES.map((stage) => api.get(`/stages/${stage.slug}/gallery`))
    )
      .then((results) => {
        if (cancelled) return;
        const all = results.flatMap((result) =>
          result.status === 'fulfilled' ? result.value.data : []
        );
        if (all.length === 0 && results.every((r) => r.status === 'rejected')) {
          setError('No se pudieron cargar las fotos.');
        }
        setImages(all);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const seo = (
    <Seo
      title="Galería del Batallón"
      description="Galería completa de fotos del Batallón 11 General José María Paz: actividades, campamentos y momentos compartidos por todas las etapas."
      path="/galeria"
      jsonLd={breadcrumbLd([
        { name: 'Inicio', path: '/' },
        { name: 'Galería', path: '/galeria' },
      ])}
    />
  );

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-stone-50 pt-24 text-slate-500">
        {seo}
        Cargando...
      </div>
    );
  }

  return (
    <div className="bg-stone-50 pt-16">
      {seo}
      <div className="container-app pb-2 pt-8">
        <Link
          to="/"
          className="text-sm font-semibold text-slate-500 transition hover:text-blue-950"
        >
          {'<-'} Volver al inicio
        </Link>
      </div>
      {error ? (
        <div className="container-app py-8 text-sm text-red-700">{error}</div>
      ) : (
        <Gallery title="Galeria de Nuestro Batallon" images={images} />
      )}
    </div>
  );
}
