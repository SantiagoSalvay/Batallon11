import { motion } from 'framer-motion';
import { BATTALION_MAP_EMBED_URL } from '../lib/siteConfig.js';

export default function VisitUsSection() {
  return (
    <section id="conocenos" className="py-14 sm:py-20 bg-ink-900">
      <div className="container-app">
        <div className="max-w-2xl">
          <span className="badge mb-3">Ubicación</span>
          <h2 className="section-title">Vení a conocernos</h2>
          <p className="mt-4 text-white/70">
            Encontranos en nuestra sede. Te esperamos para que conozcas el batallón y
            vivas la experiencia de los Exploradores Don Bosco.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 h-72 sm:h-80 bg-white/5"
        >
          {BATTALION_MAP_EMBED_URL ? (
            <iframe
              title="Ubicación del Batallón 11"
              src={BATTALION_MAP_EMBED_URL}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center px-6 text-center text-white/50 text-sm">
              Mapa próximamente — el link de Google Maps se configurará en breve.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
