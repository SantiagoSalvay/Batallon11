const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 10);

/**
 * Solo memoria + validación real en processImage.js (magic bytes + sharp).
 * No confiar en mimetype del cliente.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSizeMb * 1024 * 1024, files: 6 },
  fileFilter: (_req, _file, cb) => cb(null, true),
});

module.exports = { upload, uploadDir };
