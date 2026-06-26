import { describe, expect, test } from 'vitest';
import { safeInternalPath } from './safeRedirect.js';

describe('safeInternalPath', () => {
  test.each([
    ['//evil.com', '/admin'],
    ['https://evil.com', '/admin'],
    ['javascript:alert(1)', '/admin'],
    ['/admin/publicaciones', '/admin/publicaciones'],
    ['/etapas/horneros', '/etapas/horneros'],
    [null, '/admin'],
    ['', '/admin'],
  ])('safeInternalPath(%s)', (input, expected) => {
    expect(safeInternalPath(input)).toBe(expected);
  });
});
