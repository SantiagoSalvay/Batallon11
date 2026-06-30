const crypto = require('crypto');
const prisma = require('../config/prisma');
const { resolveStorageUrl } = require('./supabaseStorage');

const MAX_POST_IMAGES = 6;

const postInclude = {
  imagenes: { orderBy: { order: 'asc' }, take: MAX_POST_IMAGES },
};

function toPostApi(row) {
  if (!row) return row;
  const { imagenes, ...rest } = row;
  const images = (imagenes || []).map((img) => ({
    id: img.id,
    imageUrl: resolveStorageUrl(img.rutaOptimizada),
    caption: img.caption,
    order: img.order,
  }));
  return { ...rest, imageUrl: images[0]?.imageUrl ?? null, images };
}

function toPostApiList(rows) {
  return rows.map(toPostApi);
}

async function setPostImages(publicacionId, imageUrls) {
  const nextImageUrls = imageUrls.filter(Boolean).slice(0, MAX_POST_IMAGES);
  if (nextImageUrls.length === 0) return [];

  const existing = await prisma.imagenPublicacion.findMany({
    where: { publicacionId },
    orderBy: { order: 'asc' },
  });
  const previousUrls = existing.map((img) => img.rutaOptimizada).filter(Boolean);

  await prisma.$transaction([
    prisma.imagenPublicacion.deleteMany({ where: { publicacionId } }),
    prisma.imagenPublicacion.createMany({
      data: nextImageUrls.map((imageUrl, index) => ({
        id: crypto.randomUUID(),
        publicacionId,
        rutaOptimizada: imageUrl,
        order: index,
      })),
    }),
  ]);

  return previousUrls;
}

async function setPostImage(publicacionId, imageUrl) {
  const previousUrls = await setPostImages(publicacionId, [imageUrl]);
  return previousUrls[0] ?? null;
}

async function getPostImageUrls(publicacionId) {
  const images = await prisma.imagenPublicacion.findMany({
    where: { publicacionId },
    orderBy: { order: 'asc' },
  });
  return images.map((img) => img.rutaOptimizada).filter(Boolean);
}

async function getPostImageUrl(publicacionId) {
  const urls = await getPostImageUrls(publicacionId);
  return urls[0] ?? null;
}

module.exports = {
  MAX_POST_IMAGES,
  postInclude,
  toPostApi,
  toPostApiList,
  setPostImage,
  setPostImages,
  getPostImageUrl,
  getPostImageUrls,
};