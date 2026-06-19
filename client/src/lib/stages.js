// Etapas locales (misma fuente que el server: shared/stagesData.json).
// Permiten renderizar logos y titulos sin depender de la API ni de la base.
// Los logos locales se resuelven via STAGE_LOGOS en stageAssets.js.

import STAGES from '@shared/stagesData.json';

export const LOCAL_STAGES = [...STAGES].sort((a, b) => a.order - b.order);

export function localStageBySlug(slug) {
  return LOCAL_STAGES.find((s) => s.slug === slug) ?? null;
}
