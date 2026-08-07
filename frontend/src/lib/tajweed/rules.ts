/**
 * Central Tajweed rule catalogue.
 *
 * Rule IDs match Quran.com `text_uthmani_tajweed` annotation classes
 * (stored in `ayahs.text_tajweed`). Do not invent additional rule IDs
 * unless the upstream dataset introduces them.
 */

export type TajweedRuleId =
  | 'ham_wasl'
  | 'laam_shamsiyah'
  | 'madda_normal'
  | 'madda_permissible'
  | 'madda_necessary'
  | 'ghunnah'
  | 'qalqalah'
  | 'ikhafa'
  | 'ikhafa_shafawi'
  | 'idgham_shafawi'
  | 'iqlab'
  | 'idgham_with_ghunnah'
  | 'idgham_without_ghunnah'
  | 'idgham_mutajanisayn'
  | 'idgham_mutaqaribayn'
  | 'silent';

export type TajweedLessonSlug =
  | 'ghunnah'
  | 'ikhfa'
  | 'idgham'
  | 'iqlab'
  | 'qalqalah'
  | 'madd';

export interface TajweedRule {
  id: TajweedRuleId;
  name: string;
  nameArabic: string;
  shortLabel: string;
  description: string;
  pronunciation: string;
  when: string;
  /** Legend / highlight colour (sufficient contrast on light & dark via CSS vars) */
  color: string;
  colorDark: string;
  lessonSlug: TajweedLessonSlug | null;
  patternHint?: string; // accessible non-color cue
}

