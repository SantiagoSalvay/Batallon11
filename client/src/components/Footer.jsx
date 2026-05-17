import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGO, EMBLEMA } from '../lib/stageAssets.js';
import { requestAdminAccess } from '../lib/adminAccess.js';

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

  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="container-app py-12 grid gap-10 md:gap-12 md:grid-cols-[1fr_auto] items-start text-center md:text-left">
        <div className="space-y-8">
          <div>
            <div className="font-display font-bold text-lg">Batallón 11</div>
            <div className="text-xs text-white/60">Gral. José María Paz</div>
            <p className="mt-3 text-white/60 text-sm max-w-md mx-auto md:mx-0">
              Exploradores Argentinos de Don Bosco. Formando jóvenes con
              valores, aventura y servicio.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 max-w-md mx-auto md:mx-0">
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
        </div>

        <div className="flex md:flex-col items-center justify-center gap-6 md:gap-5 md:pt-2">
          <img
            src={BRAND_LOGO}
            alt="Batallón 11"
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
          />
          <img
            src={EMBLEMA}
            alt="Emblema EADB"
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain opacity-90"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app py-4 text-xs text-white/50 text-center">
          <span>
            © {new Date().getFullYear()} Batallón 11 — Exploradores Argentinos
            de Don Bosco
            <button
              type="button"
              aria-label="."
              onClick={() => requestAdminAccess(navigate)}
              className="ml-1 text-white/50 hover:text-white/50 focus:outline-none cursor-default select-none"
              tabIndex={-1}
            >
              .
            </button>
          </span>
        </div>
      </div>
    </footer>
  );
}
