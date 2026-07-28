import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BRAND_LOGO, EMBLEMA } from '../lib/stageAssets.js';
import { requestAdminAccess } from '../lib/adminAccess.js';

const MOBILE_BREAKPOINT = 768;

const INFO_LINKS = [
  { target: 'top', label: 'Inicio' },
  { target: 'quienes-somos', label: 'Quienes somos' },
  { target: 'etapas', label: 'Etapas' },
  { target: 'conocenos', label: 'Ubicación' },
  { target: 'eventos', label: 'Eventos' },
  { target: 'contacto', label: 'Contacto' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', handle: '@batallon11', href: 'https://www.instagram.com/batallon11/' },
  { label: 'Facebook', handle: 'Batallon11Cordoba', href: 'https://www.facebook.com/Batallon11Cordoba/?locale=es_LA' },
  { label: 'TikTok', handle: '@batallon11cba', href: 'https://www.tiktok.com/@batallon11cba' },
];

function scrollToTarget(target) {
  if (target === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(target);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        requestAdminAccess(navigate);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const handleEmblemaClick = () => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      requestAdminAccess(navigate);
    }
  };

  const handleNavClick = (target) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: target } });
      return;
    }
    scrollToTarget(target);
  };

  return (
    <footer className="border-t border-slate-200 bg-stone-100 text-slate-900">
      <div className="container-app hidden gap-10 py-12 md:grid md:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div>
          <div className="flex items-center gap-4">
            <img
              src={BRAND_LOGO}
              alt="Batallon 11"
              className="h-14 w-14 object-contain"
            />
            <div>
              <div className="font-display text-lg font-extrabold">Batallon 11</div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Gral. Jose Maria Paz
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            Exploradores Argentinos de Don Bosco. Comunidad, formacion,
            aventura y servicio.
          </p>
          <img
            src={EMBLEMA}
            alt="Emblema EADB"
            onClick={handleEmblemaClick}
            draggable={false}
            className="mt-6 h-14 w-14 select-none object-contain opacity-80 md:cursor-default"
          />
        </div>

        <div>
          <h4 className="font-display font-extrabold">Informacion</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {INFO_LINKS.map((l) => (
              <li key={l.target}>
                <button
                  type="button"
                  onClick={() => handleNavClick(l.target)}
                  className="text-slate-600 transition hover:text-blue-950"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-extrabold">Contacto</h4>
          <ul className="mt-4 space-y-2 break-words text-sm text-slate-600">
            <li>contacto@batallon11.com</li>
            {SOCIAL_LINKS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-blue-950"
                >
                  {social.label} - {social.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950 text-white md:hidden">
        <div className="container-app flex flex-col items-center gap-8 py-10 text-center">
          <div>
            <div className="font-display text-lg font-bold">Batallon 11</div>
            <div className="text-xs text-white/60">Gral. Jose Maria Paz</div>
            <p className="mx-auto mt-3 max-w-xs text-sm text-white/60">
              Exploradores Argentinos de Don Bosco. Formando jovenes con valores,
              aventura y servicio.
            </p>
          </div>

          <div className="grid w-full max-w-sm grid-cols-2 gap-6 text-left">
            <div className="pl-4">
              <h4 className="mb-3 text-sm font-semibold">Informacion</h4>
              <ul className="space-y-1 text-xs">
                {INFO_LINKS.map((l) => (
                  <li key={l.target}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(l.target)}
                      className="text-white/70 transition hover:text-white"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold">Contacto</h4>
              <ul className="space-y-1 text-xs text-white/70">
                <li>contacto@batallon11.com</li>
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition hover:text-white"
                    >
                      {social.label} · {social.handle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <img
              src={BRAND_LOGO}
              alt="Batallon 11"
              className="h-16 w-16 object-contain"
            />
            <img
              src={EMBLEMA}
              alt="Emblema EADB"
              onClick={handleEmblemaClick}
              draggable={false}
              className="h-16 w-16 cursor-pointer select-none object-contain opacity-90"
            />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-app py-4 text-center text-xs text-white/50">
            {new Date().getFullYear()} Batallon 11 - Exploradores Argentinos de
            Don Bosco.
          </div>
        </div>
      </div>

      <div className="hidden border-t border-slate-200 md:block">
        <div className="container-app py-4 text-center text-xs text-slate-500">
          {new Date().getFullYear()} Batallon 11 - Exploradores Argentinos de
          Don Bosco.
        </div>
      </div>
    </footer>
  );
}
