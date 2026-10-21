import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { LOCAL_STAGES } from '../lib/stages.js';
import { EASE_OUT } from '../lib/motion.js';

/**
 * Ubica la etapa dentro del recorrido completo.
 *
 * Es la misma idea de camino que ordena la portada: acá sirve para saber en
 * qué punto del recorrido está esta etapa y poder saltar a las otras.
 */
export default function StageStepIndicator({ slug }) {
  const index = LOCAL_STAGES.findIndex((s) => s.slug === slug);
  if (index < 0) return null;

  const total = LOCAL_STAGES.length;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="public-eyebrow text-[0.65rem] sm:text-xs">
        Etapa {index + 1} de {total}
      </p>

      <ol className="flex items-center gap-1.5">
        {LOCAL_STAGES.map((s, i) => {
          const isCurrent = i === index;
          return (
            <li key={s.slug}>
              <Link
                to={`/etapas/${s.slug}`}
                aria-label={`Etapa ${i + 1}: ${s.name}`}
                aria-current={isCurrent ? 'step' : undefined}
                className="block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
              >
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.35, ease: EASE_OUT }}
                  className={`block rounded-full transition-all duration-300 hover:opacity-100 ${
                    isCurrent ? 'h-2.5 w-7' : 'h-2.5 w-2.5 opacity-40 hover:w-4'
                  }`}
                  style={{ backgroundColor: isCurrent ? s.color : '#94a3b8' }}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
