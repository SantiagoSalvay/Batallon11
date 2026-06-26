const crypto = require('crypto');
const prisma = require('../config/prisma');
const { resolveStorageUrl } = require('./supabaseStorage');

const postInclude = {
  imagenes: { orderBy: { order: 'asc' } },
};

function toPostApi(row) {
  if (!row) return row;
  const { imagenes, ...rest } = row;
  const images = (imagenes || []).map((image) => ({
    id: image.id,
    imageUrl: resolveStorageUrl(image.rutaOptimizada),
    caption: image.caption,
    order: image.order,
  }));
  return { ...rest, imageUrl: images[0]?.imageUrl ?? null, images };
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

async function addPostImages(publicacionId, imageUrls) {
  if (!imageUrls.length) return;
  const count = await prisma.imagenPublicacion.count({ where: { publicacionId } });
  await prisma.imagenPublicacion.createMany({
    data: imageUrls.map((imageUrl, index) => ({
      id: crypto.randomUUID(),
      publicacionId,
      rutaOptimizada: imageUrl,
      order: count + index,
    })),
  });
}

async function getPostImageUrl(publicacionId) {
  const img = await prisma.imagenPublicacion.findFirst({
    where: { publicacionId },
    orderBy: { order: 'asc' },
  });
  return img?.rutaOptimizada ?? null;
}

async function getPostImageUrls(publicacionId) {
  const images = await prisma.imagenPublicacion.findMany({
    where: { publicacionId },
    orderBy: { order: 'asc' },
  });
  return images.map((image) => image.rutaOptimizada);
}

module.exports = {
  postInclude,
  toPostApi,
  toPostApiList,
  setPostImage,
  addPostImages,
  getPostImageUrl,
  getPostImageUrls,
};
