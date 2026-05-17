import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section id="contacto" className="py-20 sm:py-28 bg-ink-900">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="badge mb-3">Comunicate</span>
          <h2 className="section-title">Contacto</h2>
        </motion.div>
      </div>
    </section>
  );
}
