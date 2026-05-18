/**
 * Habilita TOTP para un usuario (p.ej. admin).
 *
 * Uso:
 *   cd server && node scripts/enableTotpForUser.js usuario@dominio.com
 *
 * Imprime la URL otpauth y el secreto base32. Guardalo en un gestor de contraseñas.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { generateSecret, generateURI } = require('otplib');

const email = process.argv[2];
if (!email) {
  console.error('Uso: node scripts/enableTotpForUser.js <email>');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const secret = generateSecret();
  const user = await prisma.user.update({
    where: { email: email.trim() },
    data: { totpSecret: secret, totpEnabled: true },
  });
  const uri = generateURI({
    secret,
    label: user.email,
    issuer: process.env.TOTP_ISSUER || 'Batallon11',
  });
  // eslint-disable-next-line no-console
  console.log('\nTOTP habilitado para', user.email);
  // eslint-disable-next-line no-console
  console.log('\notpauth URI (importar en la app):\n', uri);
  // eslint-disable-next-line no-console
  console.log('\nSecreto (base32):\n', secret, '\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
