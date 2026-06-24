const crypto = require('crypto');
const prisma = require('../config/prisma');
const { resolveStorageUrl } = require('./supabaseStorage');

const postInclude = {
  imagenes: { orderBy: { order: 'asc' }, take: 1 },
};

function toPostApi(row) {
  if (!row) return row;
  const { imagenes, ...rest } = row;
  const imageUrl = resolveStorageUrl(imagenes?.[0]?.rutaOptimizada ?? null);
  return { ...rest, imageUrl };
}

function toPostApiList(rows) {
  return rows.map(toPostApi);
}

async function setPostImage(publicacionId, imageUrl) {
  const existing = await prisma.imagenPublicacion.findFirst({
    where: { publicacionId },
    orderBy: { order: 'asc' },
  });

  if (existing) {
    await prisma.imagenPublicacion.update({
      where: { id: existing.id },
      data: { rutaOptimizada: imageUrl },
    });
    return existing.rutaOptimizada;
  }

  await prisma.imagenPublicacion.create({
    data: {
      id: crypto.randomUUID(),
      publicacionId,
      rutaOptimizada: imageUrl,
      order: 0,
    },
  });
  return null;
}

async function getPostImageUrl(publicacionId) {
  const img = await prisma.imagenPublicacion.findFirst({
    where: { publicacionId },
    orderBy: { order: 'asc' },
  });
  return img?.rutaOptimizada ?? null;
}

module.exports = {
  postInclude,
  toPostApi,
  toPostApiList,
  setPostImage,
  getPostImageUrl,
};
