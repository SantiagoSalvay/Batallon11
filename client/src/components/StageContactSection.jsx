import { motion } from 'framer-motion';

export const STAGE_COORDINATORS = {
  'horneros-pichones': [
    { name: 'Nicolás Murua', phone: '+54 9 3513 71-6359' },
    { name: 'Juana Pinedo', phone: '+54 9 3518 10-3147' },
  ],
  'caminantes-chispistas': [
    { name: 'José Fuentes', phone: '+54 9 3518 11-3684' },
    { name: 'Melina Pezzolo', phone: '+54 9 3512 63-6580' },
  ],
  'pioneros-fuegos': [
    { name: 'Santiago Salvay', phone: '+54 9 3518 57-9473' },
    { name: 'Natalia Rivadero', phone: '+54 9 3517 31-6024' },
  ],
  rastreadores: [
    { name: 'Ismael Varela', phone: '+54 9 3512 09-8166' },
    { name: 'Nicolás Estigarribia', phone: '+54 9 3516 74-7369' },
  ],
  baqueanos: [
    { name: 'Tomás Marino', phone: '+54 9 3513 27-3568' },
    { name: 'Mateo Junco', phone: '+54 9 3512 63-0605' },
  ],
};

function buildWhatsAppMessage(personName, stageName) {
  const firstName = (personName || '').trim().split(/\s+/)[0] || '';
  return `Hola ${firstName}, quisiera consultar para inscribir a mi hijo/a a la etapa ${stageName}.`;
}

function buildWhatsAppUrl(phone, message) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;
  const text = encodeURIComponent(message || '');
  return `https://wa.me/${digits}?text=${text}`;
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.94 11.94 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L.05 24l6.4-1.68a11.82 11.82 0 005.6 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.17-1.23-6.14-3.38-8.43zm-8.48 18.2h-.01a9.81 9.81 0 01-5-1.37l-.36-.21-3.8 1 .99-3.7-.23-.38a9.83 9.83 0 1118.16-5.27c0 5.43-4.42 9.86-9.86 9.86zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.47s1.05 2.86 1.2 3.06c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.34z" />
    </svg>
  );
}

export default function StageContactSection({ stage }) {
  if (!stage) return null;
  const coordinators = STAGE_COORDINATORS[stage.slug];
  if (!coordinators || coordinators.length === 0) return null;

  const color = stage.color || '#172554';

  return (
    <section id="contacto" className="public-section py-16 sm:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <span className="public-eyebrow">Contacto</span>
          <h2 className="public-title mt-3">Contacto de {stage.name}</h2>
          <p className="public-copy mt-4">
            Para consultas específicas de esta etapa, estos son sus referentes.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
          {coordinators.map((person, idx) => {
            const message = buildWhatsAppMessage(person.name, stage.name);
            const url = buildWhatsAppUrl(person.phone, message);
            const Tag = url ? motion.a : motion.span;
            const linkProps = url
              ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
              : { 'aria-disabled': 'true', title: 'Próximamente' };

            return (
              <Tag
                key={person.name}
                {...linkProps}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className={`rounded-md border bg-white p-5 shadow-sm transition ${
                  url
                    ? 'border-slate-200 hover:border-emerald-500'
                    : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: url ? '#047857' : color }}
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-slate-950">
                      {person.name}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {url ? 'WhatsApp' : 'Contacto próximamente'}
                    </div>
                  </div>
                </div>
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
}
