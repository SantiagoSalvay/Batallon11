require('dotenv').config();

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { getStageBySlug } = require('../lib/stages');

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

  const resetCoordinators = process.argv.includes('--reset-coordinators');
  const newCredentials = [];

  for (const coord of COORDINATORS) {
    const stage = getStageBySlug(coord.slug);
    if (!stage) {
      console.warn(`Etapa no definida en código para ${coord.email} (slug ${coord.slug})`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email: coord.email } });

    if (existing && !resetCoordinators) {
      await prisma.user.update({
        where: { email: coord.email },
        data: { role: 'COORDINATOR', stageSlug: coord.slug, name: coord.name },
      });
      console.log(`Coordinador ya existe (sin cambios de password): ${coord.email}`);
      continue;
    }

    const plainPassword = generatePassword(18);
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
