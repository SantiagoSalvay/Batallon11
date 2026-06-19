import { motion } from 'framer-motion';

const LEADERS = [
  {
    name: 'German Giron',
    role: 'Jefe de Batallon',
    phone: '5493513501850',
  },
  {
    name: 'Facundo Zamora',
    role: 'Jefe de Batallon',
    phone: '5493518001065',
  },
];

const WHATSAPP_MESSAGE = 'Hola, tengo una consulta sobre el Batallon 11.';

function buildWhatsAppUrl(phone) {
  const digits = phone.replace(/\D/g, '');
  const text = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${digits}?text=${text}`;
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.94 11.94 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L.05 24l6.4-1.68a11.82 11.82 0 005.6 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.17-1.23-6.14-3.38-8.43zm-8.48 18.2h-.01a9.81 9.81 0 01-5-1.37l-.36-.21-3.8 1 .99-3.7-.23-.38a9.83 9.83 0 1118.16-5.27c0 5.43-4.42 9.86-9.86 9.86zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.47s1.05 2.86 1.2 3.06c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.34z" />
    </svg>
  );
}

export default function ContactSection() {
  return (
    <section id="contacto" className="bg-slate-950 text-white">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-80 overflow-hidden lg:min-h-[560px]">
          <img
            src="/Seccion_Contacto.jpg"
            alt=""
            className="h-full w-full object-cover object-top lg:absolute lg:inset-0"
          />
          <div className="absolute inset-0 bg-slate-950/20" />
        </div>

        <div className="flex items-center px-4 py-16 sm:px-8 lg:px-14 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
              Contacto
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Hablemos con alguien del batallon
            </h2>
            <p className="mt-4 text-base leading-7 text-white/75">
              Para consultas sobre actividades, inscripciones o acercarte por
              primera vez, podes escribir directamente por WhatsApp.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {LEADERS.map((leader, idx) => (
                <motion.a
                  key={leader.name}
                  href={buildWhatsAppUrl(leader.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="rounded-md border border-white/15 bg-white/5 p-5 transition hover:border-emerald-400/60 hover:bg-emerald-500/10"
                >
                  <div className="flex items-center gap-3">
                    <WhatsAppIcon className="h-6 w-6 text-emerald-300" />
                    <div>
                      <div className="font-display font-extrabold">{leader.name}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
                        {leader.role}
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
