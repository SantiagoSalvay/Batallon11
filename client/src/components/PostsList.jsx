import { motion } from 'framer-motion';
import { asset } from '../services/api.js';

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

export default function PostsList({ title, posts = [], emptyText = 'Próximamente publicaciones.' }) {
  return (
    <section id="publicaciones" className="py-20 sm:py-28">
      <div className="container-app">
        <div className="max-w-2xl">
          <span className="badge mb-3">Publicaciones</span>
          <h2 className="section-title">{title || 'Últimas novedades'}</h2>
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
                {p.image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={asset(p.image)}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs text-white/50">{formatDate(p.createdAt)}</div>
                  <h3 className="mt-1 text-lg font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-3 whitespace-pre-line">
                    {p.content}
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
