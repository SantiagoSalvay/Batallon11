// Mapeo slug -> logo en /public (fallback cuando el admin no subió logo propio).
// Si el admin sube un logo desde el dashboard, ese tiene prioridad.

export const STAGE_LOGOS = {
  soles: '/Logo_Soles.png',
  'horneros-pichones': '/Logo_Honeros_Pichones.jpg',
  'caminantes-chispistas': '/Logo_Caminantes_y_Chispistas.png',
  'pioneros-fuegos': '/Logo_Pioneros_y_Fuegos.png',
  rastreadores: '/Logo_Rastradores.png',
  baqueanos: '/Logo_Baqueanos.png',
};

export const BRAND_LOGO = '/LogoBatallon11.png';
export const EMBLEMA = '/Emblema-Mes.png';

export function logoForStage(stage) {
  if (!stage) return null;
  return stage.logo || STAGE_LOGOS[stage.slug] || null;
}
