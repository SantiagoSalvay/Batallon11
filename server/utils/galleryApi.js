const prisma = require('../config/prisma');
const { resolveStorageUrl } = require('./supabaseStorage');

function serializeDirectGalleryImage(image, stageSlug = null) {
  return {
    id: `gallery:${image.id}`,
    source: 'gallery',
    galleryId: image.id,
    imageUrl: resolveStorageUrl(image.imageUrl),
    caption: image.caption,
    order: image.order,
    createdAt: image.createdAt,
    stageSlug: image.stageSlug ?? stageSlug,
  };
}

function serializePostImage(image) {
  const post = image.publicacion;
  return {
    id: `post:${image.id}`,
    source: 'post',
    postImageId: image.id,
    postId: post?.id ?? image.publicacionId,
    postTitle: post?.title ?? null,
    imageUrl: resolveStorageUrl(image.rutaOptimizada),
    caption: image.caption || post?.title || null,
    order: image.order,
    createdAt: image.createdAt,
    stageSlug: post?.stageSlug ?? null,
  };
}

function sortGalleryImages(images) {
  return images.sort((a, b) => {
    const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

async function listCombinedHomeGallery() {
  const [galleryImages, postImages] = await Promise.all([
    prisma.imagenGaleria.findMany({
      orderBy: [{ createdAt: 'desc' }, { order: 'asc' }],
    }),
    prisma.imagenPublicacion.findMany({
      where: { publicacion: { is: { published: true } } },
      include: {
        publicacion: {
          select: { id: true, title: true, stageSlug: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { order: 'asc' }],
    }),
  ]);

  return sortGalleryImages([
    ...galleryImages.map((image) => serializeDirectGalleryImage(image)),
    ...postImages.map(serializePostImage),
  ]);
}

async function listCombinedStageGallery(stageSlug) {
  const [galleryImages, postImages] = await Promise.all([
    prisma.imagenGaleriaEtapa.findMany({
      where: { stageSlug },
      orderBy: [{ createdAt: 'desc' }, { order: 'asc' }],
    }),
    prisma.imagenPublicacion.findMany({
      where: { publicacion: { is: { published: true, stageSlug } } },
      include: {
        publicacion: {
          select: { id: true, title: true, stageSlug: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { order: 'asc' }],
    }),
  ]);

  return sortGalleryImages([
    ...galleryImages.map((image) => serializeDirectGalleryImage(image, stageSlug)),
    ...postImages.map(serializePostImage),
  ]);
}

module.exports = {
  listCombinedHomeGallery,
  listCombinedStageGallery,
};
