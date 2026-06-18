const path = require('path');

function fileToPublicUrl(file) {
  if (!file) return null;
  return `/uploads/${path.basename(file.filename || file.path)}`;
}

function isPathInsideDir(filePath, dirPath) {
  const resolvedFile = path.resolve(filePath);
  const resolvedDir = path.resolve(dirPath);
  const prefix = resolvedDir.endsWith(path.sep) ? resolvedDir : `${resolvedDir}${path.sep}`;
  return resolvedFile.startsWith(prefix);
}

function deleteOldFileFromUrl(fs, urlPath, uploadDir) {
  if (!urlPath || typeof urlPath !== 'string') return;
  if (!urlPath.startsWith('/uploads/')) return;
  const filename = path.basename(urlPath);
  if (!filename || filename === '.' || filename === '..') return;
  const fullPath = path.join(uploadDir, filename);
  if (!isPathInsideDir(fullPath, uploadDir)) return;
  fs.unlink(fullPath, () => {});
}

module.exports = { fileToPublicUrl, deleteOldFileFromUrl };
