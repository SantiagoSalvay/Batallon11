require('dotenv').config();

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const COORDINATORS = [
  { email: 'horneros@batallon11.com', slug: 'horneros-pichones', name: 'Coord. Horneros y Pichones' },
  { email: 'caminantes@batallon11.com', slug: 'caminantes-chispistas', name: 'Coord. Caminantes y Chispistas' },
  { email: 'pioneros@batallon11.com', slug: 'pioneros-fuegos', name: 'Coord. Pioneros y Fuegos' },
  { email: 'rastreadores@batallon11.com', slug: 'rastreadores', name: 'Coord. Rastreadores' },
  { email: 'baqueanos@batallon11.com', slug: 'baqueanos', name: 'Coord. Baqueanos' },
  { email: 'soles@batallon11.com', slug: 'soles', name: 'Coord. Soles' },
];

function generatePassword(length = 18) {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?';
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

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

  const resetCoordinators = process.argv.includes('--reset-coordinators');
  const stagesBySlug = new Map(
    (await prisma.stage.findMany()).map((s) => [s.slug, s]),
  );
  const newCredentials = [];

  for (const coord of COORDINATORS) {
    const stage = stagesBySlug.get(coord.slug);
    if (!stage) {
      console.warn(`Etapa no encontrada para ${coord.email} (slug ${coord.slug})`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email: coord.email } });

    if (existing && !resetCoordinators) {
      await prisma.user.update({
        where: { email: coord.email },
        data: { role: 'COORDINATOR', stageId: stage.id, name: coord.name },
      });
      console.log(`Coordinador ya existe (sin cambios de password): ${coord.email}`);
      continue;
    }

    const plainPassword = generatePassword(18);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await prisma.user.upsert({
      where: { email: coord.email },
      update: {
        password: passwordHash,
        role: 'COORDINATOR',
        stageId: stage.id,
        name: coord.name,
      },
      create: {
        email: coord.email,
        password: passwordHash,
        name: coord.name,
        role: 'COORDINATOR',
        stageId: stage.id,
      },
    });

    newCredentials.push({ email: coord.email, password: plainPassword, stage: stage.name });
  }

  if (newCredentials.length) {
    const credFile = path.resolve(__dirname, '..', '.coordinator-credentials.txt');
    const header = `# Credenciales de coordinadores generadas ${new Date().toISOString()}\n# GUARDÁ ESTE ARCHIVO EN UN LUGAR SEGURO. NO se vuelven a mostrar.\n\n`;
    const body = newCredentials
      .map((c) => `Etapa: ${c.stage}\nEmail: ${c.email}\nPassword: ${c.password}\n`)
      .join('\n');
    fs.appendFileSync(credFile, header + body);
    console.log('\n================= CREDENCIALES DE COORDINADORES =================');
    newCredentials.forEach((c) =>
      console.log(`  ${c.stage.padEnd(30)} ${c.email.padEnd(34)} ${c.password}`),
    );
    console.log(`\nGuardadas también en: ${credFile}`);
    console.log('==================================================================\n');
  }

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