export const TAJWEED_RULES: Record<TajweedRuleId, TajweedRule> = {
  ham_wasl: {
    id: 'ham_wasl',
    name: 'Hamzat al-Wasl',
    nameArabic: 'همزة الوصل',
    shortLabel: 'Wasl',
    description: 'A connecting hamzah that is pronounced only when starting from it; it is dropped in continuous reading.',
    pronunciation: 'Skip the hamzah when joining from the previous word; pronounce it when beginning a phrase from that letter.',
    when: 'Appears at the start of certain words (including the definite article ال) in continuous recitation contexts.',
    color: '#6b7280',
    colorDark: '#9ca3af',
    lessonSlug: null,
    patternHint: 'muted',
  },
  laam_shamsiyah: {
    id: 'laam_shamsiyah',
    name: 'Lam Shamsiyyah',
    nameArabic: 'لام شمسية',
    shortLabel: 'Shamsi Lam',
    description: 'The lām of the definite article is not pronounced when followed by a “sun letter”; the sun letter is doubled instead.',
    pronunciation: 'Do not sound the lām; assimilate into the following sun letter with shaddah.',
    when: 'When ال is followed by a sun letter (ت ث د ذ ر ز س ش ص ض ط ظ ل ن).',
    color: '#6b7280',
    colorDark: '#9ca3af',
    lessonSlug: null,
    patternHint: 'muted',
  },
  madda_normal: {
    id: 'madda_normal',
    name: 'Madd Ṭabīʿī (Natural Madd)',
    nameArabic: 'مد طبيعي',
    shortLabel: 'Natural Madd',
    description: 'A natural elongation of a madd letter (ا و ي) without a following hamzah or sukūn that would change the length.',
    pronunciation: 'Stretch for about two counts (ḥarakāt).',
    when: 'When a madd letter is not followed by a hamzah or a sukūn that requires a longer madd.',
    color: '#2563eb',
    colorDark: '#60a5fa',
    lessonSlug: 'madd',
    patternHint: 'underline-dots',
  },
  madda_permissible: {
    id: 'madda_permissible',
    name: 'Madd Jāʾiz (Permissible Separate Madd)',
    nameArabic: 'مد جائز منفصل',
    shortLabel: 'Permissible Madd',
    description: 'A madd letter at the end of a word followed by a hamzah at the start of the next word.',
    pronunciation: 'Lengthen moderately (commonly 4–5 counts in many Hafs teachings; follow your teacher’s measure).',
    when: 'Madd letter ending a word + hamzah beginning the next word.',
    color: '#1d4ed8',
    colorDark: '#93c5fd',
    lessonSlug: 'madd',
    patternHint: 'underline-dots',
  },
  madda_necessary: {
    id: 'madda_necessary',
    name: 'Madd Lāzim (Necessary Madd)',
    nameArabic: 'مد لازم',
    shortLabel: 'Necessary Madd',
    description: 'A madd letter followed by a permanently sukūned letter (often with shaddah), requiring a longer fixed stretch.',
    pronunciation: 'Stretch for about six counts.',
    when: 'Madd letter immediately followed by a necessary sukūn/shaddah in the same word (or in certain letter names).',
    color: '#1e3a8a',
    colorDark: '#bfdbfe',
    lessonSlug: 'madd',
    patternHint: 'double-underline',
  },
  ghunnah: {
    id: 'ghunnah',
    name: 'Ghunnah',
    nameArabic: 'غنة',
    shortLabel: 'Ghunnah',
    description: 'A nasal sound produced through the nose, especially with nūn/mīm when they carry shaddah or in related noon/meem rules.',
    pronunciation: 'Hold a clear nasal hum (commonly two counts) without swallowing the letter.',
    when: 'Notably on نّ and مّ, and within several noon sākinah / meem sākinah rules that include ghunnah.',
    color: '#db2777',
    colorDark: '#f9a8d4',
    lessonSlug: 'ghunnah',
    patternHint: 'wave',
  },
  qalqalah: {
    id: 'qalqalah',
    name: 'Qalqalah',
    nameArabic: 'قلقلة',
    shortLabel: 'Qalqalah',
    description: 'An echoing bounce on certain letters when they carry sukūn.',
    pronunciation: 'Release a light bounce without adding a full vowel: ق ط ب ج د.',
    when: 'When one of ق ط ب ج د is sākin (stronger at a stop).',
    color: '#0891b2',
    colorDark: '#67e8f9',
    lessonSlug: 'qalqalah',
    patternHint: 'zigzag',
  },
  ikhafa: {
    id: 'ikhafa',
    name: 'Ikhfāʾ',
    nameArabic: 'إخفاء',
    shortLabel: 'Ikhfa',
    description: 'Concealment of nūn sākinah or tanwīn with ghunnah before one of the ikhfāʾ letters.',
    pronunciation: 'Lightly hide the nūn/tanwīn into a nasalized transition toward the next letter (not a clear nūn and not full assimilation).',
    when: 'Nūn sākinah/tanwīn followed by one of the fifteen ikhfāʾ letters.',
    color: '#059669',
    colorDark: '#6ee7b7',
    lessonSlug: 'ikhfa',
    patternHint: 'dash',
  },
  ikhafa_shafawi: {
    id: 'ikhafa_shafawi',
    name: 'Ikhfāʾ Shafawī',
    nameArabic: 'إخفاء شفوي',
    shortLabel: 'Labial Ikhfa',
    description: 'Concealment of mīm sākinah when followed by bāʾ, with ghunnah.',
    pronunciation: 'Keep lips nearly closed for mīm with nasalization, then articulate bāʾ.',
    when: 'Mīm sākinah followed by ب.',
    color: '#059669',
    colorDark: '#6ee7b7',
    lessonSlug: 'ikhfa',
    patternHint: 'dash',
  },
  idgham_shafawi: {
    id: 'idgham_shafawi',
    name: 'Idghām Shafawī',
    nameArabic: 'إدغام شفوي',
    shortLabel: 'Labial Idgham',
    description: 'Assimilation of mīm sākinah into a following mīm with ghunnah.',
    pronunciation: 'Merge the two mīms into one emphasized mīm with nasalization.',
    when: 'Mīm sākinah followed by م.',
    color: '#dc2626',
    colorDark: '#fca5a5',
    lessonSlug: 'idgham',
    patternHint: 'hash',
  },
  iqlab: {
    id: 'iqlab',
    name: 'Iqlāb',
    nameArabic: 'إقلاب',
    shortLabel: 'Iqlab',
    description: 'Conversion of nūn sākinah or tanwīn into a mīm sound (with ghunnah) before bāʾ.',
    pronunciation: 'Change nūn/tanwīn into a light mīm with ghunnah, then say ب.',
    when: 'Nūn sākinah/tanwīn followed by ب.',
    color: '#0f766e',
    colorDark: '#5eead4',
    lessonSlug: 'iqlab',
    patternHint: 'circle',
  },
  idgham_with_ghunnah: {
    id: 'idgham_with_ghunnah',
    name: 'Idghām with Ghunnah',
    nameArabic: 'إدغام بغنة',
    shortLabel: 'Idgham + Ghunnah',
    description: 'Assimilation of nūn sākinah/tanwīn into ي ن م و with nasalization.',
    pronunciation: 'Merge into the next letter and sustain ghunnah (about two counts).',
    when: 'Nūn sākinah/tanwīn followed by ي، ن، م، و (in a separate word).',
    color: '#16a34a',
    colorDark: '#86efac',
    lessonSlug: 'idgham',
    patternHint: 'hash',
  },
  idgham_without_ghunnah: {
    id: 'idgham_without_ghunnah',
    name: 'Idghām without Ghunnah',
    nameArabic: 'إدغام بلا غنة',
    shortLabel: 'Idgham',
    description: 'Assimilation of nūn sākinah/tanwīn into ل or ر without ghunnah.',
    pronunciation: 'Merge fully into ل/ر with no nasal hold.',
    when: 'Nūn sākinah/tanwīn followed by ل or ر (in a separate word).',
    color: '#15803d',
    colorDark: '#4ade80',
    lessonSlug: 'idgham',
    patternHint: 'hash',
  },
  idgham_mutajanisayn: {
    id: 'idgham_mutajanisayn',
    name: 'Idghām Mutajānisayn',
    nameArabic: 'إدغام متجانسين',
    shortLabel: 'Homorganic Idgham',
    description: 'Assimilation between letters that share the same articulation point but differ in attributes.',
    pronunciation: 'Merge the first letter into the second according to the specific letter pair.',
    when: 'Certain adjacent letter pairs of the same makhraj (as marked in the annotation dataset).',
    color: '#d97706',
    colorDark: '#fcd34d',
    lessonSlug: 'idgham',
    patternHint: 'hash',
  },
  idgham_mutaqaribayn: {
    id: 'idgham_mutaqaribayn',
    name: 'Idghām Mutaqāribayn',
    nameArabic: 'إدغام متقاربين',
    shortLabel: 'Near Idgham',
    description: 'Assimilation between letters that are close in articulation point and attributes.',
    pronunciation: 'Merge as indicated for the pair (follow the annotated form in the mushaf rule set).',
    when: 'Adjacent near letters as marked by the verified tajweed annotations.',
    color: '#b45309',
    colorDark: '#fbbf24',
    lessonSlug: 'idgham',
    patternHint: 'hash',
  },
  silent: {
    id: 'silent',
    name: 'Silent / Unpronounced',
    nameArabic: 'غير ملفوظ',
    shortLabel: 'Silent',
    description: 'A letter present in writing that is not pronounced in that reading context.',
    pronunciation: 'Do not articulate the marked letter.',
    when: 'As indicated by the verified annotation (e.g. certain written letters skipped in recitation).',
    color: '#6b7280',
    colorDark: '#9ca3af',
    lessonSlug: null,
    patternHint: 'muted',
  },
};

