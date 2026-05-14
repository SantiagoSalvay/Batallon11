import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EMBLEMA } from '../lib/stageAssets.js';

const links = [
  { target: 'top', label: 'Inicio' },
  { target: 'etapas', label: 'Etapas' },
  { target: 'galeria', label: 'Galería' },
  { target: 'eventos', label: 'Eventos' },
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors ${
        scrolled
          ? 'bg-ink-900/80 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
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
            className="h-12 w-12 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.target}
              href={`#${l.target}`}
              onClick={(e) => handleNav(e, l.target)}
              className="px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          aria-label="Abrir menú"
          className="md:hidden p-2 rounded-lg bg-white/5"
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

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="md:hidden bg-ink-900/95 border-t border-white/10"
        >
          <div className="container-app py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.target}
                href={`#${l.target}`}
                onClick={(e) => handleNav(e, l.target)}
                className="px-3 py-2 rounded-lg text-white/80 hover:bg-white/5"
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
