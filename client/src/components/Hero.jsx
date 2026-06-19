import { motion } from 'framer-motion';
import { BRAND_LOGO } from '../lib/stageAssets.js';
import { usePageBackground } from '../context/PageBackgroundContext.jsx';

const DEFAULT_BG = '/Fondo_Primera_seccion.jpg';

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero() {
  const { darkMode } = usePageBackground();

  return (
    <section
      id="top"
      className="relative isolate min-h-[88vh] overflow-hidden bg-slate-950 text-white"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src={DEFAULT_BG}
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-48 sm:h-56 ${
            darkMode ? 'hero-bottom-fade-dark' : 'hero-bottom-fade-light'
          }`}
        />
      </div>

      <div className="container-app flex min-h-[88vh] items-end pb-10 pt-20 sm:pb-24 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="mb-[17vh] w-full max-w-3xl sm:mb-0"
        >
          <div className="mb-6 flex items-center gap-4">
            <img
              src={BRAND_LOGO}
              alt="Batallon 11"
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
            <div className="border-l border-white/35 pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">
                Exploradores Argentinos de Don Bosco
              </p>
              <p className="mt-1 text-sm font-semibold text-white/70">
                Cordoba, Argentina
              </p>
            </div>
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Batallon 11
          </h1>
          <p className="mt-4 text-xl font-semibold text-white/90 sm:text-2xl">
            General Jose Maria Paz
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Una comunidad de chicos, jovenes y animadores que crece entre la vida
            de grupo, el servicio, la fe y las actividades al aire libre.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollToId('quienes-somos')}
              className="public-button-primary"
            >
              Conocer el batallon
            </button>
            <button
              type="button"
              onClick={() => scrollToId('etapas')}
              className="public-button-secondary"
            >
              Ver etapas
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
