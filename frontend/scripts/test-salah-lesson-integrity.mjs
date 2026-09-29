import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const lessonDataPath = resolve(__dirname, '../src/lib/salah/lesson-data.ts');
const fileContent = readFileSync(lessonDataPath, 'utf8');

console.log('Testing Salah Lesson Data Integrity...');

// 1. Verify structured exports exist
assert.ok(fileContent.includes('export const TWO_RAKAH_FARD_LESSON'), 'Must export TWO_RAKAH_FARD_LESSON');
assert.ok(fileContent.includes('export const THREE_RAKAH_FARD_LESSON'), 'Must export THREE_RAKAH_FARD_LESSON');
assert.ok(fileContent.includes('export const FOUR_RAKAH_FARD_LESSON'), 'Must export FOUR_RAKAH_FARD_LESSON');
assert.ok(fileContent.includes('export const HANAFI_WITR_LESSON'), 'Must export HANAFI_WITR_LESSON');

// 2. Verify Hanafi Fiqh standards and review metadata
assert.ok(fileContent.includes("fiqhMethod: 'Hanafi'"), 'Method must be Hanafi');
assert.ok(fileContent.includes("reviewStatus: 'reviewed'"), 'Must have reviewed status');
assert.ok(fileContent.includes('Maraqi al-Falah'), 'Must cite authentic Hanafi sources (Maraqi al-Falah)');
assert.ok(fileContent.includes('Radd al-Muhtar'), 'Must cite Fatawa Shami');

// 3. Verify Step 0 — Prepare instructions
assert.ok(
  fileContent.includes('Namaz se pehle wuzu karein') ||
  fileContent.includes('نماز سے پہلے وضو کریں'),
  'Step 0 must contain Urdu preparation instructions'
);

// 4. Verify Step 1 — Opening Takbir & male/female distinction
assert.ok(
  fileContent.includes('naaf ke neeche') ||
  fileContent.includes('ناف کے نیچے'),
  'Male Takbir instruction must state folding below the navel'
);
assert.ok(
  fileContent.includes('seene par') ||
  fileContent.includes('سینے پر'),
  'Female Takbir instruction must state folding on the chest'
);

// 5. Verify Step 2 — Opening recitations: Sana, Fatihah, Ikhlas
assert.ok(fileContent.includes('سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ'), 'Must contain verified Sana Arabic');
assert.ok(fileContent.includes('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'), 'Must contain Surah Al-Fatihah');
assert.ok(fileContent.includes('قُلْ هُوَ اللَّهُ أَحَدٌ'), 'Must contain Surah Al-Ikhlas');

// 6. Verify Step 3 — Ruku
assert.ok(fileContent.includes('سُبْحَانَ رَبِّيَ الْعَظِيمِ'), 'Must contain Subhana Rabbiyal-Adheem');

// 7. Verify Step 4 — Rise from Ruku (Qawmah)
assert.ok(fileContent.includes('سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ'), 'Must contain Sami Allahu liman hamidah');
assert.ok(fileContent.includes('رَبَّنَا لَكَ الْحَمْدُ'), 'Must contain Rabbana lakal hamd');

// 8. Verify Step 5 — Sujud on 7 points
assert.ok(fileContent.includes('سُبْحَانَ رَبِّيَ الأَعْلَىٰ'), 'Must contain Subhana Rabbiyal-A‘la');

// 9. Verify Step 8 — Rak‘ah 2 does NOT repeat Sana
assert.ok(
  fileContent.includes('Sana is not recited again') ||
  fileContent.includes('ثناء دوبارہ نہیں پڑھی جاتی'),
  'Rak‘ah 2 must explicitly state Sana is not repeated'
);

// 10. Verify Step 9 — Final Sitting (Tashahhud, Durood Ibrahim, Du‘a)
assert.ok(fileContent.includes('التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ'), 'Must contain At-Tahiyyat');
assert.ok(fileContent.includes('اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ'), 'Must contain Durood Ibrahim');
assert.ok(fileContent.includes('اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي'), 'Must contain Du‘a Ma’surah');

// 11. Verify Step 10 — Both right and left Salaam
assert.ok(fileContent.includes('audio_salam_right'), 'Must have audio for right salam');
assert.ok(fileContent.includes('audio_salam_left'), 'Must have audio for left salam');

// 12. Verify Hanafi Witr uniqueness
assert.ok(fileContent.includes("prayerType: 'Wajib'"), 'Witr must be labeled Wajib');
assert.ok(fileContent.includes('اللَّهُمَّ إِنَّا نَسْتَعِينُكَ'), 'Witr must contain verified Du‘a al-Qunoot');
assert.ok(fileContent.includes('Takbīrat al-Qunūt'), 'Witr must feature Qunoot Takbir before Ruku');

// 13. Verify multi-language support (Urdu, English, Pashto)
assert.ok(fileContent.includes("ur:"), 'Must support Urdu');
assert.ok(fileContent.includes("en:"), 'Must support English');
assert.ok(fileContent.includes("ps:"), 'Must support Pashto');

console.log('✓ All Salah Lesson Data Integrity tests passed successfully!');
