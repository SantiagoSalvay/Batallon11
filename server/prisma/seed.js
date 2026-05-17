require('dotenv').config();

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STAGES = [
  {
    name: 'Horneros y Pichones',
    slug: 'horneros-pichones',
    description:
      'Los más chicos descubren el mundo de los Exploradores a través del juego, la naturaleza y los valores.',
    color: '#F59E0B',
    order: 1,
  },
  {
    name: 'Caminantes y Chispistas',
    slug: 'caminantes-chispistas',
    description:
      'Etapa de aventura y descubrimiento, donde se fortalecen la amistad, el servicio y el contacto con la creación.',
    color: '#10B981',
    order: 2,
  },
  {
    name: 'Pioneros y Fuegos',
    slug: 'pioneros-fuegos',
    description:
      'Etapa de compromiso y liderazgo: proyectos propios, campamentos exigentes y vida en patrulla.',
    color: '#EF4444',
    order: 3,
  },
  {
    name: 'Rastreadores',
    slug: 'rastreadores',
    description:
      'Jóvenes que asumen el rol de guías, animadores y protagonistas dentro del batallón.',
    color: '#6366F1',
    order: 4,
  },
  {
    name: 'Baqueanos',
    slug: 'baqueanos',
    description:
      'Etapa de mayor compromiso: lideran, acompañan a las etapas menores y representan al batallón.',
    color: '#8B5CF6',
    order: 5,
  },
  {
    name: 'Soles',
    slug: 'soles',
    description:
      'Los Soles dan sus primeros pasos en el mundo de los Exploradores, descubriendo amigos, juegos y los valores de Don Bosco.',
    color: '#FBBF24',
    order: 6,
  },
];

const LEGACY_SLUGS_TO_REMOVE = ['rastreadores-baquianos'];

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Falta la variable de entorno ${name}. Definila en server/.env antes de correr el seed.`,
    );
  }
  return value;
}

async function main() {
  const email = requireEnv('ADMIN_EMAIL');
  const password = requireEnv('ADMIN_PASSWORD');

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: passwordHash,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Admin listo: ${admin.email}`);

  for (const legacy of LEGACY_SLUGS_TO_REMOVE) {
    const existing = await prisma.stage.findUnique({ where: { slug: legacy } });
    if (existing) {
      await prisma.stage.delete({ where: { slug: legacy } });
      // eslint-disable-next-line no-console
      console.log(`Etapa legacy eliminada: ${legacy}`);
    }
  }

  for (const stage of STAGES) {
    await prisma.stage.upsert({
      where: { slug: stage.slug },
      update: {
        name: stage.name,
        description: stage.description,
        color: stage.color,
        order: stage.order,
      },
      create: stage,
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Etapas creadas/actualizadas: ${STAGES.length}`);

  await prisma.heroSection.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: 'Batallón 11 General José María Paz',
      heroSubtitle: 'Exploradores Argentinos de Don Bosco',
      ctaText: 'Conocenos',
      ctaLink: '#etapas',
    },
  });
  // eslint-disable-next-line no-console
  console.log('Hero inicial listo');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
