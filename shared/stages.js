/**
 * Etapas fijas del batallón. Nombres, lemas y colores viven en código, no en la BD.
 * La base solo guarda URLs de logo/portada subidas (tabla stage_media).
 */

const STAGES = [
  {
    slug: 'horneros-pichones',
    name: 'Horneros y Pichones',
    motto: 'Pequeños pasos, grandes descubrimientos',
    description:
      'Los más chicos descubren el mundo de los Exploradores a través del juego, la naturaleza y los valores.',
    color: '#F59E0B',
    order: 1,
  },
  {
    slug: 'caminantes-chispistas',
    name: 'Caminantes y Chispistas',
    motto: 'Aventura, amistad y servicio',
    description:
      'Etapa de aventura y descubrimiento, donde se fortalecen la amistad, el servicio y el contacto con la creación.',
    color: '#10B981',
    order: 2,
  },
  {
    slug: 'pioneros-fuegos',
    name: 'Pioneros y Fuegos',
    motto: 'Compromiso y liderazgo en patrulla',
    description:
      'Etapa de compromiso y liderazgo: proyectos propios, campamentos exigentes y vida en patrulla.',
    color: '#EF4444',
    order: 3,
  },
  {
    slug: 'rastreadores',
    name: 'Rastreadores',
    motto: 'Guiar, animar y acompañar',
    description:
      'Jóvenes que asumen el rol de guías, animadores y protagonistas dentro del batallón.',
    color: '#6366F1',
    order: 4,
  },
  {
    slug: 'baqueanos',
    name: 'Baqueanos',
    motto: 'Liderar y representar al batallón',
    description:
      'Etapa de mayor compromiso: lideran, acompañan a las etapas menores y representan al batallón.',
    color: '#8B5CF6',
    order: 5,
  },
  {
    slug: 'soles',
    name: 'Soles',
    motto: 'Primeros pasos con Don Bosco',
    description:
      'Los Soles dan sus primeros pasos en el mundo de los Exploradores, descubriendo amigos, juegos y los valores de Don Bosco.',
    color: '#FBBF24',
    order: 6,
  },
];

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
