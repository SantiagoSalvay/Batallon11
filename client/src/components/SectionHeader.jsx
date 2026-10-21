import { motion } from 'framer-motion';
import { drawRule, fadeUp, inView, stagger } from '../lib/motion.js';

/**
 * Encabezado de sección del sitio público.
 *
 * Reemplaza el bloque "eyebrow + título + bajada/acción + borde inferior" que
 * estaba repetido en cada sección, y le suma la regla que se dibuja al entrar
 * en pantalla. Admite dos formas: con bajada a la derecha, o con una acción
 * (por ejemplo "Ver todas las fotos") alineada al pie del título.
 */
export default function SectionHeader({ eyebrow, title, lead, action, id }) {
  const layout = action
    ? 'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'
    : 'grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end';

  return (
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      className={`relative pb-8 ${layout}`}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <motion.span variants={fadeUp} className="public-eyebrow block">
            {eyebrow}
          </motion.span>
        )}
        <motion.h2 variants={fadeUp} id={id} className="public-title mt-3">
          {title}
        </motion.h2>
      </div>

      {lead && !action && (
        <motion.p variants={fadeUp} className="public-copy max-w-2xl lg:ml-auto">
          {lead}
        </motion.p>
      )}

      {action && (
        <motion.div variants={fadeUp} className="shrink-0">
          {action}
        </motion.div>
      )}

      <motion.div
        variants={drawRule}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-slate-200"
      />
    </motion.div>
  );
}
