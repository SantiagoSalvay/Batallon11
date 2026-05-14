import { motion } from 'framer-motion';
import { asset } from '../services/api.js';
import { BRAND_LOGO } from '../lib/stageAssets.js';

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero({ hero }) {
  const bg = hero?.heroImage ? asset(hero.heroImage) : null;

  return (
    <section
      id="top"
      className="relative isolate min-h-screen flex items-center grain overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        {bg ? (
          <img
            src={bg}
            alt=""
            className="h-full w-full object-cover opacity-50"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-transparent" />
      </div>

      <div className="container-app py-24 sm:py-32 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge mb-6">Exploradores Argentinos de Don Bosco</span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
            <span className="text-gradient">
              {hero?.heroTitle || 'Batallón 11 General José María Paz'}
            </span>
          </h1>
          {hero?.heroSubtitle && (
            <p className="mt-6 text-lg sm:text-xl text-white/75 max-w-2xl">
              {hero.heroSubtitle}
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:flex justify-center items-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-accent-500/20 blur-3xl" />
          <img
            src={BRAND_LOGO}
            alt="Logo Batallón 11"
            className="relative w-80 h-80 object-contain drop-shadow-[0_20px_60px_rgba(52,88,255,0.4)]"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50 text-xs"
      >
        <span>scroll</span>
        <span className="mt-2 h-8 w-px bg-white/30" />
      </motion.div>
    </section>
  );
}
