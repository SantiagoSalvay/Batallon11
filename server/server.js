require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const prisma = require('./config/prisma');

const authRoutes = require('./routes/auth');
const heroRoutes = require('./routes/hero');
const stageRoutes = require('./routes/stages');
const postRoutes = require('./routes/posts');
const stagePostRoutes = require('./routes/stagePosts');
const galleryRoutes = require('./routes/gallery');
const stageGalleryRoutes = require('./routes/stageGallery');
const eventRoutes = require('./routes/events');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: CLIENT_URL.split(',').map((s) => s.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stage-posts', stagePostRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/stage-gallery', stageGalleryRoutes);
app.use('/api/events', eventRoutes);

app.use((req, res, _next) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Batallón 11 escuchando en http://localhost:${PORT}`);
});

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

module.exports = app;
