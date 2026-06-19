import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EMBLEMA } from '../lib/stageAssets.js';
import { usePageBackground } from '../context/PageBackgroundContext.jsx';

const links = [
  { target: 'top', label: 'Inicio' },
  { target: 'quienes-somos', label: 'Quienes somos' },
  { target: 'etapas', label: 'Etapas' },
  { target: 'conocenos', label: 'Visitarnos' },
  { target: 'contacto', label: 'Contacto' },
];

function scrollToTarget(target) {
  if (target === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(target);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function DarkModeToggle({ scrolled, darkMode }) {
  const { toggleDarkMode } = usePageBackground();

  const idleClass = darkMode
    ? 'text-white/85 hover:bg-white/10 hover:text-white'
    : 'text-white/85 hover:bg-white/10 hover:text-white';
  const scrolledClass = darkMode
    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
    : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950';

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
      title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      className={`rounded-md p-2 transition ${scrolled ? scrolledClass : idleClass}`}
    >
      {darkMode ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = usePageBackground();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleNav = (e, target) => {
    e.preventDefault();
    setOpen(false);

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: target } });
      return;
    }
    scrollToTarget(target);
  };

  const headerScrolledClass = darkMode
    ? 'border-b border-slate-800 bg-slate-950/95 text-white shadow-sm backdrop-blur-md'
    : 'border-b border-slate-200 bg-stone-50/95 text-slate-950 shadow-sm backdrop-blur-md';

  const headerIdleClass = darkMode
    ? 'bg-gradient-to-b from-black/80 to-transparent text-white'
    : 'bg-gradient-to-b from-slate-950/70 to-transparent text-white';

  const linkScrolledClass = darkMode
    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
    : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950';

  const linkIdleClass = 'text-white/85 hover:bg-white/10 hover:text-white';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? headerScrolledClass : headerIdleClass
      }`}
    >
      <div className="container-app flex h-16 items-center justify-between">
        <Link
          to="/"
          onClick={(e) => handleNav(e, 'top')}
          className="flex items-center"
          aria-label="Inicio"
        >
          <img
            src={EMBLEMA}
            alt="Exploradores Argentinos de Don Bosco"
            className="h-12 w-12 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
          />
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.target}
                href={`#${l.target}`}
                onClick={(e) => handleNav(e, l.target)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  scrolled ? linkScrolledClass : linkIdleClass
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <DarkModeToggle scrolled={scrolled} darkMode={darkMode} />

          <button
            aria-label="Abrir menu"
            className={`rounded-md p-2 md:hidden ${
              scrolled
                ? darkMode
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-950'
                : 'bg-white/10 text-white'
            }`}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d={open ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className={`border-t shadow-lg md:hidden ${
            darkMode
              ? 'border-slate-800 bg-slate-950 text-white'
              : 'border-slate-200 bg-stone-50 text-slate-950'
          }`}
        >
          <div className="container-app flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.target}
                href={`#${l.target}`}
                onClick={(e) => handleNav(e, l.target)}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                  darkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
