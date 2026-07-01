const DEFAULT_TIME_ZONE = 'America/Argentina/Cordoba';

function dailySeed(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dailyShuffle(items, { seed = dailySeed(), identity } = {}) {
  const identify = identity || ((item, index) => item?.id ?? index);

  return [...items]
    .map((item, index) => ({
      item,
      index,
      score: hashString(`${seed}:${identify(item, index)}`),
    }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map(({ item }) => item);
}

module.exports = {
  DEFAULT_TIME_ZONE,
  dailySeed,
  dailyShuffle,
  hashString,
};
