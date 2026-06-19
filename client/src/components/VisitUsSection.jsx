import { motion } from 'framer-motion';
import {
  BATTALION_MAP_EMBED_URL,
  BATTALION_MAP_OPEN_URL,
} from '../lib/siteConfig.js';

function MapPinIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ExternalLinkIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function VisitUsSection() {
  return (
    <section id="conocenos" className="public-section py-16 sm:py-24">
      <div className="container-app">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="public-eyebrow">Visitarnos</span>
            <h2 className="public-title mt-3">Veni a conocer el batallon</h2>
            <p className="public-copy mt-4">
              Si queres acercarte, escribirnos o ubicar nuestra sede, aca tenes
              la informacion principal para dar el primer paso.
            </p>

            <div className="mt-7 rounded-md border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-950 text-white">
                  <MapPinIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold text-slate-950">
                    Batallon 11 Gral. Jose Maria Paz
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Cordoba, Argentina</p>
                </div>
              </div>
            </div>

            {BATTALION_MAP_OPEN_URL && (
              <a
                href={BATTALION_MAP_OPEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-blue-950 hover:text-blue-950"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Abrir en Google Maps
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              Nuestra sede
            </div>
            <div className="h-80">
              {BATTALION_MAP_EMBED_URL ? (
                <iframe
                  title="Ubicacion del Batallon 11"
                  src={BATTALION_MAP_EMBED_URL}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
                  Mapa proximamente. El link de Google Maps ya esta disponible.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
