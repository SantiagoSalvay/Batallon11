import { motion } from 'framer-motion';

function TextBlock({ text }) {
  if (!text) return null;
  return text.split('\n\n').map((paragraph, i) => (
    <p key={i} className="leading-7 text-slate-700">
      {paragraph}
    </p>
  ));
}

export default function StageInfoSection({ stage }) {
  if (!stage?.emblemExplanation && !stage?.description) return null;

  return (
    <section className="public-band py-16 sm:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-10 max-w-2xl sm:mb-12"
        >
          <span className="public-eyebrow">Conocé la etapa</span>
          <h2 className="public-title mt-3">Sobre {stage.name}</h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
          {stage.description && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-md border border-slate-200 bg-stone-50 p-6"
            >
              <h3 className="mb-4 font-display text-xl font-extrabold text-slate-950">
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
              className="rounded-md border border-slate-200 bg-stone-50 p-6"
            >
              <h3 className="mb-4 font-display text-xl font-extrabold text-slate-950">
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
