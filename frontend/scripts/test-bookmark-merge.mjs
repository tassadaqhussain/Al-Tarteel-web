/**
 * Signing in must never discard bookmarks made while signed out.
 *
 * The sign-in path used to call replaceFromServer, which overwrote the local
 * list wholesale; mergeFromServer unions the two sides instead and reports the
 * local-only rows so they can be uploaded.
 *
 * Run: npm run test:bookmark-merge
 */
import assert from 'node:assert/strict';

// zustand/persist looks for a browser `window` with storage on it; without
// both it logs "storage is currently unavailable" on every write.
if (typeof globalThis.localStorage === 'undefined') {
  const mem = new Map();
  const storage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => void mem.set(k, String(v)),
    removeItem: (k) => void mem.delete(k),
    clear: () => void mem.clear(),
  };
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage };
}

const { useBookmarksStore } = await import('../src/stores/bookmarksStore.ts');

const s = () => useBookmarksStore.getState();
const setLocal = (bookmarks) => useBookmarksStore.setState({ bookmarks });

const local = (ayahId, over = {}) => ({
  id: String(ayahId),
  ayahId,
  surahNumber: 1,
  surahName: 'Al-Fatihah',
  ayahNumber: ayahId,
  textUthmani: 'x',
  note: '',
  color: 'gold',
  createdAt: 1000,
  ...over,
});

// --- a bookmark saved while signed out must survive and be reported ---------
setLocal([local(11, { note: 'offline note', color: 'blue', createdAt: 500 })]);
let localOnly = s().mergeFromServer([]);
assert.equal(s().bookmarks.length, 1, 'local bookmark survives an empty server list');
assert.equal(s().bookmarks[0].ayahId, 11);
assert.equal(localOnly.length, 1, 'local-only bookmark is reported for upload');
assert.equal(localOnly[0].ayahId, 11);

// --- a server bookmark this device has never seen is adopted ----------------
setLocal([]);
localOnly = s().mergeFromServer([local(22, { note: 'from server' })]);
assert.equal(s().bookmarks.length, 1, 'server bookmark is added');
assert.equal(s().bookmarks[0].ayahId, 22);
assert.equal(localOnly.length, 0, 'nothing to upload');

// --- both sides: union, no duplicates ---------------------------------------
setLocal([local(1), local(2)]);
localOnly = s().mergeFromServer([local(2), local(3)]);
const ids = s().bookmarks.map((b) => b.ayahId).sort((a, b) => a - b);
assert.deepEqual(ids, [1, 2, 3], 'union of both sides');
assert.equal(new Set(ids).size, ids.length, 'no duplicate ayahIds');
assert.deepEqual(localOnly.map((b) => b.ayahId), [1], 'only the local-only row uploads');

// --- present on both sides: field-level reconciliation ----------------------
setLocal([local(7, { note: 'my note', color: 'purple', createdAt: 100 })]);
s().mergeFromServer([local(7, { note: 'server note', color: 'gold', createdAt: 900 })]);
const merged = s().bookmarks.find((b) => b.ayahId === 7);
assert.equal(merged.color, 'purple', 'colour is local-only; the server has no such column');
assert.equal(merged.note, 'server note', 'a server note wins when it has one');
assert.equal(merged.createdAt, 100, 'the earlier creation time is kept');

// --- an empty server note must not erase a local one ------------------------
setLocal([local(8, { note: 'only mine' })]);
s().mergeFromServer([local(8, { note: '' })]);
assert.equal(
  s().bookmarks.find((b) => b.ayahId === 8).note,
  'only mine',
  'a blank server note does not wipe the local one',
);

console.log('test-bookmark-merge: ok');
