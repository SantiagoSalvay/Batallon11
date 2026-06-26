const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

function buildDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    if (!url.searchParams.has('connection_limit')) {
      const limit = process.env.PRISMA_CONNECTION_LIMIT || '5';
      url.searchParams.set('connection_limit', limit);
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', process.env.PRISMA_POOL_TIMEOUT || '20');
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const databaseUrl = buildDatabaseUrl();

const prismaOptions = {
  log:
    process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
};

if (databaseUrl) {
  prismaOptions.datasources = { db: { url: databaseUrl } };
}

const prisma = globalForPrisma.__batallonPrisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__batallonPrisma = prisma;
}

module.exports = prisma;
