const STAGES = [
  {
    slug: 'horneros-pichones',
    name: 'Horneros y Pichones',
    motto: 'Pequenos pasos, grandes descubrimientos',
    description:
      'Los mas chicos descubren el mundo de los Exploradores a traves del juego, la naturaleza y los valores.',
    color: '#F59E0B',
    order: 1,
  },
  {
    slug: 'caminantes-chispistas',
    name: 'Caminantes y Chispistas',
    motto: 'Aventura, amistad y servicio',
    description:
      'Etapa de aventura y descubrimiento, donde se fortalecen la amistad, el servicio y el contacto con la creacion.',
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
    motto: 'Guiar, animar y acompanar',
    description:
      'Jovenes que asumen el rol de guias, animadores y protagonistas dentro del batallon.',
    color: '#6366F1',
    order: 4,
  },
  {
    slug: 'baqueanos',
    name: 'Baqueanos',
    motto: 'Liderar y representar al batallon',
    description:
      'Etapa de mayor compromiso: lideran, acompanan a las etapas menores y representan al batallon.',
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

export const LOCAL_STAGES = [...STAGES].sort((a, b) => a.order - b.order);

export function localStageBySlug(slug) {
  return LOCAL_STAGES.find((s) => s.slug === slug) ?? null;
}
