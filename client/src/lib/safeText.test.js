import { describe, expect, test } from 'vitest';
import { safeText } from './safeText.js';

describe('safeText', () => {
  test('elimina etiquetas HTML', () => {
    expect(safeText('<script>alert(1)</script>texto')).toBe('texto');
  });

  test('elimina atributos de evento', () => {
    expect(safeText('<img src=x onerror=alert(1)>')).toBe('');
  });

  test('pasa texto plano sin cambios', () => {
    expect(safeText('Título normal')).toBe('Título normal');
  });

  test('maneja null/undefined', () => {
    expect(safeText(null)).toBe('');
    expect(safeText(undefined)).toBe('');
  });
});
