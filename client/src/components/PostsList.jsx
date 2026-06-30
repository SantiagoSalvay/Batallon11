import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '../services/api.js';
import { safeText } from '../lib/safeText.js';

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatDateShort(d) {
  try {
    return new Date(d).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function postImages(post) {
  if (Array.isArray(post.images) && post.images.length > 0) return post.images;
  return post.imageUrl ? [{ id: `${post.id}-cover`, imageUrl: post.imageUrl }] : [];
}

export default function PostsList({
  title,
  posts = [],
  emptyText = 'Proximamente publicaciones.',
  showViewAll = false,
  compact = false,
  maxItems,
  viewAllLink,
  viewAllLabel = 'Ver mas publicaciones',
  viewAllThreshold = 4,
  animate = true,
}) {
  const [activePost, setActivePost] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const visiblePosts = maxItems != null ? posts.slice(0, maxItems) : posts;
  const showMoreLink = viewAllLink && posts.length > viewAllThreshold;
  const activeImages = activePost ? postImages(activePost) : [];
  const activeImage = activeImages[activeImageIndex] || activeImages[0];

  const openPost = (post) => {
    setActivePost(post);
    setActiveImageIndex(0);
  };

  const closePost = () => {
    setActivePost(null);
    setActiveImageIndex(0);
  };

  const moveImage = (direction) => {
    setActiveImageIndex((current) => {
      if (activeImages.length === 0) return 0;
      return (current + direction + activeImages.length) % activeImages.length;
    });
  };

  const gridClass = compact
    ? 'mt-6 grid grid-cols-2 gap-3 sm:mt-8 lg:mt-8 lg:grid-cols-3 lg:gap-5'
    : 'mt-8 grid gap-5 lg:grid-cols-3';

  return (
    <section id="publicaciones" className="public-section py-16 sm:py-24">
      <div className="container-app">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="public-eyebrow">Cartelera</span>
            <h2 className="public-title mt-3">{title || 'Ultimas novedades'}</h2>
          </div>

          {(showViewAll && posts.length >= 3) || showMoreLink ? (
            <Link
              to={viewAllLink || '/publicaciones'}
              className={`inline-flex w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-blue-950 hover:text-blue-950 ${
                compact && showMoreLink ? 'hidden lg:inline-flex' : ''
              }`}
            >
              {showMoreLink ? viewAllLabel : 'Ver todas'}
            </Link>
          ) : null}
        </div>

        {visiblePosts.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          <div className={gridClass}>
            {visiblePosts.map((p, idx) => {
              const Card = animate ? motion.article : 'article';
              const motionProps = animate
                ? {
                    initial: { opacity: 0, y: 18 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.15 },
                    transition: { delay: idx * 0.04 },
                  }
                : {};
              const images = postImages(p);

              return (
                <Card
                  key={p.id}
                  {...motionProps}
                  className={`public-card overflow-hidden rounded-md ${
                    compact ? 'flex flex-col lg:block' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openPost(p)}
                    className="block h-full w-full text-left"
                  >
                    {p.imageUrl ? (
                      <div
                        className={`relative ${
                          compact
                            ? 'aspect-[4/3] overflow-hidden bg-slate-100 lg:aspect-[16/9]'
                            : 'aspect-[16/9] overflow-hidden bg-slate-100'
                        }`}
                      >
                        <img
                          src={asset(p.imageUrl)}
                          alt={safeText(p.title)}
                          className="h-full w-full object-cover transition hover:scale-105"
                          loading="lazy"
                        />
                        {images.length > 1 && (
                          <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-white">
                            {images.length} fotos
                          </span>
                        )}
                      </div>
                    ) : compact ? (
                      <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 px-2 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
                        Sin imagen
                      </div>
                    ) : null}
                    <div className={compact ? 'flex flex-1 flex-col p-3 lg:p-5' : 'p-5'}>
                      {compact ? (
                        <>
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-blue-950 lg:hidden">
                            {formatDateShort(p.createdAt)}
                          </div>
                          <div className="hidden text-xs font-bold uppercase tracking-[0.12em] text-blue-950 lg:block">
                            {formatDate(p.createdAt)}
                          </div>
                          <h3 className="mt-1 line-clamp-2 font-display text-sm font-extrabold leading-snug text-slate-950 lg:mt-2 lg:line-clamp-none lg:text-xl lg:leading-tight">
                            {safeText(p.title)}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 lg:mt-3 lg:line-clamp-4 lg:whitespace-pre-line lg:text-sm lg:leading-6 lg:text-slate-700">
                            {safeText(p.content)}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-blue-950">
                            {formatDate(p.createdAt)}
                          </div>
                          <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-slate-950">
                            {safeText(p.title)}
                          </h3>
                          <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                            {safeText(p.content)}
                          </p>
                        </>
                      )}
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        )}

        {showMoreLink && compact && (
          <div className="mt-6 flex justify-center lg:hidden">
            <Link
              to={viewAllLink}
              className="public-button-primary px-6 py-2.5 text-sm"
            >
              {viewAllLabel}
            </Link>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/90 px-4 py-6 text-white sm:px-6"
            onClick={closePost}
          >
            <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                className="w-full overflow-hidden rounded-md border border-white/10 bg-slate-950 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {activeImage && (
                  <div className="relative bg-black">
                    <img
                      src={asset(activeImage.imageUrl)}
                      alt={safeText(activePost.title)}
                      className="max-h-[70vh] w-full object-contain"
                    />
                    {activeImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => moveImage(-1)}
                          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-2xl font-bold text-white transition hover:bg-black"
                          aria-label="Foto anterior"
                        >
                          {'<'}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(1)}
                          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-2xl font-bold text-white transition hover:bg-black"
                          aria-label="Foto siguiente"
                        >
                          {'>'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-sky-300">
                        {formatDate(activePost.createdAt)}
                      </div>
                      <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight">
                        {safeText(activePost.title)}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closePost}
                      className="rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white/80 transition hover:bg-white hover:text-slate-950"
                    >
                      Cerrar
                    </button>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-200">
                    {safeText(activePost.content)}
                  </p>

                  {activeImages.length > 1 && (
                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                      {activeImages.map((img, index) => (
                        <button
                          key={img.id || `${activePost.id}-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border ${
                            index === activeImageIndex ? 'border-sky-300' : 'border-white/15'
                          }`}
                        >
                          <img
                            src={asset(img.imageUrl)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}