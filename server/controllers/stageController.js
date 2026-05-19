const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const {
  isValidStageSlug,
  listStagesMerged,
  getStageMergedBySlug,
} = require('../lib/stages');

async function listStages(_req, res, next) {
  try {
    const stages = await listStagesMerged();
    res.json(stages);
  } catch (err) {
    next(err);
  }
}

async function getStageBySlug(req, res, next) {
  try {
    const stage = await getStageMergedBySlug(req.params.slug);
    if (!stage) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    const [posts, gallery] = await Promise.all([
      prisma.stagePost.findMany({
        where: { stageSlug: stage.slug, published: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.stageGalleryImage.findMany({
        where: { stageSlug: stage.slug },
        orderBy: { order: 'asc' },
      }),
    ]);

    res.json({ ...stage, posts, gallery });
  } catch (err) {
    next(err);
  }
}

async function updateStageMedia(req, res, next) {
  try {
    const { slug } = req.params;
    if (!isValidStageSlug(slug)) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    const current = await prisma.stageMedia.findUnique({ where: { slug } });
    const data = {};

    if (req.files?.logo?.[0]) {
      data.logoUrl = fileToPublicUrl(req.files.logo[0]);
      if (current?.logoUrl) deleteOldFileFromUrl(fs, current.logoUrl, uploadDir);
    }
    if (req.files?.coverImage?.[0]) {
      data.coverUrl = fileToPublicUrl(req.files.coverImage[0]);
      if (current?.coverUrl) deleteOldFileFromUrl(fs, current.coverUrl, uploadDir);
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({ message: 'Enviá logo y/o portada para actualizar' });
    }

    const media = await prisma.stageMedia.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });

    const merged = await getStageMergedBySlug(slug);
    res.json({ ...merged, media });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStages,
  getStageBySlug,
  updateStageMedia,
};
