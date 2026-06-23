import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '../services/api.js';
import { safeText } from '../lib/safeText.js';

export default function Gallery({ title = 'Galeria', images = [] }) {
  const [active, setActive] = useState(null);

  return (
    <section id="galeria" className="public-band py-16 sm:py-24">
      <div className="container-app">
        <div className="max-w-2xl">
          <span className="public-eyebrow">Galeria</span>
          <h2 className="public-title mt-3">{title}</h2>
        </div>

        {images.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-stone-50 px-5 py-8 text-sm text-slate-500">
            Proximamente imagenes.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img, idx) => (
              <motion.button
                key={img.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setActive(img)}
                className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-100"
              >
                <img
                  src={asset(img.imageUrl)}
                  alt={safeText(img.caption) || ''}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
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
            className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-6"
            onClick={() => setActive(null)}
          >
            <motion.img
              key={active.id}
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              src={asset(active.imageUrl)}
              alt={safeText(active.caption) || ''}
              className="max-h-[85vh] max-w-[90vw] rounded-md shadow-2xl"
            />
            {active.caption && (
              <div className="absolute bottom-6 px-4 text-center text-sm text-white/80">
                {safeText(active.caption)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
