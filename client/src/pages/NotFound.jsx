import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { BRAND_LOGO } from '../lib/stageAssets.js';
import { usePageBackground } from '../context/PageBackgroundContext.jsx';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  const { darkMode } = usePageBackground();
  const navigate = useNavigate();

  return (
    <section className="public-section relative flex flex-1 items-center overflow-hidden py-16 sm:py-24">
      <Seo title="Página no encontrada" description="La dirección que buscás no existe o ya no está disponible." noindex />
      <div
        className={`pointer-events-none absolute inset-0 ${
          darkMode
            ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(30,58,138,0.15),transparent_40%)]'
            : 'bg-[radial-gradient(circle_at_20%_20%,rgba(30,58,138,0.06),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.08),transparent_40%)]'
        }`}
        aria-hidden="true"
      />

      <div className="container-app relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-lg text-center"
        >
          <img
            src={BRAND_LOGO}
            alt="Batallón 11"
            className="mx-auto h-20 w-20 object-contain sm:h-24 sm:w-24"
          />

          <p
            className={`mt-8 font-display text-8xl font-extrabold leading-none sm:text-9xl ${
              darkMode ? 'text-sky-300/90' : 'text-blue-950'
            }`}
          >
            404
          </p>

          <h1 className="public-title mt-4 text-2xl sm:text-3xl">
            Página no encontrada
          </h1>

          <p className="public-copy mt-4">
            La dirección que buscás no existe, fue movida o ya no está disponible.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/', { state: { scrollTo: 'top' } })}
              className="public-button-primary"
            >
              Volver al inicio
            </button>
            <Link
              to="/publicaciones"
              className={`inline-flex items-center justify-center rounded-md border px-5 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? 'border-white/25 text-white hover:bg-white hover:text-slate-950 focus:ring-white focus:ring-offset-slate-950'
                  : 'border-slate-300 text-slate-800 hover:border-blue-950 hover:bg-blue-950 hover:text-white focus:ring-blue-950 focus:ring-offset-stone-50'
              }`}
            >
              Ver novedades
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
