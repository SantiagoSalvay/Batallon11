import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Images,
  Layers,
  Plus,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { roleInfo } from '../../lib/roles.js';
import { LOCAL_STAGES } from '../../lib/stages.js';
import { EASE_OUT, fadeUp, stagger } from '../../lib/motion.js';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';

const CARDS = [
  {
    key: 'posts',
    label: 'Publicaciones generales',
    to: '/admin/publicaciones',
    Icon: FileText,
  },
  {
    key: 'gallery',
    label: 'Imágenes en galería',
    to: '/admin/galeria',
    Icon: Images,
  },
  {
    key: 'events',
    label: 'Eventos',
    to: '/admin/eventos',
    Icon: CalendarDays,
  },
];

const QUICK_ACTIONS = [
  { to: '/admin/publicaciones', label: 'Nueva publicación', Icon: Plus },
  { to: '/admin/eventos', label: 'Nuevo evento', Icon: CalendarDays },
  { to: '/admin/galeria', label: 'Subir fotos', Icon: Images },
];

/** Cuenta desde cero hasta el total, o lo muestra directo si se pidió menos movimiento. */
function CountUp({ value }) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return undefined;
    }
    const controls = animate(count, value, { duration: 0.9, ease: EASE_OUT });
    return () => controls.stop();
  }, [count, value, reduceMotion]);

  return <motion.span>{display}</motion.span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const role = roleInfo(user?.role);

  useEffect(() => {
    let cancelled = false;
    const count = (result) =>
      result.status === 'fulfilled' && Array.isArray(result.value.data)
        ? result.value.data.length
        : 0;

    Promise.allSettled([
      api.get('/posts'),
      api.get('/gallery'),
      api.get('/events'),
    ]).then(([p, g, e]) => {
      if (cancelled) return;
      setStats({ posts: count(p), gallery: count(g), events: count(e) });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Panel administrativo"
        description={`Resumen del contenido publicado en el sitio. ${role.scope}.`}
        badge={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${role.badgeClass}`}
          >
            <role.Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {role.label}
          </span>
        }
        actions={
          <Link to="/admin/publicaciones" className="btn-primary text-sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva publicación
          </Link>
        }
      />

      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CARDS.map((card) => (
          <motion.div key={card.key} variants={fadeUp}>
            <Link
              to={card.to}
              className="group flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-ink-800/60 p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  {card.label}
                </span>
                <card.Icon
                  className="h-5 w-5 shrink-0 text-white/30 transition-colors duration-300 group-hover:text-brand-300"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-4 font-display text-4xl font-extrabold tabular-nums text-white">
                {stats ? <CountUp value={stats[card.key]} /> : '—'}
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-300">
                Administrar
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-10"
      >
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
          Acciones rápidas
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} to={action.to} className="btn-ghost text-sm">
              <action.Icon className="h-4 w-4" aria-hidden="true" />
              {action.label}
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-extrabold">
              Contenido por etapa
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Cada etapa tiene sus propias publicaciones y su propia galería.
            </p>
          </div>
          <Link
            to="/admin/publicaciones-etapa"
            className="btn-ghost gap-1.5 text-sm"
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            Administrar etapas
          </Link>
        </div>

        <motion.ul
          variants={stagger(0.05)}
          initial="hidden"
          animate="visible"
          className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {LOCAL_STAGES.map((stage) => (
            <motion.li key={stage.slug} variants={fadeUp}>
              <Link
                to="/admin/publicaciones-etapa"
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-ink-800/40 px-4 py-3 transition duration-300 hover:border-white/15 hover:bg-ink-800"
              >
                <span
                  className="h-8 w-1 shrink-0 rounded-full transition-all duration-300 group-hover:h-10"
                  style={{ backgroundColor: stage.color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {stage.name}
                  </span>
                  <span className="block truncate text-xs text-white/45">
                    {stage.motto}
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-white/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60"
                  aria-hidden="true"
                />
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </motion.section>
    </div>
  );
}
