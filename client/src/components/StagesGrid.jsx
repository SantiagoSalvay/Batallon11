import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { asset } from '../services/api.js';
import {
  logoForStage,
  glowColorForStage,
  logoScaleForStage,
} from '../lib/stageAssets.js';

function resolveLogo(path) {
  if (!path) return null;
  if (path.startsWith('/uploads/')) return asset(path);
  return path;
}

export default function StagesGrid({ stages = [] }) {
  return (
    <section id="etapas" className="public-band py-16 sm:py-24">
      <div className="container-app">
        <div className="grid gap-6 border-b border-slate-200 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="public-eyebrow">Etapas</span>
            <h2 className="public-title mt-3">Un camino para cada edad</h2>
          </div>
          <p className="public-copy max-w-2xl lg:ml-auto">
            Cada etapa tiene su identidad, sus actividades y su forma de
            acompanar el crecimiento dentro del batallon.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage, idx) => {
            const logo = resolveLogo(logoForStage(stage));
            const color = glowColorForStage(stage);
            const scale = logoScaleForStage(stage);

            return (
              <motion.article
                key={stage.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  to={`/etapas/${stage.slug}`}
                  className="group flex min-h-32 items-center gap-5 rounded-md border border-slate-200 bg-stone-50 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white p-3">
                    {logo ? (
                      <img
                        src={logo}
                        alt={stage.name}
                        className="h-full w-full object-contain transition group-hover:scale-105"
                        style={{ transform: `scale(${scale})` }}
                      />
                    ) : (
                      <div
                        className="h-full w-full rounded"
                        style={{ backgroundColor: `${color}55` }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="mb-3 h-1 w-10 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <h3 className="font-display text-lg font-extrabold leading-tight text-slate-950">
                      {stage.name}
                    </h3>
                    {stage.motto && (
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {stage.motto}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
