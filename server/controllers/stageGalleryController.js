const prisma = require('../config/prisma');
const {
  fileToStorageReference,
  withResolvedImageUrl,
  withResolvedImageUrlList,
} = require('../utils/fileUrl');
const { deleteImageIfUnused } = require('../utils/imageRefs');
const { isValidStageSlug } = require('../lib/stages');
const { audit } = require('../utils/auditLog');
const { dailySeed, dailyShuffle } = require('../utils/dailyShuffle');

function parseLimit(value, fallback = 12, max = 48) {
  const limit = Number(value);
  if (!Number.isFinite(limit) || limit <= 0) return fallback;
  return Math.min(Math.trunc(limit), max);
}

async function listMixedImages(req, res, next) {
  try {
    const limit = parseLimit(req.query.limit);
    const seed = dailySeed();
    const images = await prisma.imagenGaleriaEtapa.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    const mixed = dailyShuffle(images, {
      seed,
      identity: (img) => `${img.stageSlug}:${img.id}:${img.imageUrl}`,
    }).slice(0, limit);

    res.json(withResolvedImageUrlList(mixed));
  } catch (err) {
    next(err);
  }
}

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
    }
    const image = await prisma.imagenGaleriaEtapa.update({ where: { id }, data });
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
    const current = await prisma.imagenGaleriaEtapa.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Imagen no encontrada' });
    if (req.user?.role === 'COORDINATOR' && current.stageSlug !== req.user.stageSlug) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }
    await prisma.imagenGaleriaEtapa.delete({ where: { id } });
    await deleteImageIfUnused(current.imageUrl);
    audit(req, 'stage_gallery.delete', { imageId: id, stageSlug: current.stageSlug });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMixedImages,
  listImagesBySlug,
  listImagesByStageSlug,
  createImage,
  updateImage,
  deleteImage,
};
