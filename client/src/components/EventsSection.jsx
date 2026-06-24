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
    <section id="eventos" className="public-band py-16 sm:py-24">
      <div className="container-app">
        <div className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="public-eyebrow">Agenda</span>
            <h2 className="public-title mt-3">Próximas actividades</h2>
          </div>
          <p className="public-copy max-w-2xl lg:ml-auto">
            Campamentos, encuentros, salidas y momentos importantes de la vida
            del batallón.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-stone-50 px-5 py-8 text-sm text-slate-500">
            No hay eventos programados por el momento.
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {events.map((e, idx) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="grid gap-5 py-5 sm:grid-cols-[96px_1fr] sm:items-center lg:grid-cols-[96px_140px_1fr]"
              >
                <div className="w-24 rounded-md border border-blue-950/20 bg-blue-950 px-3 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                    {new Date(e.date).toLocaleDateString('es-AR', { month: 'short' })}
                  </div>
                  <div className="mt-1 text-3xl font-extrabold leading-none">
                    {new Date(e.date).getDate()}
                  </div>
                </div>

                {e.imageUrl && (
                  <img
                    src={asset(e.imageUrl)}
                    alt={e.title}
                    className="hidden h-24 w-32 rounded-md object-cover lg:block"
                  />
                )}

                <div>
                  <h3 className="font-display text-xl font-extrabold text-slate-950">
                    {e.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700">
                    {e.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    <span>{formatDate(e.date)}</span>
                    {e.location && <span>{e.location}</span>}
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
