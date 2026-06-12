/**
 * Etapas fijas del batallón. Nombres, lemas, colores y descripciones viven en
 * stagesData.json (fuente compartida con el cliente). No hay tabla de etapas en la BD.
 */

const STAGES = require('./stagesData.json');

function listStages() {
  return [...STAGES].sort((a, b) => a.order - b.order);
}

function getStageBySlug(slug) {
  return STAGES.find((s) => s.slug === slug) ?? null;
}

function isValidStageSlug(slug) {
  return STAGES.some((s) => s.slug === slug);
}

module.exports = {
  STAGES,
  listStages,
  getStageBySlug,
  isValidStageSlug,
};
