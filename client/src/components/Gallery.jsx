import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '../services/api.js';
import { safeText } from '../lib/safeText.js';

function GalleryGrid({ images, animate, onSelect }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img, idx) => {
        const Btn = animate ? motion.button : 'button';
        const motionProps = animate
          ? {
              initial: { opacity: 0, scale: 0.98 },
              whileInView: { opacity: 1, scale: 1 },
              viewport: { once: true, amount: 0.15 },
              transition: { delay: idx * 0.03 },
            }
          : {};

        return (
          <Btn
            key={img.id}
            type="button"
            {...motionProps}
            onClick={() => onSelect(img)}
            className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-100"
          >
            <img
              src={asset(img.imageUrl)}
              alt={safeText(img.caption) || ''}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          </Btn>
        );
      })}
    </div>
  );
}

export default function Gallery({
  title = 'Galeria',
  images = [],
  carousel = false,
  maxItems,
  viewAllLink,
  viewAllLabel = 'Ver más fotos',
  viewAllThreshold = 4,
  animate = true,
}) {
  const [active, setActive] = useState(null);
  const visibleImages = maxItems != null ? images.slice(0, maxItems) : images;
  const showMoreLink = viewAllLink && images.length > viewAllThreshold;

  return (
    <section id="galeria" className="public-band py-16 sm:py-24">
      <div className="container-app">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="public-eyebrow">Galeria</span>
            <h2 className="public-title mt-3">{title}</h2>
          </div>

          {showMoreLink && (
            <Link
              to={viewAllLink}
              className={`w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-blue-950 hover:text-blue-950 ${
                carousel ? 'hidden lg:inline-flex' : 'inline-flex'
              }`}
            >
              {viewAllLabel}
            </Link>
          )}
        </div>

        {visibleImages.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-stone-50 px-5 py-8 text-sm text-slate-500">
            Proximamente imagenes.
          </div>
        ) : carousel ? (
          <>
            <div className="stage-gallery-carousel mt-6 lg:hidden">
              <div className="flex gap-3 overflow-x-auto overscroll-x-contain pb-3 pt-1 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch]">
                {visibleImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActive(img)}
                    className="group relative h-32 w-32 shrink-0 snap-start overflow-hidden rounded-md border border-slate-200 bg-slate-100"
                  >
                    <img
                      src={asset(img.imageUrl)}
                      alt={safeText(img.caption) || ''}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
              {showMoreLink && (
                <div className="mt-4 flex justify-center">
                  <Link
                    to={viewAllLink}
                    className="public-button-primary px-6 py-2.5 text-sm"
                  >
                    {viewAllLabel}
                  </Link>
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <GalleryGrid images={visibleImages} animate={animate} onSelect={setActive} />
            </div>
          </>
        ) : (
          <GalleryGrid images={visibleImages} animate={animate} onSelect={setActive} />
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
