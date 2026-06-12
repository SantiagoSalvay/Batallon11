require('dotenv').config();

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { getStageBySlug } = require('../lib/stages');

const prisma = new PrismaClient();

const COORDINATORS = [
  {
    email: 'horneros@batallon11.com',
    slug: 'horneros-pichones',
    name: 'Coord. Horneros y Pichones',
    passwordEnv: 'COORD_HORNEROS_PASSWORD',
  },
  {
    email: 'caminantes@batallon11.com',
    slug: 'caminantes-chispistas',
    name: 'Coord. Caminantes y Chispistas',
    passwordEnv: 'COORD_CAMINANTES_PASSWORD',
  },
  {
    email: 'pioneros@batallon11.com',
    slug: 'pioneros-fuegos',
    name: 'Coord. Pioneros y Fuegos',
    passwordEnv: 'COORD_PIONEROS_PASSWORD',
  },
  {
    email: 'rastreadores@batallon11.com',
    slug: 'rastreadores',
    name: 'Coord. Rastreadores',
    passwordEnv: 'COORD_RASTREADORES_PASSWORD',
  },
  {
    email: 'baqueanos@batallon11.com',
    slug: 'baqueanos',
    name: 'Coord. Baqueanos',
    passwordEnv: 'COORD_BAQUEANOS_PASSWORD',
  },
  {
    email: 'soles@batallon11.com',
    slug: 'soles',
    name: 'Coord. Soles',
    passwordEnv: 'COORD_SOLES_PASSWORD',
  },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Falta la variable de entorno ${name}. Definila en server/.env antes de correr el seed.`,
    );
  }
  return value.trim();
}

async function main() {
  const email = requireEnv('ADMIN_EMAIL');
  const password = requireEnv('ADMIN_PASSWORD');
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      role: 'ADMIN',
      name: 'Administrador',
    },
    create: {
      email,
      password: passwordHash,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Admin listo: ${admin.email}`);

  for (const coord of COORDINATORS) {
    const stage = getStageBySlug(coord.slug);
    if (!stage) {
      console.warn(`Etapa no definida en código para ${coord.email} (slug ${coord.slug})`);
      continue;
    }

    const plainPassword = requireEnv(coord.passwordEnv);
    const coordHash = await bcrypt.hash(plainPassword, 10);

    await prisma.user.upsert({
      where: { email: coord.email },
      update: {
        password: coordHash,
        role: 'COORDINATOR',
        stageSlug: coord.slug,
        name: coord.name,
      },
      create: {
        email: coord.email,
        password: coordHash,
        name: coord.name,
        role: 'COORDINATOR',
        stageSlug: coord.slug,
      },
    });

    console.log(`Coordinador listo: ${coord.email} (${stage.name})`);
  }
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
