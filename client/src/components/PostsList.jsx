import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '../services/api.js';
import { safeText } from '../lib/safeText.js';
import ZoomableImage from './ZoomableImage.jsx';

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
  const [showPostDetails, setShowPostDetails] = useState(true);
  const [previewImageIndexes, setPreviewImageIndexes] = useState({});
  const visiblePosts = maxItems != null ? posts.slice(0, maxItems) : posts;
  const showMoreLink = viewAllLink && posts.length > viewAllThreshold;
  const activeImages = activePost ? postImages(activePost) : [];
  const activeImage = activeImages[activeImageIndex] || activeImages[0];

  const openPost = (post) => {
    setActivePost(post);
    setActiveImageIndex(previewImageIndexes[post.id] || 0);
    setShowPostDetails(true);
  };

  const closePost = () => {
    setActivePost(null);
    setActiveImageIndex(0);
    setShowPostDetails(true);
  };

  const moveImage = (direction) => {
    setActiveImageIndex((current) => {
      if (activeImages.length === 0) return 0;
      return (current + direction + activeImages.length) % activeImages.length;
    });
  };

  const movePreviewImage = (event, postId, total, direction) => {
    event.stopPropagation();
    if (total <= 1) return;
    setPreviewImageIndexes((current) => {
      const nextIndex = ((current[postId] || 0) + direction + total) % total;
      return { ...current, [postId]: nextIndex };
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
              const previewImageIndex = previewImageIndexes[p.id] || 0;
              const previewImage = images[previewImageIndex] || images[0];
              const previewImageUrl = previewImage?.imageUrl || p.imageUrl;

              return (
                <Card
                  key={p.id}
                  {...motionProps}
                  className={`public-card overflow-hidden rounded-md ${
                    compact ? 'flex flex-col lg:block' : ''
                  }`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openPost(p)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') openPost(p);
                    }}
                    className="block h-full w-full cursor-pointer text-left"
                  >
                    {previewImageUrl ? (
                      <div
                        className={`relative ${
                          compact
                            ? 'aspect-[4/3] overflow-hidden bg-slate-950 lg:aspect-[16/9]'
                            : 'aspect-[16/9] overflow-hidden bg-slate-950'
                        }`}
                      >
                        <img
                          src={asset(previewImageUrl)}
                          alt={safeText(p.title)}
                          className="h-full w-full object-cover object-center transition hover:scale-105"
                          loading="lazy"
                        />
                        {images.length > 1 && (
                          <>
                            <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-white">
                              {previewImageIndex + 1}/{images.length}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => movePreviewImage(e, p.id, images.length, -1)}
                              className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition hover:bg-black/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                              aria-label="Foto anterior"
                            >
                              <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => movePreviewImage(e, p.id, images.length, 1)}
                              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition hover:bg-black/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                              aria-label="Foto siguiente"
                            >
                              <ChevronRight className="h-6 w-6" strokeWidth={2.2} />
                            </button>
                          </>
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
                  </div>
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
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {activeImage && (
                  <div className="relative">
                    <ZoomableImage
                      src={asset(activeImage.imageUrl)}
                      alt={safeText(activePost.title)}
                      imageKey={activeImage.id || activeImage.imageUrl}
                      className="h-[70vh] w-full"
                      onClose={closePost}
                    >
                      {(imageBox) => (
                        <>
                          {activeImages.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveImage(-1)}
                                className="absolute z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition hover:bg-black/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                                style={{ left: imageBox.left + 8, top: imageBox.top + imageBox.height / 2 }}
                                aria-label="Foto anterior"
                                title="Foto anterior"
                              >
                                <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(1)}
                                className="absolute z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition hover:bg-black/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                                style={{ left: imageBox.left + imageBox.width - 48, top: imageBox.top + imageBox.height / 2 }}
                                aria-label="Foto siguiente"
                                title="Foto siguiente"
                              >
                                <ChevronRight className="h-6 w-6" strokeWidth={2.2} />
                              </button>
                            </>
                          )}

                          <div
                            className={`pointer-events-none absolute z-20 flex items-end px-6 pb-6 pt-20 ${
                              showPostDetails ? 'bg-gradient-to-t from-black/70 via-black/25 to-transparent' : ''
                            }`}
                            style={{ left: imageBox.left, top: imageBox.top, width: imageBox.width, height: imageBox.height }}
                          >
                            <div className="flex w-full items-end justify-between gap-4">
                              <AnimatePresence initial={false}>
                                {showPostDetails && (
                                  <motion.div
                                    key="post-details"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="max-w-3xl"
                                  >
                                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-sky-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                                      {formatDate(activePost.createdAt)}
                                    </div>
                                    <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                                      {safeText(activePost.title)}
                                    </h3>
                                    <p className="mt-3 max-h-28 overflow-hidden whitespace-pre-line text-sm leading-6 text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:max-h-36">
                                      {safeText(activePost.content)}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <button
                                type="button"
                                onClick={() => setShowPostDetails((current) => !current)}
                                className="pointer-events-auto ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-md text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition hover:bg-black/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                                aria-label={showPostDetails ? 'Ocultar texto' : 'Mostrar texto'}
                                title={showPostDetails ? 'Ocultar texto' : 'Mostrar texto'}
                              >
                                {showPostDetails ? (
                                  <ChevronDown className="h-6 w-6" strokeWidth={2.2} />
                                ) : (
                                  <ChevronUp className="h-6 w-6" strokeWidth={2.2} />
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </ZoomableImage>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}