import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, asset } from '../services/api.js';
import PostsList from '../components/PostsList.jsx';
import Gallery from '../components/Gallery.jsx';
import StageContactSection from '../components/StageContactSection.jsx';
import { logoForStage } from '../lib/stageAssets.js';

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
    api
      .get(`/stages/${slug}`)
      .then((r) => setStage(r.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const goHome = (e) => {
    e.preventDefault();
    navigate('/', { state: { scrollTo: 'top' } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-white/60">Cargando…</div>
    );
  }
  if (error || !stage) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-white/70">
        <div className="text-center">
          <p>{error || 'Etapa no encontrada'}</p>
          <Link to="/" className="btn-ghost mt-4 inline-flex">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const color = stage.color || '#3458ff';
  const logo = resolveLogo(logoForStage(stage));

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink-900">
        <div className="absolute inset-0 -z-10">
          {stage.coverImage && (
            <img
              src={asset(stage.coverImage)}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 70% at top left, ${color}66, transparent 65%)`,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-900" />
        </div>

        <div className="container-app pt-24 pb-12 sm:pt-28 sm:pb-16">
          <Link
            to="/"
            onClick={goHome}
            className="text-sm text-white/60 hover:text-white"
          >
            ← Volver al principio
          </Link>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-3xl mt-10 flex items-center gap-5"
          >
            {logo && (
              <img
                src={logo}
                alt={stage.name}
                className="h-28 w-28 sm:h-32 sm:w-32 object-contain"
                style={{
                  filter: `drop-shadow(0 12px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 20px ${color}80)`,
                }}
              />
            )}
            <div>
              <span
                className="inline-block h-1.5 w-12 rounded mb-3"
                style={{ backgroundColor: color }}
              />
              <h1 className="text-4xl sm:text-5xl font-extrabold">
                <span className="text-gradient">{stage.name}</span>
              </h1>
            </div>
          </motion.div>
        </div>
      </section>

      <PostsList
        title={`Publicaciones de ${stage.name}`}
        posts={stage.posts || []}
        emptyText="Aún no hay publicaciones en esta etapa."
      />

      <Gallery title={`Galería de ${stage.name}`} images={stage.gallery || []} />

      <StageContactSection stage={stage} />
    </>
  );
}
