import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, asset } from '../services/api.js';
import PostsList from '../components/PostsList.jsx';
import Gallery from '../components/Gallery.jsx';
import StageInfoSection from '../components/StageInfoSection.jsx';
import StageContactSection from '../components/StageContactSection.jsx';
import { logoForStage } from '../lib/stageAssets.js';
import { localStageBySlug } from '../lib/stages.js';

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
        if (local) {
          setStage({ ...local, posts: [], gallery: [] });
        } else {
          setError(err.response?.data?.message || err.message);
        }
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

  const color = stage.color || '#172554';
  const logo = resolveLogo(logoForStage(stage));

  return (
    <>
      <section className="bg-stone-50 pt-24 text-slate-950">
        <div className="container-app pb-12 pt-6 sm:pb-16">
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
            className="mt-10 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
          >
            {stage.coverImage && (
              <div className="h-48 overflow-hidden bg-slate-100 sm:h-64">
                <img
                  src={asset(stage.coverImage)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="grid gap-8 p-6 sm:grid-cols-[140px_1fr] sm:p-8">
              {logo && (
                <div className="flex h-32 w-32 items-center justify-center rounded-md border border-slate-200 bg-stone-50 p-4">
                  <img
                    src={logo}
                    alt={stage.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div>
                <span
                  className="mb-4 inline-block h-1.5 w-14 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <p className="public-eyebrow">Etapa</p>
                <h1 className="mt-2 font-display text-4xl font-extrabold text-slate-950 sm:text-5xl">
                  {stage.name}
                </h1>
                {stage.motto && (
                  <p className="mt-3 text-lg font-medium italic text-slate-600">
                    {stage.motto}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <StageInfoSection stage={stage} />

      <PostsList
        title={`Publicaciones de ${stage.name}`}
        posts={stage.posts || []}
        emptyText="Aún no hay publicaciones en esta etapa."
      />

      <Gallery
        title={`Galería de ${stage.name}`}
        images={stage.gallery || []}
      />

      <StageContactSection stage={stage} />
    </>
  );
}
