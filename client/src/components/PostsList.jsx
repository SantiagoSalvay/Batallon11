import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { asset } from '../services/api.js';

function safeText(value) {
  return DOMPurify.sanitize(String(value ?? ''), { ALLOWED_TAGS: [] });
}

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

export default function PostsList({
  title,
  posts = [],
  emptyText = 'Próximamente habrá publicaciones.',
  showViewAll = false,
}) {
  return (
    <section id="publicaciones" className="public-section py-16 sm:py-24">
      <div className="container-app">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="public-eyebrow">Cartelera</span>
            <h2 className="public-title mt-3">{title || 'Últimas novedades'}</h2>
          </div>

          {showViewAll && posts.length >= 3 && (
            <Link
              to="/publicaciones"
              className="inline-flex w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-blue-950 hover:text-blue-950"
            >
              Ver todas
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {posts.map((p, idx) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="public-card overflow-hidden rounded-md"
              >
                {p.imageUrl && (
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={asset(p.imageUrl)}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-blue-950">
                    {formatDate(p.createdAt)}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-slate-950">
                    {safeText(p.title)}
                  </h3>
                  <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                    {safeText(p.content)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
