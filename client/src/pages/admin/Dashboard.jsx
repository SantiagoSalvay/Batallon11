import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

const cards = [
  { label: 'Etapas', key: 'stages', to: '/admin/etapas' },
  { label: 'Publicaciones generales', key: 'posts', to: '/admin/publicaciones' },
  { label: 'Imágenes en galería', key: 'gallery', to: '/admin/galeria' },
  { label: 'Eventos', key: 'events', to: '/admin/eventos' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.allSettled([
      api.get('/stages'),
      api.get('/posts'),
      api.get('/gallery'),
      api.get('/events'),
    ]).then(([s, p, g, e]) => {
      setStats({
        stages: s.status === 'fulfilled' ? s.value.data.length : 0,
        posts: p.status === 'fulfilled' ? p.value.data.length : 0,
        gallery: g.status === 'fulfilled' ? g.value.data.length : 0,
        events: e.status === 'fulfilled' ? e.value.data.length : 0,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Panel administrativo</h1>
      <p className="text-white/60 mt-1">Resumen del contenido del sitio.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.key} to={c.to} className="card p-5 hover:border-white/20 transition">
            <div className="text-xs uppercase tracking-wider text-white/50">{c.label}</div>
            <div className="mt-2 text-4xl font-extrabold text-gradient">
              {stats[c.key] ?? '—'}
            </div>
            <div className="mt-2 text-xs text-brand-300">Administrar →</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-bold">Acciones rápidas</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-brand-300 hover:underline" to="/admin/hero">Editar hero</Link></li>
            <li><Link className="text-brand-300 hover:underline" to="/admin/video">Cambiar video institucional</Link></li>
            <li><Link className="text-brand-300 hover:underline" to="/admin/publicaciones">Crear publicación</Link></li>
            <li><Link className="text-brand-300 hover:underline" to="/admin/eventos">Programar evento</Link></li>
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-bold">Sistema</h3>
          <p className="text-sm text-white/70 mt-2">
            Stack: React + Vite + TailwindCSS · Express + Prisma + PostgreSQL · JWT.
          </p>
          <p className="text-xs text-white/50 mt-2">
            Las imágenes se almacenan localmente en <code>/uploads</code>. Para producción, considerá un servicio de
            objetos (S3, R2, Supabase Storage).
          </p>
        </div>
      </div>
    </div>
  );
}
