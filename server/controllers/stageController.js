const prisma = require('../config/prisma');
const {
  listStagesMerged,
  getStageMergedBySlug,
} = require('../lib/stages');
const { postInclude, toPostApiList } = require('../utils/publicacionApi');
const { listCombinedStageGallery } = require('../utils/galleryApi');

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
        prisma.publicacion.findMany({
          where: { stageSlug: stage.slug, published: true },
          include: postInclude,
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        listCombinedStageGallery(stage.slug),
      ]);
      posts = toPostApiList(posts);
    } catch (err) {
      console.warn('[stages] No se pudieron leer posts/galeria de la etapa:', err.message);
      return next(err);
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
