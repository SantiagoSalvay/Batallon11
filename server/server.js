require('dotenv').config({
  path: require('path').resolve(__dirname, '.env')
});
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const prisma = require('./config/prisma');
const { getLanIPv4Addresses, buildClientOrigins } = require('./utils/lanUrls');
const { correlationId } = require('./middleware/correlationId');
const { requireCsrf } = require('./middleware/csrf');
const errorHandler = require('./middleware/errorHandler');
const { cleanupExpiredRecords } = require('./jobs/cleanupExpiredRecords');

const authRoutes = require('./routes/auth');
const stageRoutes = require('./routes/stages');
const postRoutes = require('./routes/posts');
const stagePostRoutes = require('./routes/stagePosts');
const galleryRoutes = require('./routes/gallery');
const stageGalleryRoutes = require('./routes/stageGallery');
const eventRoutes = require('./routes/events');

const app = express();
app.disable('x-powered-by');

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));
}

const PORT = process.env.PORT || 4000;
const CLIENT_PORT = Number(process.env.CLIENT_PORT || 5173);
const isProd = process.env.NODE_ENV === 'production';
const corsOrigins = isProd
  ? (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : buildClientOrigins(CLIENT_PORT);

const LAN_DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):5173$/;

app.use(correlationId);

morgan.token('correlation-id', (req) => req.correlationId || '-');
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(
      ':correlation-id :method :url :status :res[content-length] - :response-time ms'
    )
  );
}

const cspDirectives = isProd
  ? {
      defaultSrc: ["'self'"],
      baseUri: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https://challenges.cloudflare.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  : false;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: cspDirectives,
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: false,
    frameguard: { action: 'deny' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      if (!isProd && LAN_DEV_ORIGIN.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(cookieParser(process.env.COOKIE_SIGNING_SECRET || undefined));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR || 'uploads');

function blockUnsafeUploadPath(req, res, next) {
  let decoded = req.path;
  try {
    decoded = decodeURIComponent(req.path);
  } catch {
    return res.status(400).end();
  }
  if (decoded.includes('\0') || decoded.split('/').some((part) => part === '..')) {
    return res.status(400).end();
  }
  next();
}

app.use(
  '/uploads',
  blockUnsafeUploadPath,
  express.static(uploadDir, {
    maxAge: '7d',
    etag: true,
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX || (isProd ? 150 : 5000)),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProd && req.method === 'GET',
});
app.use('/api', apiLimiter);

app.use('/api', (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }
  const pathOnly = req.originalUrl.split('?')[0];
  if (/\/api\/auth\/(refresh|prepare|gate)$/.test(pathOnly)) {
    return next();
  }
  return requireCsrf(req, res, next);
});

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stage-posts', stagePostRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/stage-gallery', stageGalleryRoutes);
app.use('/api/events', eventRoutes);

if (isProd) {
  const clientDistPath = path.resolve(__dirname, 'public');
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.use((req, res, _next) => {
  res.status(404).json({
    message: isProd ? 'Ruta no encontrada' : `Ruta no encontrada: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`API Batallón 11 escuchando en http://localhost:${PORT}`);
  if (!isProd) {
    for (const ip of getLanIPv4Addresses()) {
      // eslint-disable-next-line no-console
      console.log(`  Red local: http://${ip}:${PORT}`);
    }
    // eslint-disable-next-line no-console
    console.log(
      `  CORS (dev): localhost + IPs LAN en puerto ${CLIENT_PORT}`,
    );
  }

  cleanupExpiredRecords().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[cleanup] error al iniciar:', err.message);
  });
  if (process.env.NODE_ENV !== 'test') {
    setInterval(
      () => cleanupExpiredRecords().catch(() => {}),
      24 * 60 * 60 * 1000
    );
  }
});

server.setTimeout(30_000);
server.headersTimeout = 31_000;
server.requestTimeout = 30_000;
server.keepAliveTimeout = 5_000;

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} recibido. Cerrando...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGUSR2', () => shutdown('SIGUSR2'));

module.exports = app;
