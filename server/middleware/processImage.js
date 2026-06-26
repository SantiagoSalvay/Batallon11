const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { uploadDir } = require('./upload');
const {
  isStorageConfigured,
  uploadBuffer,
  buildStorageKey,
  publicationFolder,
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
    const err = new Error('Imagen invalida o demasiado grande para leer');
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
      `Imagen demasiado grande (max ${MAX_EDGE}px por lado, ${MAX_PIXELS} pixeles totales)`
    );
    err.status = 400;
    throw err;
  }

  const webpBuffer = await sharp(buffer, {
    animated: false,
    limitInputPixels: MAX_PIXELS,
  })
    .rotate()
    .webp({ quality: QUALITY, effort: 4 })
    .withMetadata(false)
    .toBuffer();

  return persistWebp(webpBuffer, {
    kind: context.kind,
    stageSlug: context.stageSlug,
    folder: context.folder,
  });
}

/**
 * Guarda un buffer webp en Supabase Storage (si esta configurado) o en disco,
 * y devuelve un descriptor compatible con fileToStorageReference.
 */
async function persistWebp(webpBuffer, { kind, stageSlug, folder }) {
  const outName = `${crypto.randomBytes(16).toString('hex')}.webp`;
  const base = {
    fieldname: undefined,
    originalname: outName,
    encoding: '7bit',
    mimetype: 'image/webp',
    filename: outName,
    size: webpBuffer.length,
  };

  if (isStorageConfigured()) {
    const storageKey = buildStorageKey({ kind, stageSlug, folder, filename: outName });
    await uploadBuffer(storageKey, webpBuffer, 'image/webp');
    return { ...base, storageKey };
  }

  const outPath = path.join(uploadDir, outName);
  await fs.promises.writeFile(outPath, webpBuffer);
  const stat = await fs.promises.stat(outPath);
  return { ...base, path: outPath, size: stat.size };
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
function tagUploadKind(kind, { groupByPublication = false } = {}) {
  return (req, _res, next) => {
    req.uploadKind = kind;
    req.groupUploadByPublication = groupByPublication;
    next();
  };
}

async function processUploadedImages(req, res, next) {
  try {
    const context = {
      kind: req.uploadKind || 'publicaciones',
      stageSlug: req.body?.stageSlug || req.user?.stageSlug || null,
      folder: req.groupUploadByPublication ? publicationFolder(req.body?.title) : null,
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
