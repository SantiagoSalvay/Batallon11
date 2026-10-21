import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { asset } from '../services/api.js';
import {
  logoForStage,
  glowColorForStage,
  logoScaleForStage,
} from '../lib/stageAssets.js';
import SectionHeader from './SectionHeader.jsx';
import { fadeUp, inView } from '../lib/motion.js';

function leadSentence(text, max = 160) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/[\s,;:.]+\S*$/, '')}…`;
}

function resolveLogo(path) {
  if (!path) return null;
  if (path.startsWith('/uploads/')) return asset(path);
  return path;
}

/**
 * Las etapas se recorren en orden (1 a 6, de Horneros a Soles), así que se
 * muestran como un camino y no como una grilla suelta: el riel se va dibujando
 * a medida que se baja y cada nodo lleva el número y el color de su etapa.
 */
export default function StagesGrid({ stages = [] }) {
  const trailRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trailRef,
    offset: ['start 85%', 'end 65%'],
  });
  const trailProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section id="etapas" className="public-band py-16 sm:py-24">
      <div className="container-app">
        <SectionHeader
          eyebrow="Etapas"
          title="Un camino para cada edad"
          lead="Cada etapa tiene su identidad, sus actividades y su forma de acompañar el crecimiento dentro del batallón."
        />

        <div ref={trailRef} className="relative mt-10">
          {/* Riel del camino: una guía tenue y, encima, el tramo ya recorrido. */}
          <div
            aria-hidden="true"
            className="absolute bottom-6 left-[21px] top-6 w-px bg-slate-200 sm:left-[31px]"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY: trailProgress }}
            className="absolute bottom-6 left-[21px] top-6 w-px origin-top bg-blue-950 sm:left-[31px]"
          />

          <ol className="space-y-3">
            {stages.map((stage, idx) => {
              const logo = resolveLogo(logoForStage(stage));
              const color = glowColorForStage(stage);
              const scale = logoScaleForStage(stage);
              const step = String(idx + 1).padStart(2, '0');
              const lead = leadSentence(stage.description);

              return (
                <motion.li
                  key={stage.slug}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={inView}
                  className="grid grid-cols-[44px_1fr] items-stretch sm:grid-cols-[64px_1fr]"
                >
                  {/* Nodo del camino */}
                  <div className="relative flex justify-center pt-6">
                    <span
                      className="z-10 grid h-[34px] w-[34px] place-items-center rounded-full border-2 bg-white text-[11px] font-extrabold tabular-nums text-slate-900 transition-transform duration-300"
                      style={{ borderColor: color }}
                    >
                      {step}
                    </span>
                  </div>

                  <Link
                    to={`/etapas/${stage.slug}`}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-md border border-slate-200 bg-stone-50 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 sm:gap-5 sm:p-5"
                  >
                    {/* Marca de color de la etapa, que crece al pasar el mouse */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1 origin-top scale-y-100 transition-all duration-300 group-hover:w-1.5"
                      style={{ backgroundColor: color }}
                    />

                    <div className="ml-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white p-2 sm:h-20 sm:w-20 sm:p-3">
                      {logo ? (
                        <img
                          src={logo}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                          style={{ transform: `scale(${scale})` }}
                        />
                      ) : (
                        <span
                          className="h-full w-full rounded"
                          style={{ backgroundColor: `${color}55` }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 lg:flex-none lg:w-64">
                      <h3 className="font-display text-lg font-extrabold leading-tight text-slate-950">
                        {stage.name}
                      </h3>
                      {stage.motto && (
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {stage.motto}
                        </p>
                      )}
                    </div>

                    {lead && (
                      <p className="hidden min-w-0 flex-1 border-l border-slate-200 pl-6 text-sm leading-6 text-slate-600 lg:block">
                        {lead}
                      </p>
                    )}

                    <ArrowRight
                      aria-hidden="true"
                      className="hidden h-5 w-5 shrink-0 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-950 sm:block"
                    />
                  </Link>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
