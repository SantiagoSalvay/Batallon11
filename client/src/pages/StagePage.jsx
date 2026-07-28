import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { api, asset } from '../services/api.js';
import PostsList from '../components/PostsList.jsx';
import Gallery from '../components/Gallery.jsx';
import StageInfoSection from '../components/StageInfoSection.jsx';
import StageContactSection from '../components/StageContactSection.jsx';
import Seo from '../components/Seo.jsx';
import { logoForStage } from '../lib/stageAssets.js';
import { localStageBySlug } from '../lib/stages.js';
import { breadcrumbLd, absoluteUrl } from '../lib/seo.js';

function metaDescription(stage) {
  const base = [stage.name, stage.motto].filter(Boolean).join(' — ');
  const full = `${base}. ${stage.description || ''}`.trim();
  return full.length > 160 ? `${full.slice(0, 157).trimEnd()}…` : full;
}

function resolveLogo(path) {
  if (!path) return null;
  if (path.startsWith('/uploads/')) return asset(path);
  return path;
}

export default function StagePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/stages/${slug}`)
      .then((r) => setStage(r.data))
      .catch((err) => {
        const local = localStageBySlug(slug);
        const isNetworkError = !err.response;
        if (local && isNetworkError) {
          setStage({ ...local, posts: [], gallery: [] });
          return;
        }
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const goHome = (e) => {
    e.preventDefault();
    navigate('/', { state: { scrollTo: 'top' } });
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-stone-50 pt-20 text-slate-500">
        Cargando...
      </div>
    );
  }
  if (error || !stage) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-stone-50 px-4 pt-20 text-slate-700">
        <div className="text-center">
          <p>{error || 'Etapa no encontrada'}</p>
          <Link to="/" className="public-button-primary mt-4">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const localStage = localStageBySlug(slug);
  const color = localStage?.color || stage.color || '#172554';
  const displayStage = { ...stage, color };
  const logo = resolveLogo(logoForStage(displayStage));

  return (
    <>
      <Seo
        title={stage.name}
        description={metaDescription(stage)}
        path={`/etapas/${slug}`}
        image={logo ? absoluteUrl(logo) : undefined}
        type="article"
        jsonLd={breadcrumbLd([
          { name: 'Inicio', path: '/' },
          { name: stage.name, path: `/etapas/${slug}` },
        ])}
      />
      <section className="bg-stone-50 pt-24 text-slate-950">
        <div className="container-app pb-8 pt-4 sm:pb-16 sm:pt-6">
          <Link
            to="/"
            onClick={goHome}
            className="text-sm font-semibold text-slate-500 transition hover:text-blue-950"
          >
            {'<-'} Volver al inicio
          </Link>

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm sm:mt-10"
          >
            {stage.coverImage && (
              <div className="h-36 overflow-hidden bg-slate-100 sm:h-64">
                <img
                  src={asset(stage.coverImage)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-4 p-4 sm:grid sm:grid-cols-[140px_1fr] sm:items-center sm:gap-8 sm:p-8">
              {logo && (
                <img
                  src={logo}
                  alt={stage.name}
                  className="h-28 w-28 shrink-0 object-contain sm:h-36 sm:w-36"
                />
              )}
              <div className="min-w-0 flex-1">
                <span
                  className="mb-2 inline-block h-1 w-10 rounded-full sm:mb-4 sm:h-1.5 sm:w-14"
                  style={{ backgroundColor: color }}
                />
                <p className="public-eyebrow text-[0.65rem] sm:text-xs">Etapa</p>
                <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight text-slate-950 sm:mt-2 sm:text-5xl">
                  {stage.name}
                </h1>
                {stage.motto && (
                  <p className="mt-2 text-sm font-medium italic leading-snug text-slate-600 sm:mt-3 sm:text-lg">
                    {stage.motto}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <StageInfoSection stage={displayStage} />

      <PostsList
        title={`Publicaciones de ${displayStage.name}`}
        posts={stage.posts || []}
        emptyText="Aun no hay publicaciones en esta etapa."
        compact
        maxItems={4}
        viewAllLink={`/etapas/${slug}/publicaciones`}
        viewAllThreshold={4}
        viewAllLabel="Ver más publicaciones"
        animate={false}
      />

      <Gallery
        title={`Galeria de ${displayStage.name}`}
        images={stage.gallery || []}
        carousel
        viewAllLink={`/etapas/${slug}/galeria`}
        viewAllThreshold={4}
        viewAllLabel="Ver más fotos"
        animate={false}
      />

      <StageContactSection stage={displayStage} />
    </>
  );
}
