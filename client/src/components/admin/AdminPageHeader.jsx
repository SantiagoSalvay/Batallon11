import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../lib/motion.js';

/**
 * Encabezado común a todas las pantallas del panel.
 *
 * Antes cada página armaba su propio título con márgenes distintos; esto fija
 * una sola jerarquía: título, una línea de contexto y, a la derecha, la acción
 * principal de la pantalla.
 */
export default function AdminPageHeader({ title, description, badge, actions }) {
  return (
    <motion.header
      variants={stagger(0.07)}
      initial="hidden"
      animate="visible"
      className="mb-8 border-b border-white/10 pb-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {badge && (
            <motion.div variants={fadeUp} className="mb-3">
              {badge}
            </motion.div>
          )}
          <motion.h1
            variants={fadeUp}
            className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              variants={fadeUp}
              className="mt-2 max-w-2xl text-sm leading-6 text-white/60"
            >
              {description}
            </motion.p>
          )}
        </div>

        {actions && (
          <motion.div variants={fadeUp} className="flex shrink-0 flex-wrap gap-2">
            {actions}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
