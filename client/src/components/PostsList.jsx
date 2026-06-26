import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export default function PostsList({
  title,
  posts = [],
  emptyText = 'Proximamente publicaciones.',
  showViewAll = false,
  compact = false,
  maxItems,
  viewAllLink,
  viewAllLabel = 'Ver más publicaciones',
  viewAllThreshold = 4,
  animate = true,
}) {
  const visiblePosts = maxItems != null ? posts.slice(0, maxItems) : posts;
  const showMoreLink = viewAllLink && posts.length > viewAllThreshold;

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

              return (
                <Card
                  key={p.id}
                  {...motionProps}
                  className={`public-card overflow-hidden rounded-md ${
                    compact ? 'flex flex-col lg:block' : ''
                  }`}
                >
                  {p.imageUrl ? (
                    <div
                      className={
                        compact
                          ? 'aspect-[4/3] overflow-hidden bg-slate-100 lg:aspect-[16/9]'
                          : 'aspect-[16/9] overflow-hidden bg-slate-100'
                      }
                    >
                      <div className={`grid h-full ${p.images?.length > 1 ? 'grid-cols-2 gap-0.5' : ''}`}>
                        {(p.images?.length ? p.images : [{ imageUrl: p.imageUrl }]).slice(0, 4).map((image, imageIndex) => (
                          <img
                            key={image.id || imageIndex}
                            src={asset(image.imageUrl)}
                            alt={`${safeText(p.title)} ${imageIndex + 1}`}
                            className="h-full min-h-0 w-full object-cover"
                            loading="lazy"
                          />
                        ))}
                      </div>
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
    </section>
  );
}
