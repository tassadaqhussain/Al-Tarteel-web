/**
 * Deterministic Daily Motivation selection — same dateKey → same index.
 * Run: node frontend/scripts/test-daily-motivation.mjs
 */
import assert from 'node:assert/strict';

function selectDailyMotivationIndex(dateKey, poolSize) {
  if (poolSize <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash % poolSize;
}

const a = selectDailyMotivationIndex('2026-08-07', 12);
const b = selectDailyMotivationIndex('2026-08-07', 12);
const c = selectDailyMotivationIndex('2026-08-08', 12);

assert.equal(a, b, 'same day must be stable');
assert.notEqual(a, c, 'next day should usually differ');

// Refresh simulation
for (let i = 0; i < 20; i += 1) {
  assert.equal(selectDailyMotivationIndex('2026-08-07', 12), a);
}

console.log('daily-motivation deterministic selection: ok', { a, c });
