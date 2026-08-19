/**
 * Homepage reciter tiles use Lucide icons — never a shared PNG or AI-style art.
 * Run: node scripts/test-reciter-tiles.mjs
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const VARIANTS = ['alafasy', 'sudais', 'basit', 'dosari', 'balila', 'ousi'];

const section = readFileSync(join(root, '../src/components/home/RecitersSection.tsx'), 'utf8');
assert.equal(section.includes('reciter_avatar.png'), false, 'must not use the shared reciter PNG');
assert.equal(section.includes('next/image'), false);
assert.match(section, /ReciterTile/);
for (const variant of VARIANTS) {
  assert.match(section, new RegExp(`variant: '${variant}'`));
}

const tile = readFileSync(join(root, '../src/components/audio/ReciterTile.tsx'), 'utf8');
assert.equal(tile.includes('<img'), false);
assert.equal(tile.includes('next/image'), false);
assert.equal(tile.includes('Sparkles'), false, 'must not use AI sparkle icons');
assert.match(tile, /from 'lucide-react'/);
assert.match(tile, /RECITER_TILE_VARIANTS/);
for (const variant of VARIANTS) {
  assert.match(tile, new RegExp(`${variant}:`));
}

console.log('test-reciter-tiles: ok');
