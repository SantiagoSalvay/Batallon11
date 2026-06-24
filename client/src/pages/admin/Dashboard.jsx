import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

const cards = [
  { label: 'Publicaciones generales', key: 'publicaciones', to: '/admin/publicaciones' },
  { label: 'ImÃ¡genes en galerÃ­a', key: 'gallery', to: '/admin/galeria' },
  { label: 'Eventos', key: 'events', to: '/admin/eventos' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.allSettled([
      api.get('/publicaciones', { params: { etapa: 'general', limite: 100 } }),
      api.get('/gallery'),
      api.get('/events'),
    ]).then(([p, g, e]) => {
      setStats({
        publicaciones: p.status === 'fulfilled' ? p.value.data.length : 0,
        gallery: g.status === 'fulfilled' ? g.value.data.length : 0,
        events: e.status === 'fulfilled' ? e.value.data.length : 0,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Panel administrativo</h1>
      <p className="text-white/60 mt-1">Resumen del contenido del sitio.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.key} to={c.to} className="card p-5 hover:border-white/20 transition">
            <div className="text-xs uppercase tracking-wider text-white/50">{c.label}</div>
            <div className="mt-2 text-4xl font-extrabold text-gradient">
              {stats[c.key] ?? 'â€”'}
            </div>
            <div className="mt-2 text-xs text-brand-300">Administrar â†’</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
