import { motion } from 'framer-motion';

const LEADERS = [
  {
    name: 'Germán Girón',
    role: 'Jefe de Batallón',
    phone: '5493513501850',
  },
  {
    name: 'Facundo Zamora',
    role: 'Jefe de Batallón',
    phone: '5493518001065',
  },
];

const WHATSAPP_MESSAGE = 'Hola, tengo una consulta sobre el Batallón 11.';

function buildWhatsAppUrl(phone) {
  const digits = phone.replace(/\D/g, '');
  const text = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${digits}?text=${text}`;
}

export default function ContactSection() {
  return (
    <section
      id="contacto"
      className="relative isolate min-h-[55vh] sm:min-h-screen flex items-center py-12 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src="/Seccion_Contacto.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/80 to-ink-900/90" />
      </div>

      <div className="container-app w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="badge mb-3">Comunicate</span>
          <h2 className="section-title">Contacto</h2>
          <p className="mt-4 text-white/80">
            Si tenés alguna consulta, podés comunicarte directamente con los jefes
            del batallón por WhatsApp.
          </p>
        </motion.div>

        <div className="mt-10 sm:mt-14 flex flex-row items-center justify-center gap-3 sm:gap-6">
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
              className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-2 sm:px-8 sm:py-4 text-sm sm:text-lg font-semibold text-emerald-200 hover:bg-emerald-500/25 hover:text-white transition shadow-lg shadow-emerald-500/10 whitespace-nowrap"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 sm:h-6 sm:w-6"
                aria-hidden="true"
              >
                <path d="M20.52 3.48A11.94 11.94 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L.05 24l6.4-1.68a11.82 11.82 0 005.6 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.17-1.23-6.14-3.38-8.43zm-8.48 18.2h-.01a9.81 9.81 0 01-5-1.37l-.36-.21-3.8 1 .99-3.7-.23-.38a9.83 9.83 0 1118.16-5.27c0 5.43-4.42 9.86-9.86 9.86zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.47s1.05 2.86 1.2 3.06c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.34z" />
              </svg>
              <span>{leader.name}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
