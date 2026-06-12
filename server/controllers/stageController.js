const prisma = require('../config/prisma');
const {
  listStagesMerged,
  getStageMergedBySlug,
} = require('../lib/stages');

async function listStages(_req, res, next) {
  try {
    res.json(listStagesMerged());
  } catch (err) {
    next(err);
  }
}

async function getStageBySlug(req, res, next) {
  try {
    const stage = getStageMergedBySlug(req.params.slug);
    if (!stage) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    let posts = [];
    let gallery = [];
    try {
      [posts, gallery] = await Promise.all([
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
    } catch (err) {
      console.warn('[stages] No se pudieron leer posts/galería de la etapa:', err.message);
    }

    res.json({ ...stage, posts, gallery });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStages,
  getStageBySlug,
};
