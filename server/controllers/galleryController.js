const prisma = require('../config/prisma');
const {
  fileToStorageReference,
  withResolvedImageUrl,
  withResolvedImageUrlList,
} = require('../utils/fileUrl');
const { deleteImageIfUnused } = require('../utils/imageRefs');
const { audit } = require('../utils/auditLog');

async function listImages(_req, res, next) {
  try {
    const images = await prisma.imagenGaleria.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(withResolvedImageUrlList(images));
  } catch (err) {
    next(err);
  }
}

async function createImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'imagen requerida' });
    const { caption, order } = req.body;
    const image = await prisma.imagenGaleria.create({
      data: {
        imageUrl: fileToStorageReference(req.file),
        caption: caption || null,
        order: order !== undefined ? Number(order) : 0,
      },
    });
    res.status(201).json(withResolvedImageUrl(image));
  } catch (err) {
    next(err);
  }
}

async function updateImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.imagenGaleria.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });

    const { caption, order } = req.body;
    const data = {
      ...(caption !== undefined && { caption }),
      ...(order !== undefined && { order: Number(order) }),
    };
    if (req.file) {
      data.imageUrl = fileToStorageReference(req.file);
    }
    const image = await prisma.imagenGaleria.update({ where: { id }, data });
    if (req.file && data.imageUrl !== current.imageUrl) {
      await deleteImageIfUnused(current.imageUrl);
    }
    res.json(withResolvedImageUrl(image));
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.imagenGaleria.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });
    await prisma.imagenGaleria.delete({ where: { id } });
    await deleteImageIfUnused(current.imageUrl);
    audit(req, 'gallery.delete', { imageId: id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listImages, createImage, updateImage, deleteImage };
