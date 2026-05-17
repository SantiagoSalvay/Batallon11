import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGO, EMBLEMA } from '../lib/stageAssets.js';
import { requestAdminAccess } from '../lib/adminAccess.js';

// Tailwind md breakpoint
const MOBILE_BREAKPOINT = 768;

export default function Footer() {
  const navigate = useNavigate();

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

  return (
    <footer className="border-t border-white/10 bg-ink-900">
      {/* ===== Desktop (md+) ===== */}
      <div className="hidden md:grid container-app py-12 gap-8 grid-cols-3 text-left">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_LOGO}
              alt="Batallón 11"
              className="h-12 w-12 object-contain"
            />
            <div>
              <div className="font-display font-bold">Batallón 11</div>
              <div className="text-xs text-white/60">Gral. José María Paz</div>
            </div>
          </div>
          <p className="mt-4 text-white/60 text-sm max-w-xs">
            Exploradores Argentinos de Don Bosco. Formando jóvenes con valores,
            aventura y servicio.
          </p>
          <img
            src={EMBLEMA}
            alt="Emblema EADB"
            className="mt-6 h-16 w-16 object-contain opacity-80"
          />
        </div>

        <div>
          <h4 className="font-semibold mb-3">Etapas</h4>
          <ul className="space-y-1 text-sm text-white/70">
            <li>Horneros y Pichones</li>
            <li>Caminantes y Chispistas</li>
            <li>Pioneros y Fuegos</li>
            <li>Rastreadores</li>
            <li>Baqueanos</li>
            <li>Soles</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Contacto</h4>
          <ul className="space-y-1 text-sm text-white/70 break-words">
            <li>contacto@batallon11.com</li>
            <li>Instagram · @batallon11</li>
            <li>Facebook · Batallón 11</li>
          </ul>
        </div>
      </div>

      {/* ===== Mobile (< md) ===== */}
      <div className="md:hidden container-app py-10 flex flex-col items-center gap-8 text-center">
        <div>
          <div className="font-display font-bold text-lg">Batallón 11</div>
          <div className="text-xs text-white/60">Gral. José María Paz</div>
          <p className="mt-3 text-white/60 text-sm max-w-xs mx-auto">
            Exploradores Argentinos de Don Bosco. Formando jóvenes con valores,
            aventura y servicio.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
          <div>
            <h4 className="font-semibold mb-3 text-sm">Etapas</h4>
            <ul className="space-y-1 text-xs text-white/70">
              <li>Horneros y Pichones</li>
              <li>Caminantes y Chispistas</li>
              <li>Pioneros y Fuegos</li>
              <li>Rastreadores</li>
              <li>Baqueanos</li>
              <li>Soles</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Contacto</h4>
            <ul className="space-y-1 text-xs text-white/70 break-words">
              <li>contacto@batallon11.com</li>
              <li>Instagram · @batallon11</li>
              <li>Facebook · Batallón 11</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2">
          <img
            src={BRAND_LOGO}
            alt="Batallón 11"
            className="h-16 w-16 object-contain"
          />
          <img
            src={EMBLEMA}
            alt="Emblema EADB"
            onClick={handleEmblemaClick}
            draggable={false}
            className="h-16 w-16 object-contain opacity-90 cursor-pointer select-none"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app py-4 text-xs text-white/50 text-center">
          <span>
            © {new Date().getFullYear()} Batallón 11 — Exploradores Argentinos
            de Don Bosco.
          </span>
        </div>
      </div>
    </footer>
  );
}
