const path = require('path');

function fileToPublicUrl(file) {
  if (!file) return null;
  return `/uploads/${path.basename(file.filename || file.path)}`;
}

function deleteOldFileFromUrl(fs, urlPath, uploadDir) {
  if (!urlPath || typeof urlPath !== 'string') return;
  if (!urlPath.startsWith('/uploads/')) return;
  const filename = path.basename(urlPath);
  const fullPath = path.join(uploadDir, filename);
  fs.unlink(fullPath, () => {});
}

module.exports = { fileToPublicUrl, deleteOldFileFromUrl };
