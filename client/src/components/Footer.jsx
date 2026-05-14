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
    <footer id="contacto" className="border-t border-white/10 bg-ink-900">
      <div className="container-app py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt="Batallón 11" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-display font-bold">Batallón 11</div>
              <div className="text-xs text-white/60">Gral. José María Paz</div>
            </div>
          </div>
          <p className="mt-4 text-white/60 text-sm max-w-xs">
            Exploradores Argentinos de Don Bosco. Formando jóvenes con valores, aventura y servicio.
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
          <ul className="space-y-1 text-sm text-white/70">
            <li>contacto@batallon11.com</li>
            <li>Instagram · @batallon11</li>
            <li>Facebook · Batallón 11</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-app py-4 text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Batallón 11 — Exploradores Argentinos de Don Bosco
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
          <span>Hecho con React + Express + Prisma + PostgreSQL.</span>
        </div>
      </div>
    </footer>
  );
}
