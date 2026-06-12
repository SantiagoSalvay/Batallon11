const {
  listStages,
  getStageBySlug,
  isValidStageSlug,
} = require('../../shared/stages');

function mergeStage(config) {
  if (!config) return null;
  return {
    slug: config.slug,
    name: config.name,
    motto: config.motto,
    emblemExplanation: config.emblemExplanation,
    description: config.description,
    color: config.color,
    order: config.order,
  };
}

function listStagesMerged() {
  return listStages().map((s) => mergeStage(s));
}

function getStageMergedBySlug(slug) {
  return mergeStage(getStageBySlug(slug));
}

module.exports = {
  listStages,
  getStageBySlug,
  isValidStageSlug,
  mergeStage,
  listStagesMerged,
  getStageMergedBySlug,
};
