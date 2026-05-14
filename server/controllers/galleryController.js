const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');

async function listImages(_req, res, next) {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
}

async function createImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'imagen requerida' });
    const { caption, order } = req.body;
    const image = await prisma.galleryImage.create({
      data: {
        imageUrl: fileToPublicUrl(req.file),
        caption: caption || null,
        order: order !== undefined ? Number(order) : 0,
      },
    });
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

async function updateImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.galleryImage.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });

    const { caption, order } = req.body;
    const data = {
      ...(caption !== undefined && { caption }),
      ...(order !== undefined && { order: Number(order) }),
    };
    if (req.file) {
      data.imageUrl = fileToPublicUrl(req.file);
      deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    }
    const image = await prisma.galleryImage.update({ where: { id }, data });
    res.json(image);
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.galleryImage.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });
    await prisma.galleryImage.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listImages, createImage, updateImage, deleteImage };
