export function safeInternalPath(path, fallback = '/admin') {
  if (typeof path !== 'string') return fallback;
  if (!path.startsWith('/')) return fallback;
  if (path.startsWith('//')) return fallback;
  if (path.includes('\\')) return fallback;
  if (/^https?:/i.test(path)) return fallback;
  if (path.includes('@')) return fallback;
  return path;
}
