const fs = require('fs');
const prisma = require('../config/prisma');
const { deleteOldFileFromUrl } = require('./fileUrl');
const { uploadDir } = require('../middleware/upload');

function normalizeRef(ref) {
  if (!ref || typeof ref !== 'string') return null;
  return ref.replace(/^\//, '');
}

/**
 * Cuenta cuántas filas de la base de datos siguen apuntando a una imagen.
 * Sirve para no borrar del storage un archivo que todavía se usa en otro
 * lugar (por ejemplo, una foto de publicación que también está en la galería).
 */
async function countImageRefs(ref) {
  const key = normalizeRef(ref);
  if (!key) return 0;
  const variants = [key, `/${key}`];

  const [pub, gal, galEtapa] = await Promise.all([
    prisma.imagenPublicacion.count({ where: { rutaOptimizada: { in: variants } } }),
    prisma.imagenGaleria.count({ where: { imageUrl: { in: variants } } }),
    prisma.imagenGaleriaEtapa.count({ where: { imageUrl: { in: variants } } }),
  ]);

  return pub + gal + galEtapa;
}

/**
 * Borra el archivo del storage (o disco) sólo si ninguna fila de la base de
 * datos lo sigue referenciando. Debe llamarse DESPUÉS de borrar las filas
 * correspondientes en la base.
 */
async function deleteImageIfUnused(ref) {
  if (!ref) return;
  const stillUsed = await countImageRefs(ref);
  if (stillUsed > 0) return;
  deleteOldFileFromUrl(fs, ref, uploadDir);
}

async function deleteImagesIfUnused(refs) {
  await Promise.all((refs || []).map((ref) => deleteImageIfUnused(ref)));
}

module.exports = { countImageRefs, deleteImageIfUnused, deleteImagesIfUnused };
