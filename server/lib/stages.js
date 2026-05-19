const {
  listStages,
  getStageBySlug,
  isValidStageSlug,
} = require('../../shared/stages');
const prisma = require('../config/prisma');

async function getStageMediaMap() {
  const rows = await prisma.stageMedia.findMany();
  return new Map(rows.map((r) => [r.slug, r]));
}

function mergeStage(config, media) {
  if (!config) return null;
  return {
    slug: config.slug,
    name: config.name,
    motto: config.motto,
    description: config.description,
    color: config.color,
    order: config.order,
    logo: media?.logoUrl ?? null,
    coverImage: media?.coverUrl ?? null,
  };
}

async function listStagesMerged() {
  const mediaMap = await getStageMediaMap();
  return listStages().map((s) => mergeStage(s, mediaMap.get(s.slug)));
}

async function getStageMergedBySlug(slug) {
  const config = getStageBySlug(slug);
  if (!config) return null;
  const media = await prisma.stageMedia.findUnique({ where: { slug } });
  return mergeStage(config, media);
}

module.exports = {
  listStages,
  getStageBySlug,
  isValidStageSlug,
  mergeStage,
  listStagesMerged,
  getStageMergedBySlug,
};
