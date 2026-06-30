// Logos de etapas en /public (fuente única; no se guardan en la base de datos).

export const STAGE_LOGOS = {
  soles: '/Logo_Soles.png',
  'horneros-pichones': '/Logo_Honeros_Pichones.jpg',
  'caminantes-chispistas': '/Logo_Caminantes_y_Chispistas.png',
  'pioneros-fuegos': '/Logo_Pioneros_y_Fuegos.png',
  rastreadores: '/Logo_Rastradores.png',
  baqueanos: '/Logo_Baqueanos.png',
};

// Color predominante real del logo (para el glow/luz que difumina alrededor).
export const STAGE_GLOW_COLORS = {
  soles: '#FBBF24',
  'horneros-pichones': '#16A34A',
  'caminantes-chispistas': '#65A30D',
  'pioneros-fuegos': '#F97316',
  rastreadores: '#DC2626',
  baqueanos: '#3a4c93',
};

// Factor de escala por etapa, para que TODOS los logos se vean del mismo tamaño
// visual (algunos archivos tienen mucho padding interno o son rectangulares).
export const STAGE_LOGO_SCALE = {
  soles: 1.05,
  'horneros-pichones': 1.1,
  'caminantes-chispistas': 1.2,
  'pioneros-fuegos': 1.28,
  rastreadores: 1.1,
  baqueanos: 1.2,
};

export const BRAND_LOGO = '/LogoBatallon11.png';
export const EMBLEMA = '/Emblema-Mes.png';

export function logoForStage(stage) {
  if (!stage) return null;
  return STAGE_LOGOS[stage.slug] || null;
}

export function glowColorForStage(stage) {
  if (!stage) return '#3458ff';
  return STAGE_GLOW_COLORS[stage.slug] || stage.color || '#3458ff';
}

export function logoScaleForStage(stage) {
  if (!stage) return 1;
  return STAGE_LOGO_SCALE[stage.slug] ?? 1;
}
