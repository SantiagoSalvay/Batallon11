import { motion } from 'framer-motion';
import { asset } from '../services/api.js';

const DEFAULT_BG = '/Fondo_Primera_seccion.jpg';

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero({ hero }) {
  const bg = hero?.heroImage ? asset(hero.heroImage) : DEFAULT_BG;

  return (
    <section
      id="top"
      className="relative isolate min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src={bg}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/55 to-ink-900/85" />
        <div className="absolute inset-0 bg-ink-900/35" />
      </div>

      <div className="container-app py-24 sm:py-32 text-center flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-white/40 mb-6"
        >
          Exploradores Argentinos de Don Bosco
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-display font-extrabold leading-[0.95] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl"
        >
          <span className="text-gradient drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            Batallón 11
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-5 text-lg sm:text-xl lg:text-2xl font-display font-semibold text-white/80 tracking-wide"
        >
          General José María Paz
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-10 flex flex-wrap gap-3 justify-center"
        >
          <a
            href="#etapas"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('etapas');
            }}
            className="btn-primary"
          >
            {hero?.ctaText || 'Conocenos'}
          </a>
          <a
            href="#etapas"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('etapas');
            }}
            className="btn-ghost"
          >
            Ver etapas
          </a>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToId('etapas')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        aria-label="Bajar a la siguiente sección"
        className="group absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-[0.3em] focus:outline-none"
      >
        <span className="font-semibold">Bajar</span>
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
        >
          <path d="M7 10l5 5 5-5" />
        </motion.svg>
      </motion.button>
    </section>
  );
}
