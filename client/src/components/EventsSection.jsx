import { motion } from 'framer-motion';
import { asset } from '../services/api.js';

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function EventsSection({ events = [] }) {
  return (
    <section id="eventos" className="py-20 sm:py-28">
      <div className="container-app">
        <div className="max-w-2xl">
          <span className="badge mb-3">Agenda</span>
          <h2 className="section-title">Próximos eventos</h2>
          <p className="mt-3 text-white/70">
            Campamentos, salidas, encuentros y actividades del batallón.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="mt-10 text-white/50">No hay eventos programados por el momento.</div>
        ) : (
          <ul className="mt-10 space-y-4">
            {events.map((e, idx) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="card p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
              >
                <div className="flex-shrink-0 w-20 text-center rounded-xl bg-brand-500/15 border border-brand-500/30 p-3">
                  <div className="text-xs uppercase text-brand-300 font-bold">
                    {new Date(e.date).toLocaleDateString('es-AR', { month: 'short' })}
                  </div>
                  <div className="text-3xl font-extrabold">
                    {new Date(e.date).getDate()}
                  </div>
                </div>
                {e.image && (
                  <img
                    src={asset(e.image)}
                    alt={e.title}
                    className="h-20 w-28 object-cover rounded-xl"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{e.title}</h3>
                  <p className="text-sm text-white/70 mt-1 line-clamp-2">{e.description}</p>
                  <div className="mt-2 text-xs text-white/50 flex flex-wrap gap-3">
                    <span>{formatDate(e.date)}</span>
                    {e.location && <span>· {e.location}</span>}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
