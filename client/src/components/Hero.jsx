import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BRAND_LOGO } from '../lib/stageAssets.js';
import { usePageBackground } from '../context/PageBackgroundContext.jsx';
import { EASE_OUT, fadeUp, stagger } from '../lib/motion.js';

const DEFAULT_BG = '/Fondo_Primera_seccion.jpg';

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero() {
  const { darkMode } = usePageBackground();
  const sectionRef = useRef(null);

  // Parallax leve: la foto se mueve menos que el texto al bajar.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative isolate min-h-[88vh] overflow-hidden bg-slate-950 text-white"
    >
      <div className="absolute inset-0 -z-10">
        <motion.img
          src={DEFAULT_BG}
          alt=""
          style={{ y: bgY }}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EASE_OUT }}
          className="h-[114%] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-48 sm:h-56 ${
            darkMode ? 'hero-bottom-fade-dark' : 'hero-bottom-fade-light'
          }`}
        />
      </div>

      <div className="container-app flex min-h-[88vh] items-end pb-10 pt-20 sm:pb-24 sm:pt-24 lg:pb-48 lg:pt-28 xl:pb-52">
        <motion.div
          variants={stagger(0.1, 0.15)}
          initial="hidden"
          animate="visible"
          style={{ opacity: contentOpacity }}
          className="mb-[17vh] w-full max-w-3xl sm:mb-0"
        >
          <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
            <img
              src={BRAND_LOGO}
              alt="Batallón 11"
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
            <div className="border-l border-white/35 pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">
                Exploradores Argentinos de Don Bosco
              </p>
              <p className="mt-1 text-sm font-semibold text-white/70">
                Córdoba, Argentina
              </p>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl font-extrabold leading-[0.95] text-white sm:text-6xl lg:text-7xl"
          >
            Batallón 11
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-xl font-semibold text-white/90 sm:text-2xl"
          >
            General José María Paz
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg"
          >
            Una comunidad de chicos, jóvenes y animadores que crece entre la vida
            de grupo, el servicio, la fe y las actividades al aire libre.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={() => scrollToId('quienes-somos')}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="public-button-primary"
            >
              Conocer el batallón
            </motion.button>
            <motion.button
              type="button"
              onClick={() => scrollToId('etapas')}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="public-button-secondary"
            >
              Ver etapas
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
