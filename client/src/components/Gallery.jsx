import { useEffect, useRef, useState } from 'react';
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

function GalleryCarouselArrow({ direction, onClick }) {
  const isPrev = direction === 'prev';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute ${
        isPrev ? 'left-0' : 'right-0'
      } top-1/2 z-10 grid h-14 w-10 -translate-y-1/2 place-items-center text-white/80 drop-shadow transition hover:text-white focus:outline-none`}
      aria-label={isPrev ? 'Foto anterior' : 'Foto siguiente'}
    >
      <span
        className={
          isPrev
            ? 'h-0 w-0 border-y-[10px] border-r-[15px] border-y-transparent border-r-current'
            : 'h-0 w-0 border-y-[10px] border-l-[15px] border-y-transparent border-l-current'
        }
      />
    </button>
  );
}

function GalleryCarousel({ images, onSelect }) {
  const trackRef = useRef(null);
  const itemRef = useRef(null);
  const [position, setPosition] = useState(images.length);
  const [itemStep, setItemStep] = useState(0);
  const [animateTrack, setAnimateTrack] = useState(true);
  const shouldLoop = images.length > 1;
  const carouselImages = shouldLoop ? [...images, ...images, ...images] : images;

  useEffect(() => {
    setAnimateTrack(false);
    setPosition(shouldLoop ? images.length : 0);

    const frame = window.requestAnimationFrame(() => setAnimateTrack(true));
    return () => window.cancelAnimationFrame(frame);
  }, [images.length, shouldLoop]);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const item = itemRef.current;
      if (!track || !item) return;

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      setItemStep(item.getBoundingClientRect().width + gap);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [images.length]);

  const restoreTransition = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimateTrack(true));
    });
  };

  const move = (step) => {
    if (!shouldLoop) return;
    setAnimateTrack(true);
    setPosition((current) => current + step);
  };

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || !shouldLoop) return;

    if (position >= images.length * 2) {
      setAnimateTrack(false);
      setPosition(position - images.length);
      restoreTransition();
    } else if (position < images.length) {
      setAnimateTrack(false);
      setPosition(position + images.length);
      restoreTransition();
    }
  };

  return (
    <div className="relative mt-8 overflow-hidden">
      {shouldLoop && (
        <>
          <GalleryCarouselArrow direction="prev" onClick={() => move(-1)} />
          <GalleryCarouselArrow direction="next" onClick={() => move(1)} />
        </>
      )}

      <div
        ref={trackRef}
        onTransitionEnd={handleTransitionEnd}
        className={`flex gap-3 sm:gap-4 ${
          animateTrack ? 'transition-transform duration-500 ease-out' : ''
        }`}
        style={{
          transform: itemStep ? `translate3d(${-position * itemStep}px, 0, 0)` : undefined,
          willChange: 'transform',
        }}
      >
        {carouselImages.map((img, idx) => (
          <button
            key={`${Math.floor(idx / images.length)}-${img.id}-${img.imageUrl}`}
            ref={idx === 0 ? itemRef : null}
            type="button"
            onClick={() => onSelect(img)}
            className="group relative aspect-[4/3] w-[82%] shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-sm sm:w-[54%] lg:w-[35%] xl:w-[31%]"
          >
            <img
              src={asset(img.imageUrl)}
              alt={safeText(img.caption) || ''}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Gallery({
  title = 'Galeria',
  images = [],
  carousel = false,
  layout = 'grid',
  maxItems,
  viewAllLink,
  viewAllLabel = 'Ver más fotos',
  viewAllThreshold = 4,
  animate = true,
}) {
  const [active, setActive] = useState(null);
  const visibleImages = maxItems != null ? images.slice(0, maxItems) : images;
  const showMoreLink = viewAllLink && images.length > viewAllThreshold;
  const showSlider = layout === 'carousel';

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
                carousel && !showSlider ? 'hidden lg:inline-flex' : 'inline-flex'
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
        ) : showSlider ? (
          <GalleryCarousel images={visibleImages} onSelect={setActive} />
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
