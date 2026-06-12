import { motion } from 'framer-motion';

function TextBlock({ text }) {
  if (!text) return null;
  return text.split('\n\n').map((paragraph, i) => (
    <p key={i} className="text-white/75 leading-relaxed">
      {paragraph}
    </p>
  ));
}

export default function StageInfoSection({ stage }) {
  if (!stage?.emblemExplanation && !stage?.description) return null;

  return (
    <section className="py-14 sm:py-20 bg-ink-950 border-t border-white/5">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl mb-10 sm:mb-12"
        >
          <span className="badge mb-3">Conocé la etapa</span>
          <h2 className="section-title text-white">Sobre {stage.name}</h2>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
          {stage.description && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                La etapa
              </h3>
              <div className="space-y-4">
                <TextBlock text={stage.description} />
              </div>
            </motion.div>
          )}

          {stage.emblemExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                Explicación del emblema
              </h3>
              <div className="space-y-4">
                <TextBlock text={stage.emblemExplanation} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
