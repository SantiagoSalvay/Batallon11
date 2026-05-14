import { motion } from 'framer-motion';

export default function VideoSection({ video }) {
  if (!video?.videoUrl) return null;
  return (
    <section id="video" className="py-20 sm:py-28">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <span className="badge mb-3">Video institucional</span>
          <h2 className="section-title">{video.title || 'Conocenos'}</h2>
          {video.subtitle && <p className="mt-3 text-white/70">{video.subtitle}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-3xl overflow-hidden border border-white/10 shadow-glow aspect-video bg-black"
        >
          <iframe
            src={video.videoUrl}
            title={video.title || 'Video institucional'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </motion.div>
      </div>
    </section>
  );
}
