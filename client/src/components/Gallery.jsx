import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '../services/api.js';

export default function Gallery({ title = 'Galería', images = [], whiteTitle = false }) {
  const [active, setActive] = useState(null);

  return (
    <section id="galeria" className="py-14 sm:py-20 bg-ink-900">
      <div className="container-app">
        <div className="max-w-2xl">
          <span className="badge mb-3">Galería</span>
          <h2 className={`section-title${whiteTitle ? ' text-white' : ''}`}>{title}</h2>
        </div>

        {images.length === 0 ? (
          <div className="mt-10 text-white/50">Próximamente imágenes.</div>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <motion.button
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setActive(img)}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/5"
              >
                <img
                  src={asset(img.imageUrl)}
                  alt={img.caption || ''}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-110 transition"
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-6"
            onClick={() => setActive(null)}
          >
            <motion.img
              key={active.id}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={asset(active.imageUrl)}
              alt={active.caption || ''}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
            />
            {active.caption && (
              <div className="absolute bottom-6 text-white/80 text-sm">{active.caption}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
