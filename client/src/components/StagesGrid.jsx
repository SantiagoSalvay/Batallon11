import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { asset } from '../services/api.js';
import { logoForStage } from '../lib/stageAssets.js';

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

        <div className="grid gap-x-6 gap-y-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((stage, idx) => {
            const logo = resolveLogo(logoForStage(stage));
            const color = stage.color || '#3458ff';

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link
                  to={`/etapas/${stage.slug}`}
                  className="group block text-center transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="relative mx-auto h-36 w-36 sm:h-40 sm:w-40 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-25 group-hover:opacity-70 transition-opacity duration-500"
                      style={{ backgroundColor: color }}
                    />
                    {logo ? (
                      <img
                        src={logo}
                        alt={stage.name}
                        className="relative h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                        style={{
                          filter: `drop-shadow(0 14px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 22px ${color}80)`,
                        }}
                      />
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
                    <h3 className="font-bold text-sm sm:text-base leading-tight group-hover:text-white text-white/90">
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
