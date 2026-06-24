import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { asset } from '../services/api.js';

function textoSeguro(valor) {
  return DOMPurify.sanitize(String(valor ?? ''), { ALLOWED_TAGS: [] });
}

function formatearFecha(fecha) {
  try {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function ImagenesPublicacion({ publicacion }) {
  const imagenes = publicacion.imagenes || [];
  if (!imagenes.length) return null;

  return (
    <div>
      <div className={`grid aspect-[16/9] overflow-hidden bg-slate-100 ${imagenes.length > 1 ? 'grid-cols-2 gap-px' : ''}`}>
        {imagenes.slice(0, 4).map((imagen, indice) => (
          <div key={imagen.id} className="relative min-h-0 overflow-hidden">
            <img
              src={asset(imagen.rutaOptimizada)}
              alt={`${publicacion.titulo} ${indice + 1}`}
              className="h-full w-full object-cover"
            />
            {indice === 3 && imagenes.length > 4 && (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/65 text-lg font-extrabold text-white">
                +{imagenes.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2">
        {imagenes.map((imagen, indice) => (
          <a
            key={imagen.id}
            href={asset(imagen.rutaOriginal || imagen.rutaOptimizada)}
            download={imagen.nombreOriginal || `imagen-${indice + 1}.webp`}
            className="text-xs font-semibold text-blue-950 underline-offset-2 hover:underline"
          >
            Descargar {indice + 1}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ListaPublicaciones({
  titulo,
  publicaciones = [],
  textoVacio = 'Proximamente habra publicaciones.',
  mostrarVerTodas = false,
}) {
  return (
    <section id="publicaciones" className="public-section py-16 sm:py-24">
      <div className="container-app">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="public-eyebrow">Cartelera</span>
            <h2 className="public-title mt-3">{titulo || 'Ultimas novedades'}</h2>
          </div>

          {mostrarVerTodas && publicaciones.length >= 3 && (
            <Link
              to="/publicaciones"
              className="inline-flex w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-blue-950 hover:text-blue-950"
            >
              Ver todas
            </Link>
          )}
        </div>

        {publicaciones.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">
            {textoVacio}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {publicaciones.map((publicacion, indice) => (
              <motion.article
                key={publicacion.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: indice * 0.04 }}
                className="public-card overflow-hidden rounded-md"
              >
                <ImagenesPublicacion publicacion={publicacion} />
                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-blue-950">
                    {formatearFecha(publicacion.creadaEn)}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-slate-950">
                    {textoSeguro(publicacion.titulo)}
                  </h3>
                  <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                    {textoSeguro(publicacion.contenido)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}