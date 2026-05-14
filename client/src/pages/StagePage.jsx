import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, asset } from '../services/api.js';
import PostsList from '../components/PostsList.jsx';
import Gallery from '../components/Gallery.jsx';
import { logoForStage } from '../lib/stageAssets.js';

function resolveLogo(path) {
  if (!path) return null;
  if (path.startsWith('/uploads/')) return asset(path);
  return path;
}

export default function StagePage() {
  const { slug } = useParams();
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/stages/${slug}`)
      .then((r) => setStage(r.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [slug]);

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
      <section className="relative isolate min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {stage.coverImage ? (
            <img
              src={asset(stage.coverImage)}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: `linear-gradient(135deg, ${color}80, #0b1020)` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent" />
        </div>

        <div className="container-app py-20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-3xl"
          >
            <Link to="/#etapas" className="text-sm text-white/60 hover:text-white">
              ← Volver a etapas
            </Link>

            <div className="mt-6 flex items-center gap-5">
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
            </div>

            {stage.description && (
              <p className="mt-6 text-lg text-white/80 max-w-2xl whitespace-pre-line">
                {stage.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <PostsList
        title={`Publicaciones de ${stage.name}`}
        posts={stage.posts || []}
        emptyText="Aún no hay publicaciones en esta etapa."
      />

      <Gallery title={`Galería de ${stage.name}`} images={stage.gallery || []} />
    </>
  );
}
