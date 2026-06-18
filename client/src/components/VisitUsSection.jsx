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
    <section id="ubicacion" className="py-14 sm:py-20 relative overflow-hidden">
      <div className="container-app relative">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <span className="badge mb-3">Ubicación</span>
            <h2 className="section-title">Vení a conocernos</h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Encontranos en nuestra sede. Te esperamos para que conozcas el batallón y
              vivas la experiencia de los Exploradores Don Bosco.
            </p>

            <div className="mt-6 card p-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">Batallón 11 Gral. José María Paz</p>
                <p className="mt-1 text-sm text-white/60">Córdoba, Argentina</p>
              </div>
            </div>

            {BATTALION_MAP_OPEN_URL && (
              <a
                href={BATTALION_MAP_OPEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-4 text-sm inline-flex"
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
            className="relative mx-auto w-full max-w-2xl lg:max-w-none"
          >
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-brand-400/50 via-white/15 to-accent-500/40 shadow-glow">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-ink-900/80 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                  </span>
                  Nuestra sede
                </div>

                <div className="h-72 sm:h-80">
                  {BATTALION_MAP_EMBED_URL ? (
                    <iframe
                      title="Ubicación del Batallón 11"
                      src={BATTALION_MAP_EMBED_URL}
                      className="h-full w-full border-0 grayscale-[15%] contrast-[1.05] saturate-[1.1]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-white/50 text-sm">
                      Mapa próximamente — el link de Google Maps se configurará en breve.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
