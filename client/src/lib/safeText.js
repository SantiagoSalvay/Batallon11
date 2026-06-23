import DOMPurify from 'dompurify';

export function safeText(value) {
  if (value == null) return '';
  return DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
