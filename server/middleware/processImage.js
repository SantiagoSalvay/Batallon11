const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const FileType = require('file-type');
const { uploadDir } = require('./upload');

/** Entradas permitidas antes de re-encode a WebP (sin SVG). */
const ALLOWED_BEFORE_WEBP = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

async function bufferToWebpDisk(buffer) {
  const type = await FileType.fromBuffer(buffer);
  if (!type || !ALLOWED_BEFORE_WEBP.has(type.mime)) {
    const err = new Error('Tipo de imagen no permitido o archivo no reconocido');
    err.status = 400;
    throw err;
  }

  const outName = `${Date.now()}-${crypto.randomBytes(10).toString('hex')}.webp`;
  const outPath = path.join(uploadDir, outName);

  await sharp(buffer, { animated: false, limitInputPixels: 268402689 })
    .rotate()
    .webp({ quality: 86, effort: 4 })
    .toFile(outPath);

  const stat = await fs.promises.stat(outPath);
  return {
    fieldname: undefined,
    originalname: outName,
    encoding: '7bit',
    mimetype: 'image/webp',
    filename: outName,
    path: outPath,
    size: stat.size,
  };
}

async function processOneMulterFile(file) {
  if (!file || !file.buffer) return file;
  const processed = await bufferToWebpDisk(file.buffer);
  processed.fieldname = file.fieldname;
  processed.originalname = file.originalname;
  return processed;
}

/**
 * Tras multer: convierte req.file / req.files a WebP en disco.
 */
async function processUploadedImages(req, res, next) {
  try {
    if (req.file) {
      req.file = await processOneMulterFile(req.file);
    }
    if (req.files && typeof req.files === 'object') {
      for (const key of Object.keys(req.files)) {
        const arr = req.files[key];
        if (!Array.isArray(arr)) continue;
        req.files[key] = await Promise.all(arr.map((f) => processOneMulterFile(f)));
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { processUploadedImages, bufferToWebpDisk };
