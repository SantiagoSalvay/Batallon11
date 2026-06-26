const prisma = require('../config/prisma');
const {
  listStagesMerged,
  getStageMergedBySlug,
} = require('../lib/stages');
const { postInclude, toPostApiList } = require('../utils/publicacionApi');
const { withResolvedImageUrlList } = require('../utils/fileUrl');

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
        prisma.imagenGaleriaEtapa.findMany({
          where: { stageSlug: stage.slug },
          orderBy: { order: 'asc' },
        }),
      ]);
      posts = toPostApiList(posts);
      gallery = withResolvedImageUrlList(gallery);
    } catch (err) {
      console.warn('[stages] No se pudieron leer posts/galería de la etapa:', err.message);
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
