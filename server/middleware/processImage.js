const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { uploadDir } = require('./upload');
const {
  isStorageConfigured,
  uploadBuffer,
  buildStorageKey,
} = require('../utils/supabaseStorage');

let fileTypeFromBufferFn;
async function detectMimeFromBuffer(buffer) {
  if (!fileTypeFromBufferFn) {
    fileTypeFromBufferFn = import('file-type').then((m) => m.fileTypeFromBuffer);
  }
  return (await fileTypeFromBufferFn)(buffer);
}

const ALLOWED_BEFORE_WEBP = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_PIXELS = Number(process.env.MAX_IMAGE_PIXELS ?? 25_000_000);
const MAX_EDGE = Number(process.env.MAX_IMAGE_EDGE_PX ?? 8192);
const QUALITY = Number(process.env.WEBP_QUALITY ?? 86);

async function bufferToWebpDisk(buffer, context = {}) {
  const type = await detectMimeFromBuffer(buffer);
  if (!type || !ALLOWED_BEFORE_WEBP.has(type.mime)) {
    const err = new Error('Tipo de imagen no permitido o archivo no reconocido');
    err.status = 400;
    throw err;
  }

  let meta;
  try {
    meta = await sharp(buffer, {
      animated: false,
      limitInputPixels: MAX_PIXELS,
    }).metadata();
  } catch {
    const err = new Error('Imagen inválida o demasiado grande para leer');
    err.status = 400;
    throw err;
  }

  const { width = 0, height = 0 } = meta;
  if (
    width === 0 ||
    height === 0 ||
    width > MAX_EDGE ||
    height > MAX_EDGE ||
    width * height > MAX_PIXELS
  ) {
    const err = new Error(
      `Imagen demasiado grande (máx ${MAX_EDGE}px por lado, ${MAX_PIXELS} píxeles totales)`
    );
    err.status = 400;
    throw err;
  }

  const outName = `${crypto.randomBytes(16).toString('hex')}.webp`;

  const webpBuffer = await sharp(buffer, {
    animated: false,
    limitInputPixels: MAX_PIXELS,
  })
    .rotate()
    .webp({ quality: QUALITY, effort: 4 })
    .withMetadata(false)
    .toBuffer();

  if (isStorageConfigured()) {
    const storageKey = buildStorageKey({
      kind: context.kind,
      stageSlug: context.stageSlug,
      filename: outName,
    });
    await uploadBuffer(storageKey, webpBuffer, 'image/webp');
    return {
      fieldname: undefined,
      originalname: outName,
      encoding: '7bit',
      mimetype: 'image/webp',
      filename: outName,
      storageKey,
      size: webpBuffer.length,
    };
  }

  const outPath = path.join(uploadDir, outName);
  await fs.promises.writeFile(outPath, webpBuffer);
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
async function processOneMulterFile(file, context) {
  if (!file || !file.buffer) return file;
  const processed = await bufferToWebpDisk(file.buffer, context);
  processed.fieldname = file.fieldname;
  processed.originalname = file.originalname;
  return processed;
}

/**
 * Middleware que marca el tipo de contenido del upload ('publicaciones' o
 * 'galerias') para que processUploadedImages lo guarde en la carpeta correcta.
 */
function tagUploadKind(kind) {
  return (req, _res, next) => {
    req.uploadKind = kind;
    next();
  };
}

async function processUploadedImages(req, res, next) {
  try {
    const context = {
      kind: req.uploadKind || 'publicaciones',
      stageSlug: req.body?.stageSlug || req.user?.stageSlug || null,
    };
    if (req.file) {
      req.file = await processOneMulterFile(req.file, context);
    }
    if (req.files && typeof req.files === 'object') {
      for (const key of Object.keys(req.files)) {
        const arr = req.files[key];
        if (!Array.isArray(arr)) continue;
        req.files[key] = await Promise.all(arr.map((f) => processOneMulterFile(f, context)));
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { processUploadedImages, bufferToWebpDisk, tagUploadKind };
