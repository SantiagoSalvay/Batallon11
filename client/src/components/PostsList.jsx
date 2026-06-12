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
  emptyText = 'Próximamente publicaciones.',
  showViewAll = false,
  whiteTitle = false,
}) {
  return (
    <section id="publicaciones" className="py-14 sm:py-20">
      <div className="container-app">
        <div className="max-w-2xl">
          <span className="badge mb-3">Publicaciones</span>
          <h2 className={`section-title${whiteTitle ? ' text-white' : ''}`}>
            {title || 'Últimas novedades'}
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="mt-10 text-white/50">{emptyText}</div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, idx) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="card hover:border-white/20 transition"
              >
                {p.imageUrl && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={asset(p.imageUrl)}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs text-white/50">{formatDate(p.createdAt)}</div>
                  <h3 className="mt-1 text-lg font-bold">{safeText(p.title)}</h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-3 whitespace-pre-line">
                    {safeText(p.content)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {showViewAll && posts.length >= 3 && (
          <div className="mt-8 text-center">
            <Link
              to="/publicaciones"
              className="text-xs text-white/45 hover:text-white/75 underline-offset-2 hover:underline transition"
            >
              ver todas las publicaciones
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
