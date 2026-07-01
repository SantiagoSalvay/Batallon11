const { dailySeed, dailyShuffle } = require('./dailyShuffle');

describe('dailyShuffle', () => {
  test('mantiene el mismo orden con la misma semilla', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

    expect(dailyShuffle(items, { seed: '2026-07-01' })).toEqual(
      dailyShuffle(items, { seed: '2026-07-01' })
    );
  });

  test('cambia el orden con otra semilla diaria', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

    expect(dailyShuffle(items, { seed: '2026-07-01' })).not.toEqual(
      dailyShuffle(items, { seed: '2026-07-02' })
    );
  });

  test('usa la fecha de Argentina para la semilla diaria', () => {
    const date = new Date('2026-07-01T02:30:00.000Z');

    expect(dailySeed(date)).toBe('2026-06-30');
  });
});
