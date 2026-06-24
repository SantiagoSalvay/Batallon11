const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

function projectUrl() {
  return (process.env.SUPABASE_PROJECT_URL || '').replace(/-+$/, '').trim().replace(/\/$/, '');
}

function storageBucket() {
  return (process.env.SUPABASE_STORAGE_BUCKET || '').trim();
}

function isStorageConfigured() {
  return Boolean(
    projectUrl() &&
      storageBucket() &&
      process.env.SUPABASE_S3_ENDPOINT &&
      process.env.SUPABASE_S3_ACCESS_KEY_ID &&
      process.env.SUPABASE_S3_SECRET_ACCESS_KEY
  );
}

let s3Client;

function getS3Client() {
  if (!isStorageConfigured()) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.SUPABASE_S3_ENDPOINT,
      region: process.env.SUPABASE_S3_REGION || 'sa-east-1',
      credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

function encodeObjectKey(key) {
  return key
    .replace(/^\//, '')
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function resolveStorageUrl(pathOrKey) {
  if (!pathOrKey || typeof pathOrKey !== 'string') return pathOrKey ?? null;
  if (/^https?:\/\//i.test(pathOrKey)) return pathOrKey;
  if (pathOrKey.startsWith('/uploads/')) return pathOrKey;

  const base = projectUrl();
  const bucket = storageBucket();
  if (!base || !bucket) return pathOrKey;

  return `${base}/storage/v1/object/public/${bucket}/${encodeObjectKey(pathOrKey)}`;
}

function extractStorageKey(pathOrKey) {
  if (!pathOrKey || typeof pathOrKey !== 'string') return null;
  if (pathOrKey.startsWith('/uploads/')) return null;

  const publicPrefix = `/storage/v1/object/public/${storageBucket()}/`;
  if (pathOrKey.includes(publicPrefix)) {
    const idx = pathOrKey.indexOf(publicPrefix);
    return decodeURIComponent(pathOrKey.slice(idx + publicPrefix.length));
  }

  if (/^https?:\/\//i.test(pathOrKey)) return null;
  return pathOrKey.replace(/^\//, '');
}

async function uploadBuffer(key, buffer, contentType = 'image/webp') {
  const client = getS3Client();
  if (!client) throw new Error('Supabase Storage no configurado');

  await client.send(
    new PutObjectCommand({
      Bucket: storageBucket(),
      Key: key.replace(/^\//, ''),
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return key.replace(/^\//, '');
}

async function deleteStorageObject(pathOrKey) {
  const client = getS3Client();
  if (!client) return;

  const key = extractStorageKey(pathOrKey);
  if (!key) return;

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: storageBucket(),
        Key: key,
      })
    );
  } catch {
    /* ignorar si ya no existe */
  }
}

module.exports = {
  isStorageConfigured,
  resolveStorageUrl,
  uploadBuffer,
  deleteStorageObject,
};
