import { motion } from 'framer-motion';

const VALUES = [
  {
    title: 'Vida de grupo',
    text: 'Los chicos aprenden compartiendo actividades, juegos, campamentos y responsabilidades concretas.',
  },
  {
    title: 'Formacion',
    text: 'Cada etapa acompana el crecimiento personal, comunitario y cristiano con el estilo de Don Bosco.',
  },
  {
    title: 'Servicio',
    text: 'La experiencia exploradoril se completa sirviendo a otros y participando de la comunidad.',
  },
];

export default function AboutSection() {
  return (
    <section id="quienes-somos" className="public-section -mt-px py-16 sm:py-24">
      <div className="container-app">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="public-eyebrow">Quienes somos</span>
            <h2 className="public-title mt-3">
              Un batallon hecho de comunidad, camino y servicio.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="space-y-5"
          >
            <p className="public-copy">
              El Batallon 11 General Jose Maria Paz forma parte de los
              Exploradores Argentinos de Don Bosco. Es un espacio donde ninos,
              adolescentes y jovenes encuentran pertenencia, amistad, aventura y
              una propuesta de crecimiento con valores.
            </p>
            <p className="public-copy">
              La vida del batallon se construye semana a semana: encuentros,
              juegos, celebraciones, caminatas, campamentos, proyectos y pequenos
              gestos de servicio que ayudan a crecer en grupo.
            </p>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {VALUES.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="public-card rounded-md p-6"
            >
              <div className="mb-4 h-1 w-12 rounded-full bg-blue-950" />
              <h3 className="font-display text-xl font-extrabold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {item.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
