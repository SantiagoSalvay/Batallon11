/**
 * Repara inconsistencias de imágenes:
 *
 *  1) Corrige referencias en la base de datos cuya ruta no existe en el
 *     bucket pero cuyo archivo sí está presente en otra carpeta (se busca
 *     por nombre de archivo). Soluciona el "marco roto" de pioneros-fuegos.
 *
 *  2) Rellena la galería de cada etapa con las imágenes de sus publicaciones
 *     que todavía no estén en la galería. Soluciona que las fotos de las
 *     publicaciones no aparezcan en la galería (baqueanos).
 *
 * Uso:
 *   node scripts/repairImages.js            -> modo prueba (no escribe nada)
 *   node scripts/repairImages.js --apply    -> aplica los cambios
 */
require('dotenv').config();
const path = require('path');
const prisma = require('../config/prisma');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const APPLY = process.argv.includes('--apply');
const bucket = (process.env.SUPABASE_STORAGE_BUCKET || '').trim();

const s3 = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION || 'sa-east-1',
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

function basename(key) {
  return path.posix.basename(String(key || ''));
}

function isLocalOrAbsolute(ref) {
  if (!ref || typeof ref !== 'string') return true;
  if (/^https?:\/\//i.test(ref)) return true;
  if (ref.startsWith('/uploads/')) return true;
  return false;
}

async function listAllKeys() {
  let token;
  const keys = [];
  do {
    const out = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token })
    );
    (out.Contents || []).forEach((o) => keys.push(o.Key));
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function main() {
  console.log(`Modo: ${APPLY ? 'APLICAR CAMBIOS' : 'PRUEBA (dry-run)'}\n`);

  const keys = await listAllKeys();
  const keySet = new Set(keys);

  // Mapa nombreArchivo -> [keys], para encontrar archivos movidos de carpeta.
  const byBasename = new Map();
  for (const k of keys) {
    if (k.endsWith('.emptyFolderPlaceholder')) continue;
    const b = basename(k);
    if (!byBasename.has(b)) byBasename.set(b, []);
    byBasename.get(b).push(k);
  }

  const fixRef = (ref) => {
    if (isLocalOrAbsolute(ref)) return null; // no tocamos rutas locales/externas
    const key = ref.replace(/^\//, '');
    if (keySet.has(key)) return null; // ya existe, nada que hacer
    const candidates = byBasename.get(basename(key)) || [];
    if (candidates.length === 1) return candidates[0]; // único match seguro
    return undefined; // roto y sin match único
  };

  let fixedPost = 0;
  let fixedGalStage = 0;
  let fixedGal = 0;
  let unresolved = 0;

  // --- 1) Reparar imágenes de publicaciones ---
  const postImgs = await prisma.imagenPublicacion.findMany();
  for (const img of postImgs) {
    const next = fixRef(img.rutaOptimizada);
    if (next === null) continue;
    if (next === undefined) {
      unresolved++;
      console.log(`  [!] post-img ${img.id} sin archivo: ${img.rutaOptimizada}`);
      continue;
    }
    console.log(`  [fix] post-img ${img.id}: ${img.rutaOptimizada} -> ${next}`);
    if (APPLY) {
      await prisma.imagenPublicacion.update({
        where: { id: img.id },
        data: { rutaOptimizada: next },
      });
    }
    fixedPost++;
  }

  // --- 1b) Reparar galería de etapas ---
  const stageGal = await prisma.imagenGaleriaEtapa.findMany();
  for (const img of stageGal) {
    const next = fixRef(img.imageUrl);
    if (next === null) continue;
    if (next === undefined) {
      unresolved++;
      console.log(`  [!] gal-etapa ${img.id} sin archivo: ${img.imageUrl}`);
      continue;
    }
    console.log(`  [fix] gal-etapa ${img.id}: ${img.imageUrl} -> ${next}`);
    if (APPLY) {
      await prisma.imagenGaleriaEtapa.update({
        where: { id: img.id },
        data: { imageUrl: next },
      });
    }
    fixedGalStage++;
  }

  // --- 1c) Reparar galería general ---
  const gal = await prisma.imagenGaleria.findMany();
  for (const img of gal) {
    const next = fixRef(img.imageUrl);
    if (next === null) continue;
    if (next === undefined) {
      unresolved++;
      console.log(`  [!] gal ${img.id} sin archivo: ${img.imageUrl}`);
      continue;
    }
    console.log(`  [fix] gal ${img.id}: ${img.imageUrl} -> ${next}`);
    if (APPLY) {
      await prisma.imagenGaleria.update({
        where: { id: img.id },
        data: { imageUrl: next },
      });
    }
    fixedGal++;
  }

  // --- 2) Backfill: imágenes de publicaciones de etapa -> galería de etapa ---
  let added = 0;
  const stagePosts = await prisma.publicacion.findMany({
    where: { stageSlug: { not: null } },
    include: { imagenes: { orderBy: { order: 'asc' } } },
  });

  // Claves ya presentes en la galería de cada etapa (tras la reparación).
  const galleryAfter = await prisma.imagenGaleriaEtapa.findMany();
  const galleryKeysByStage = new Map();
  for (const g of galleryAfter) {
    if (!galleryKeysByStage.has(g.stageSlug)) galleryKeysByStage.set(g.stageSlug, new Set());
    galleryKeysByStage.get(g.stageSlug).add(g.imageUrl.replace(/^\//, ''));
  }

  for (const post of stagePosts) {
    const existing = galleryKeysByStage.get(post.stageSlug) || new Set();
    for (const img of post.imagenes) {
      // Usa la clave ya reparada en memoria.
      let key = img.rutaOptimizada;
      const repaired = fixRef(key);
      if (typeof repaired === 'string') key = repaired;
      const normalized = String(key).replace(/^\//, '');

      if (existing.has(normalized)) continue; // ya está en la galería

      console.log(
        `  [gal+] etapa ${post.stageSlug}: agrega "${post.title}" -> ${normalized}`
      );
      if (APPLY) {
        await prisma.imagenGaleriaEtapa.create({
          data: {
            imageUrl: normalized,
            caption: post.title || null,
            order: 0,
            stageSlug: post.stageSlug,
          },
        });
      }
      existing.add(normalized);
      galleryKeysByStage.set(post.stageSlug, existing);
      added++;
    }
  }

  console.log('\n===== RESUMEN =====');
  console.log(`Rutas reparadas en publicaciones:     ${fixedPost}`);
  console.log(`Rutas reparadas en galería de etapas: ${fixedGalStage}`);
  console.log(`Rutas reparadas en galería general:   ${fixedGal}`);
  console.log(`Imágenes agregadas a galerías:        ${added}`);
  console.log(`Sin resolver (revisar a mano):        ${unresolved}`);
  if (!APPLY) {
    console.log('\n(Esto fue una PRUEBA. Volvé a correr con --apply para aplicar.)');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
