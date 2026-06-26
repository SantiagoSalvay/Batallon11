const { safeCompare } = require('../middleware/csrf');

describe('csrf safeCompare', () => {
  test('coincide con strings iguales', () => {
    expect(safeCompare('abc', 'abc')).toBe(true);
  });

  test('rechaza strings distintos', () => {
    expect(safeCompare('abc', 'abd')).toBe(false);
  });

  test('rechaza longitudes distintas', () => {
    expect(safeCompare('abc', 'abcd')).toBe(false);
  });
});
