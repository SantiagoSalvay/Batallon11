const fs = require('fs');
const prisma = require('../config/prisma');
const {
  fileToStorageReference,
  withResolvedImageUrl,
  withResolvedImageUrlList,
  deleteOldFileFromUrl,
} = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { isValidStageSlug } = require('../lib/stages');
const { audit } = require('../utils/auditLog');

async function listImagesBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    if (!isValidStageSlug(slug)) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    const images = await prisma.imagenGaleriaEtapa.findMany({
      where: { stageSlug: slug },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(withResolvedImageUrlList(images));
  } catch (err) {
    next(err);
  }
}

async function listImagesByStageSlug(req, res, next) {
  try {
    const stageSlug = req.query.stageSlug;
    if (!stageSlug) return res.status(400).json({ message: 'stageSlug requerido' });
    if (!isValidStageSlug(stageSlug)) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    const images = await prisma.imagenGaleriaEtapa.findMany({
      where: { stageSlug },
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
    const { caption, order, stageSlug } = req.body;
    if (!stageSlug) return res.status(400).json({ message: 'stageSlug requerido' });
    if (!isValidStageSlug(stageSlug)) {
      return res.status(400).json({ message: 'Etapa no válida' });
    }

    const image = await prisma.imagenGaleriaEtapa.create({
      data: {
        imageUrl: fileToStorageReference(req.file),
        caption: caption || null,
        order: order !== undefined ? Number(order) : 0,
        stageSlug,
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
    const current = await prisma.imagenGaleriaEtapa.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });

    if (req.user?.role === 'COORDINATOR' && current.stageSlug !== req.user.stageSlug) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }

    const { caption, order, stageSlug } = req.body;
    const data = {
      ...(caption !== undefined && { caption }),
      ...(order !== undefined && { order: Number(order) }),
      ...(stageSlug !== undefined &&
        req.user?.role !== 'COORDINATOR' && { stageSlug }),
    };
    if (stageSlug !== undefined && !isValidStageSlug(stageSlug)) {
      return res.status(400).json({ message: 'Etapa no válida' });
    }
    if (req.file) {
      data.imageUrl = fileToStorageReference(req.file);
      deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    }
    const image = await prisma.imagenGaleriaEtapa.update({ where: { id }, data });
    res.json(withResolvedImageUrl(image));
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.imagenGaleriaEtapa.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });
    if (req.user?.role === 'COORDINATOR' && current.stageSlug !== req.user.stageSlug) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }
    await prisma.imagenGaleriaEtapa.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    audit(req, 'stage_gallery.delete', { imageId: id, stageSlug: current.stageSlug });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listImagesBySlug,
  listImagesByStageSlug,
  createImage,
  updateImage,
  deleteImage,
};
