const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');

async function listImagesBySlug(req, res, next) {
  try {
    const stage = await prisma.stage.findUnique({ where: { slug: req.params.slug } });
    if (!stage) return res.status(404).json({ message: 'Etapa no encontrada' });

    const images = await prisma.stageGalleryImage.findMany({
      where: { stageId: stage.id },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
}

async function listImagesByStageId(req, res, next) {
  try {
    const stageId = Number(req.query.stageId);
    if (!stageId) return res.status(400).json({ message: 'stageId requerido' });
    const images = await prisma.stageGalleryImage.findMany({
      where: { stageId },
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
    const { caption, order, stageId } = req.body;
    if (!stageId) return res.status(400).json({ message: 'stageId requerido' });

    const image = await prisma.stageGalleryImage.create({
      data: {
        imageUrl: fileToPublicUrl(req.file),
        caption: caption || null,
        order: order !== undefined ? Number(order) : 0,
        stageId: Number(stageId),
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
    const current = await prisma.stageGalleryImage.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });

    if (req.user?.role === 'COORDINATOR' && current.stageId !== req.user.stageId) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }

    const { caption, order, stageId } = req.body;
    const data = {
      ...(caption !== undefined && { caption }),
      ...(order !== undefined && { order: Number(order) }),
      ...(stageId !== undefined &&
        req.user?.role !== 'COORDINATOR' && { stageId: Number(stageId) }),
    };
    if (req.file) {
      data.imageUrl = fileToPublicUrl(req.file);
      deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    }
    const image = await prisma.stageGalleryImage.update({ where: { id }, data });
    res.json(image);
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.stageGalleryImage.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });
    if (req.user?.role === 'COORDINATOR' && current.stageId !== req.user.stageId) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }
    await prisma.stageGalleryImage.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listImagesBySlug,
  listImagesByStageId,
  createImage,
  updateImage,
  deleteImage,
};
