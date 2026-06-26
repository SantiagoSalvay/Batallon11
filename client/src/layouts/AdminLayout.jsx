import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BRAND_LOGO } from '../lib/stageAssets.js';
import Seo from '../components/Seo.jsx';

const ADMIN_NAV = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/publicaciones', label: 'Publicaciones' },
  { to: '/admin/publicaciones-etapa', label: 'Publicaciones por etapa' },
  { to: '/admin/galeria', label: 'Galería' },
  { to: '/admin/galeria-etapa', label: 'Galerías por etapa' },
  { to: '/admin/eventos', label: 'Eventos' },
];

const COORDINATOR_NAV = [
  { to: '/admin/publicaciones-etapa', label: 'Publicaciones de mi etapa', end: true },
  { to: '/admin/galeria-etapa', label: 'Galería de mi etapa' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'COORDINATOR' ? COORDINATOR_NAV : ADMIN_NAV;

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-900 text-white">
      <Seo title="Administración" noindex />
      <header className="border-b border-white/10 bg-ink-900/80 backdrop-blur sticky top-0 z-30">
        <div className="container-app h-16 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt="Batallón 11" className="h-10 w-10 object-contain" />
            <div className="leading-tight">
              <div className="font-display font-bold text-sm">Admin · Batallón 11</div>
              <div className="text-xs text-white/50">{user?.email}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-ghost text-sm">Ver sitio</Link>
            <button onClick={onLogout} className="btn-ghost text-sm">Salir</button>
          </div>
        </div>
      </header>

      <div className="container-app py-8 grid lg:grid-cols-[260px_1fr] gap-8 flex-1">
        <aside>
          <nav className="card p-2 sticky top-24">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-brand-500/20 text-white border border-brand-500/30'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
