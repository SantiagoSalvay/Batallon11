import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Images,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { BRAND_LOGO } from '../lib/stageAssets.js';
import { localStageBySlug } from '../lib/stages.js';
import { roleInfo } from '../lib/roles.js';
import { EASE_OUT, fadeUp, stagger } from '../lib/motion.js';
import Seo from '../components/Seo.jsx';

/**
 * La navegación va agrupada: el contenido general y el contenido por etapa son
 * dos cosas distintas y antes aparecían mezcladas en una sola lista plana.
 */
const ADMIN_GROUPS = [
  {
    items: [{ to: '/admin', label: 'Resumen', end: true, Icon: LayoutDashboard }],
  },
  {
    title: 'Contenido general',
    items: [
      { to: '/admin/publicaciones', label: 'Publicaciones', Icon: FileText },
      { to: '/admin/galeria', label: 'Galería', Icon: Images },
      { to: '/admin/eventos', label: 'Eventos', Icon: CalendarDays },
    ],
  },
  {
    title: 'Contenido por etapa',
    items: [
      { to: '/admin/publicaciones-etapa', label: 'Publicaciones', Icon: Layers },
      { to: '/admin/galeria-etapa', label: 'Galerías', Icon: Images },
    ],
  },
];

const COORDINATOR_GROUPS = [
  {
    title: 'Mi etapa',
    items: [
      {
        to: '/admin/publicaciones-etapa',
        label: 'Publicaciones',
        end: true,
        Icon: FileText,
      },
      { to: '/admin/galeria-etapa', label: 'Galería', Icon: Images },
    ],
  },
];

function NavItem({ item, onNavigate }) {
  const { Icon } = item;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          isActive ? 'text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="admin-nav-active"
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="absolute inset-0 -z-10 rounded-lg border border-brand-500/30 bg-brand-500/20"
            />
          )}
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function NavGroups({ groups, onNavigate }) {
  return (
    <nav className="space-y-5">
      {groups.map((group, idx) => (
        <div key={group.title ?? `grupo-${idx}`}>
          {group.title && (
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
              {group.title}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCoordinator = user?.role === 'COORDINATOR';
  const groups = isCoordinator ? COORDINATOR_GROUPS : ADMIN_GROUPS;
  const role = roleInfo(user?.role);
  const stage = isCoordinator ? localStageBySlug(user?.stageSlug) : null;

  // El menú móvil no debe quedar abierto al cambiar de pantalla.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  const roleCard = (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${role.badgeClass}`}
      >
        <role.Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {role.label}
      </span>
      <p className="mt-2 text-xs leading-5 text-white/50">
        {stage ? `Etapa ${stage.name}` : role.scope}
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-ink-900 text-white">
      <Seo title="Administración" noindex />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/85 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
              className="-ml-2 rounded-lg p-2 text-white/70 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <Link to="/admin" className="flex min-w-0 items-center gap-3">
              <img
                src={BRAND_LOGO}
                alt=""
                className="h-9 w-9 shrink-0 object-contain"
              />
              <span className="min-w-0 leading-tight">
                <span className="block font-display text-sm font-bold">
                  Admin · Batallón 11
                </span>
                <span className="block truncate text-xs text-white/50">
                  {user?.email}
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="btn-ghost gap-1.5 text-sm">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Ver sitio</span>
            </Link>
            <button onClick={onLogout} className="btn-ghost gap-1.5 text-sm">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navegación en pantallas chicas */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="overflow-hidden border-b border-white/10 bg-ink-800/60 lg:hidden"
          >
            <div className="container-app space-y-4 py-4">
              {roleCard}
              <NavGroups groups={groups} onNavigate={() => setMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-app grid flex-1 gap-8 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate="visible"
            className="sticky top-24 space-y-5"
          >
            <motion.div variants={fadeUp}>{roleCard}</motion.div>
            <motion.div variants={fadeUp}>
              <NavGroups groups={groups} />
            </motion.div>
          </motion.div>
        </aside>

        <main className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
