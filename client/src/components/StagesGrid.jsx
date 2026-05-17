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
    <section id="etapas" className="py-20 sm:py-28 bg-ink-900">
      <div className="container-app">
        <div className="max-w-2xl mb-14">
          <span className="badge mb-3">Sistema de etapas</span>
          <h2 className="section-title">Etapas del batallón</h2>
          <p className="mt-3 text-white/70">
            Cada etapa tiene su propia identidad, actividades, galería y publicaciones.
          </p>
        </div>

        <div className="mx-auto grid justify-items-center gap-x-4 gap-y-10 sm:gap-y-12 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-6xl">
          {stages.map((stage, idx) => {
            const logo = resolveLogo(logoForStage(stage));
            const color = glowColorForStage(stage);
            const scale = logoScaleForStage(stage);

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="w-full max-w-[180px]"
              >
                <Link
                  to={`/etapas/${stage.slug}`}
                  className="group block text-center transition-all duration-300"
                >
                  <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-30 group-hover:opacity-80 transition-opacity duration-500"
                      style={{ backgroundColor: color }}
                    />
                    {logo ? (
                      <div
                        className="relative h-full w-full flex items-center justify-center"
                        style={{ transform: `scale(${scale})` }}
                      >
                        <img
                          src={logo}
                          alt={stage.name}
                          className="h-full w-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2"
                          style={{
                            filter: `drop-shadow(0 14px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 22px ${color}aa)`,
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="relative h-24 w-24 rounded-full"
                        style={{ backgroundColor: `${color}55` }}
                      />
                    )}
                  </div>

                  <div className="mt-5">
                    <div
                      className="mx-auto h-0.5 w-8 rounded mb-3 transition-all duration-300 group-hover:w-16"
                      style={{ backgroundColor: color }}
                    />
                    <h3 className="font-bold text-sm sm:text-base leading-tight tracking-wider text-white/90 group-hover:text-white">
                      {stage.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