export const TAJWEED_RULE_LIST = Object.values(TAJWEED_RULES);

export const KNOWN_TAJWEED_CLASS_SET = new Set<string>(Object.keys(TAJWEED_RULES));

export function getTajweedRule(id: string | null | undefined): TajweedRule | null {
  if (!id) return null;
  const key = id.trim() as TajweedRuleId;
  return TAJWEED_RULES[key] ?? null;
}

export interface TajweedLesson {
  slug: TajweedLessonSlug;
  name: string;
  nameArabic: string;
  summary: string;
  pronunciation: string;
  when: string;
  relatedRuleIds: TajweedRuleId[];
  /** Verified example references only — open in reader for annotated display. */
  exampleRefs: { surah: number; ayah: number; note: string }[];
  relatedSlugs: TajweedLessonSlug[];
}

export const TAJWEED_LESSONS: TajweedLesson[] = [
  {
    slug: 'ghunnah',
    name: 'Ghunnah',
    nameArabic: 'غنة',
    summary:
      'Ghunnah is the nasal quality that accompanies certain letters and noon/meem rules. In the Quran.com tajweed colouring used by QuranPilot, ghunnah segments are highlighted so you can notice where nasalization is sustained.',
    pronunciation: 'Produce a clear nasal sound through the nose while the articulation point of ن/م remains controlled—typically about two counts on shaddah.',
    when: 'Especially on نّ and مّ, and within rules that include ghunnah (such as idghām with ghunnah and ikhfāʾ).',
    relatedRuleIds: ['ghunnah'],
    exampleRefs: [
      { surah: 1, ayah: 1, note: 'Look for nasalised marks when Tajweed highlighting is on.' },
      { surah: 2, ayah: 2, note: 'Observe نّ / related ghunnah colouring in continuous reading.' },
    ],
    relatedSlugs: ['ikhfa', 'idgham', 'iqlab'],
  },
  {
    slug: 'ikhfa',
    name: 'Ikhfāʾ',
    nameArabic: 'إخفاء',
    summary:
      'Ikhfāʾ means concealment: nūn sākinah/tanwīn (or mīm sākinah in the labial case) is neither fully pronounced nor fully merged, but hidden with ghunnah toward the next letter.',
    pronunciation: 'Create a light nasal bridge into the next letter without a hard nūn bounce.',
    when: 'Nūn sākinah/tanwīn before ikhfāʾ letters; mīm sākinah before ب for ikhfāʾ shafawī.',
    relatedRuleIds: ['ikhafa', 'ikhafa_shafawi'],
    exampleRefs: [
      { surah: 2, ayah: 5, note: 'Open this ayah with Tajweed ON to see ikhfāʾ colouring from the verified dataset.' },
    ],
    relatedSlugs: ['ghunnah', 'idgham', 'iqlab'],
  },
  {
    slug: 'idgham',
    name: 'Idghām',
    nameArabic: 'إدغام',
    summary:
      'Idghām is assimilation: one letter merges into the next. Some forms include ghunnah (ي ن م و) and some do not (ل ر). The dataset also marks certain mutajānisayn / mutaqāribayn cases.',
    pronunciation: 'Complete the merge into the following letter; sustain ghunnah only when the rule includes it.',
    when: 'Commonly after nūn sākinah/tanwīn before ي ن م و ل ر (across words), plus specific adjacent-letter assimilations.',
    relatedRuleIds: [
      'idgham_with_ghunnah',
      'idgham_without_ghunnah',
      'idgham_shafawi',
      'idgham_mutajanisayn',
      'idgham_mutaqaribayn',
    ],
    exampleRefs: [
      { surah: 2, ayah: 1, note: 'Use the reader’s Tajweed colours—do not rely on guessed letter rules.' },
    ],
    relatedSlugs: ['ghunnah', 'ikhfa', 'iqlab'],
  },
  {
    slug: 'iqlab',
    name: 'Iqlāb',
    nameArabic: 'إقلاب',
    summary:
      'Iqlāb converts nūn sākinah or tanwīn into a mīm-like sound with ghunnah when followed by bāʾ. Annotation colours help you spot the conversion zones.',
    pronunciation: 'Prepare a light mīm with nasalization, then articulate ب.',
    when: 'Nūn sākinah or tanwīn followed by ب.',
    relatedRuleIds: ['iqlab'],
    exampleRefs: [
      { surah: 2, ayah: 18, note: 'Enable Tajweed in the reader to inspect verified iqlāb spans.' },
    ],
    relatedSlugs: ['ghunnah', 'ikhfa', 'idgham'],
  },
  {
    slug: 'qalqalah',
    name: 'Qalqalah',
    nameArabic: 'قلقلة',
    summary:
      'Qalqalah is a controlled echo on ق ط ب ج د when sākin. The verified highlighting marks where that bounce occurs in the Uthmani tajweed text.',
    pronunciation: 'Release a crisp bounce without inventing a full vowel.',
    when: 'Sukūn on ق ط ب ج د, stronger when stopping on them.',
    relatedRuleIds: ['qalqalah'],
    exampleRefs: [
      { surah: 112, ayah: 1, note: 'Short surahs are convenient for noticing qalqalah marks while listening.' },
    ],
    relatedSlugs: ['madd'],
  },
  {
    slug: 'madd',
    name: 'Madd (Elongation)',
    nameArabic: 'مد',
    summary:
      'Madd lengthens ا و ي. The Quran.com tajweed field distinguishes natural, permissible (separate), and necessary madd with different colours.',
    pronunciation: 'Keep the stretch even and measured; necessary madd is longer than natural madd.',
    when: 'Whenever a madd letter occurs, with length changing based on what follows (hamzah, sukūn/shaddah, word boundary).',
    relatedRuleIds: ['madda_normal', 'madda_permissible', 'madda_necessary'],
    exampleRefs: [
      { surah: 1, ayah: 7, note: 'Compare madd colour tiers with Tajweed ON.' },
    ],
    relatedSlugs: ['qalqalah', 'ghunnah'],
  },
];

export function getTajweedLesson(slug: string): TajweedLesson | undefined {
  return TAJWEED_LESSONS.find((l) => l.slug === slug);
}
