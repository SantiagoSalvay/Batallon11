import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BRAND_LOGO } from '../lib/stageAssets.js';

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
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled
          ? 'border-b border-slate-200 bg-stone-50/95 text-slate-950 shadow-sm backdrop-blur-md'
          : 'bg-gradient-to-b from-slate-950/70 to-transparent text-white'
      }`}
    >
      <div className="container-app flex h-16 items-center justify-between">
        <Link
          to="/"
          onClick={(e) => handleNav(e, 'top')}
          className="flex items-center gap-3"
          aria-label="Inicio"
        >
          <img
            src={BRAND_LOGO}
            alt="Batallon 11"
            className="h-11 w-11 object-contain"
          />
          <div className="hidden leading-tight sm:block">
            <div className="font-display text-sm font-extrabold">Batallon 11</div>
            <div
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                scrolled ? 'text-slate-600' : 'text-white/70'
              }`}
            >
              Gral. Jose Maria Paz
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.target}
              href={`#${l.target}`}
              onClick={(e) => handleNav(e, l.target)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                scrolled
                  ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          aria-label="Abrir menu"
          className={`rounded-md p-2 md:hidden ${
            scrolled ? 'bg-slate-200 text-slate-950' : 'bg-white/10 text-white'
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

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-slate-200 bg-stone-50 text-slate-950 shadow-lg md:hidden"
        >
          <div className="container-app flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.target}
                href={`#${l.target}`}
                onClick={(e) => handleNav(e, l.target)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200/70 hover:text-slate-950"
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
