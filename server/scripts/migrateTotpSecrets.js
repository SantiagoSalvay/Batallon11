// MIGRATION: Ejecutar UNA VEZ tras desplegar cifrado TOTP, luego eliminar este script.
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { encrypt } = require('../utils/cryptoAtRest');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { totpEnabled: true, totpSecret: { not: null } },
  });
  for (const u of users) {
    if (u.totpSecret.split('.').length !== 3) {
      await prisma.user.update({
        where: { id: u.id },
        data: { totpSecret: encrypt(u.totpSecret) },
      });
      // eslint-disable-next-line no-console
      console.log(`Migrado: ${u.email}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
