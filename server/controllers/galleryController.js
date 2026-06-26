const fs = require('fs');
const prisma = require('../config/prisma');
const {
  fileToStorageReference,
  withResolvedImageUrl,
  withResolvedImageUrlList,
  deleteOldFileFromUrl,
} = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { audit } = require('../utils/auditLog');
const { listCombinedHomeGallery } = require('../utils/galleryApi');

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

async function listPublicImages(_req, res, next) {
  try {
    const images = await listCombinedHomeGallery();
    res.json(images);
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
      deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    }
    const image = await prisma.imagenGaleria.update({ where: { id }, data });
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
    deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    audit(req, 'gallery.delete', { imageId: id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listImages, listPublicImages, createImage, updateImage, deleteImage };
