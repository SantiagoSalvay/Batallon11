const path = require('path');
const { resolveStorageUrl, deleteStorageObject } = require('./supabaseStorage');

function fileToStorageReference(file) {
  if (!file) return null;
  if (file.storageKey) return file.storageKey;
  return `/uploads/${path.basename(file.filename || file.path)}`;
}

function fileToPublicUrl(file) {
  return resolveStorageUrl(fileToStorageReference(file));
}

function resolvePublicAssetUrl(pathOrKey) {
  return resolveStorageUrl(pathOrKey);
}

function withResolvedImageUrl(record) {
  if (!record) return record;
  if (!record.imageUrl) return record;
  return { ...record, imageUrl: resolveStorageUrl(record.imageUrl) };
}

function withResolvedImageUrlList(records) {
  return records.map(withResolvedImageUrl);
}

function isPathInsideDir(filePath, dirPath) {
  const resolvedFile = path.resolve(filePath);
  const resolvedDir = path.resolve(dirPath);
  const prefix = resolvedDir.endsWith(path.sep) ? resolvedDir : `${resolvedDir}${path.sep}`;
  return resolvedFile.startsWith(prefix);
}

function deleteOldFileFromUrl(fs, urlPath, uploadDir) {
  if (!urlPath || typeof urlPath !== 'string') return;

  if (/^https?:\/\//i.test(urlPath) || !urlPath.startsWith('/uploads/')) {
    void deleteStorageObject(urlPath);
  }

  if (!urlPath.startsWith('/uploads/')) return;

  const filename = path.basename(urlPath);
  if (!filename || filename === '.' || filename === '..') return;
  const fullPath = path.join(uploadDir, filename);
  if (!isPathInsideDir(fullPath, uploadDir)) return;
  fs.unlink(fullPath, () => {});
}

module.exports = {
  fileToPublicUrl,
  fileToStorageReference,
  resolvePublicAssetUrl,
  withResolvedImageUrl,
  withResolvedImageUrlList,
  deleteOldFileFromUrl,
};
