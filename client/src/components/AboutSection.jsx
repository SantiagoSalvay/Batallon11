import { motion } from 'framer-motion';
import { fadeUp, inView, stagger } from '../lib/motion.js';

const VALUES = [
  {
    title: 'Vida de grupo',
    text: 'Los chicos aprenden compartiendo actividades, juegos, campamentos y responsabilidades concretas.',
  },
  {
    title: 'Formación',
    text: 'Cada etapa acompaña el crecimiento personal, comunitario y cristiano con el estilo de Don Bosco.',
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
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
          >
            <span className="public-eyebrow">Quiénes somos</span>
            <h2 className="public-title mt-3">
              Un batallón hecho de comunidad, camino y servicio.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            className="space-y-5"
          >
            <motion.p variants={fadeUp} className="public-copy">
              El Batallón 11 General José María Paz forma parte de los
              Exploradores Argentinos de Don Bosco. Es un espacio donde niños,
              adolescentes y jóvenes encuentran pertenencia, amistad, aventura y
              una propuesta de crecimiento con valores.
            </motion.p>
            <motion.p variants={fadeUp} className="public-copy">
              La vida del batallón se construye semana a semana: encuentros,
              juegos, celebraciones, caminatas, campamentos, proyectos y pequeños
              gestos de servicio que ayudan a crecer en grupo.
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-12 grid gap-4 md:grid-cols-3"
        >
          {VALUES.map((item) => (
            <motion.article
              key={item.title}
              variants={fadeUp}
              className="group public-card rounded-md p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-950/25 hover:shadow-md"
            >
              <div className="mb-4 h-1 w-12 rounded-full bg-blue-950 transition-all duration-300 group-hover:w-20" />
              <h3 className="font-display text-xl font-extrabold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {item.text}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
