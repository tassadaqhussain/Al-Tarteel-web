'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronUp, Search, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { quranApi, type Surah } from '@/lib/api';
import { SURAH_ARABIC, SURAH_MEANINGS } from '@/lib/surah-meta';
import { cn } from '@/lib/utils';

type NavTab = 'surah' | 'verse' | 'juz' | 'page';

const TABS: { id: NavTab; label: string }[] = [
  { id: 'surah', label: 'Surah' },
  { id: 'verse', label: 'Verse' },
  { id: 'juz', label: 'Juz' },
  { id: 'page', label: 'Page' },
];

const JUZ_START = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
];

const COMMON_NAMES: Record<number, string> = {
  1: 'Al-Fatihah',
  2: 'Al-Baqarah',
  3: "Ali 'Imran",
  4: 'An-Nisa',
  5: "Al-Ma'idah",
  6: "Al-An'am",
  7: "Al-A'raf",
  8: 'Al-Anfal',
  9: 'At-Tawbah',
  10: 'Yunus',
  11: 'Hud',
  12: 'Yusuf',
  13: "Ar-Ra'd",
  14: 'Ibrahim',
  15: 'Al-Hijr',
  16: 'An-Nahl',
  17: 'Al-Isra',
  18: 'Al-Kahf',
  19: 'Maryam',
  20: 'Ta-Ha',
  21: 'Al-Anbya',
  22: 'Al-Hajj',
  23: "Al-Mu'minun",
  24: 'An-Nur',
  25: 'Al-Furqan',
  26: "Ash-Shu'ara",
  27: 'An-Naml',
  28: 'Al-Qasas',
  29: "Al-'Ankabut",
  30: 'Ar-Rum',
  31: 'Luqman',
  32: 'As-Sajdah',
  33: 'Al-Ahzab',
  34: 'Saba',
  35: 'Fatir',
  36: 'Ya-Sin',
  37: 'As-Saffat',
  38: 'Sad',
  39: 'Az-Zumar',
  40: 'Ghafir',
  41: 'Fussilat',
  42: 'Ash-Shuraa',
  43: 'Az-Zukhruf',
  44: 'Ad-Dukhan',
  45: 'Al-Jathiyah',
  46: 'Al-Ahqaf',
  47: 'Muhammad',
  48: 'Al-Fath',
  49: 'Al-Hujurat',
  50: 'Qaf',
  51: 'Adh-Dhariyat',
  52: 'At-Tur',
  53: 'An-Najm',
  54: 'Al-Qamar',
  55: 'Ar-Rahman',
  56: "Al-Waqi'ah",
  57: 'Al-Hadid',
  58: 'Al-Mujadila',
  59: 'Al-Hashr',
  60: 'Al-Mumtahanah',
  61: 'As-Saf',
  62: "Al-Jumu'ah",
  63: 'Al-Munafiqun',
  64: 'At-Taghabun',
  65: 'At-Talaq',
  66: 'At-Tahrim',
  67: 'Al-Mulk',
  68: 'Al-Qalam',
  69: 'Al-Haqqah',
  70: "Al-Ma'arij",
  71: 'Nuh',
  72: 'Al-Jinn',
  73: 'Al-Muzzammil',
  74: 'Al-Muddaththir',
  75: 'Al-Qiyamah',
  76: 'Al-Insan',
  77: 'Al-Mursalat',
  78: 'An-Naba',
  79: "An-Nazi'at",
  80: "'Abasa",
  81: 'At-Takwir',
  82: 'Al-Infitar',
  83: 'Al-Mutaffifin',
  84: 'Al-Inshiqaq',
  85: 'Al-Buruj',
  86: 'At-Tariq',
  87: "Al-A'la",
  88: 'Al-Ghashiyah',
  89: 'Al-Fajr',
  90: 'Al-Balad',
  91: 'Ash-Shams',
  92: 'Al-Layl',
  93: 'Ad-Duhaa',
  94: 'Ash-Sharh',
  95: 'At-Tin',
  96: 'Al-Alaq',
  97: 'Al-Qadr',
  98: 'Al-Bayyinah',
  99: 'Az-Zalzalah',
  100: 'Al-Adiyat',
  101: "Al-Qari'ah",
  102: 'At-Takathur',
  103: 'Al-Asr',
  104: 'Al-Humazah',
  105: 'Al-Fil',
  106: 'Quraysh',
  107: "Al-Ma'un",
  108: 'Al-Kawthar',
  109: 'Al-Kafirun',
  110: 'An-Nasr',
  111: 'Al-Masad',
  112: 'Al-Ikhlas',
  113: 'Al-Falaq',
  114: 'An-Nas',
};

const FALLBACK_SURAHS: Surah[] = Array.from({ length: 114 }, (_, i) => {
  const number = i + 1;
  return {
    id: number,
    number,
    nameArabic: SURAH_ARABIC[number] || '',
    nameSimple: COMMON_NAMES[number] || `Surah ${number}`,
    nameComplex: null,
    revelationPlace: 'makkah',
    revelationOrder: null,
    numberOfAyahs: 1,
  };
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Highlight the currently open surah when known. */
  currentSurahNumber?: number;
  currentSurahName?: string;
}

export function NavigateQuranDrawer({
  open,
  onOpenChange,
  currentSurahNumber,
  currentSurahName,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<NavTab>('surah');
  const [filter, setFilter] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>(FALLBACK_SURAHS);
  const [verseInput, setVerseInput] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    quranApi
      .surahs()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) setSurahs(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setFilter('');
      setVerseInput('');
      setTab('surah');
    }
  }, [open]);

  const titleSurah =
    (currentSurahNumber
      ? surahs.find((s) => s.number === currentSurahNumber) ||
        FALLBACK_SURAHS.find((s) => s.number === currentSurahNumber)
      : null) ?? null;

  const heading = titleSurah
    ? `${titleSurah.number}. ${currentSurahName || titleSurah.nameSimple}`
    : 'Navigate Quran';

  const filteredSurahs = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter((s) => {
      const meaning = (SURAH_MEANINGS[s.number] || '').toLowerCase();
      return (
        String(s.number).includes(q) ||
        s.nameSimple.toLowerCase().includes(q) ||
        s.nameArabic.includes(filter.trim()) ||
        meaning.includes(q)
      );
    });
  }, [surahs, filter]);

  const filteredJuz = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const all = Array.from({ length: 30 }, (_, i) => i + 1);
    if (!q) return all;
    return all.filter((j) => `juz ${j}`.includes(q) || String(j) === q);
  }, [filter]);

  const filteredPages = useMemo(() => {
    const q = filter.trim();
    if (!q) return Array.from({ length: 40 }, (_, i) => i + 1);
    const n = parseInt(q, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 604) return [n];
    return Array.from({ length: 604 }, (_, i) => i + 1)
      .filter((p) => String(p).includes(q))
      .slice(0, 40);
  }, [filter]);

  const goVerse = (value?: string) => {
    const raw = (value ?? verseInput).trim().replace(/\s+/g, '');
    const match = raw.match(/^(\d+)[:.:](\d+)$/) || raw.match(/^(\d+)$/);
    if (!match) return;
    const surah = parseInt(match[1], 10);
    const ayah = match[2] ? parseInt(match[2], 10) : 1;
    if (surah < 1 || surah > 114) return;
    onOpenChange(false);
    const page = Math.max(1, Math.ceil(ayah / 20));
    router.push(page > 1 ? `/surah/${surah}?page=${page}` : `/surah/${surah}`);
  };

  const placeholder =
    tab === 'surah'
      ? 'Search Surah'
      : tab === 'juz'
        ? 'Search Juz'
        : tab === 'page'
          ? 'Search Page'
          : 'e.g. 2:255 or 36:1';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-[400px] flex-col gap-0 border-r border-slate-200 bg-white p-0 text-slate-900 [&>button]:hidden sm:max-w-[420px]"
      >
        <div className="px-5 pb-2 pt-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center gap-2 text-left"
          >
            <SheetTitle className="text-xl font-semibold tracking-tight text-slate-900">
              {heading}
            </SheetTitle>
            <ChevronUp className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
            <div className="grid min-w-0 flex-1 grid-cols-4">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setFilter('');
                  }}
                  className={cn(
                    'rounded-full px-2 py-2 text-sm font-medium transition',
                    tab === t.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-3">
          <p className="mb-3 text-sm italic text-slate-400">
            Tip: try navigating with{' '}
            <kbd className="not-italic rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-xs text-slate-600">
              ⌘ K
            </kbd>
          </p>
          {tab === 'verse' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goVerse();
              }}
            >
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={verseInput}
                  onChange={(e) => setVerseInput(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-base text-slate-800 placeholder:text-slate-400 outline-none"
                  autoFocus
                />
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-base text-slate-800 placeholder:text-slate-400 outline-none"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-8 [scrollbar-color:#d1d5db_transparent] [scrollbar-width:thin]">
          {tab === 'surah' &&
            filteredSurahs.map((s) => {
              const active = s.number === currentSurahNumber;
              return (
                <Link
                  key={s.number}
                  href={`/surah/${s.number}`}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center gap-4 rounded-full px-4 py-3 text-[15px] transition',
                    active ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-800 hover:bg-slate-50'
                  )}
                >
                  <span className="w-7 shrink-0 tabular-nums text-slate-500">{s.number}</span>
                  <span className="min-w-0 flex-1 truncate">{s.nameSimple}</span>
                </Link>
              );
            })}

          {tab === 'juz' &&
            filteredJuz.map((j) => {
              const start = JUZ_START[j - 1];
              const startName =
                surahs.find((s) => s.number === start)?.nameSimple || COMMON_NAMES[start];
              return (
                <Link
                  key={j}
                  href={`/juz/${j}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-4 rounded-full px-4 py-3 text-[15px] text-slate-800 transition hover:bg-slate-100"
                >
                  <span className="w-7 shrink-0 tabular-nums text-slate-500">{j}</span>
                  <span className="min-w-0 flex-1 truncate">Juz {j}</span>
                  <span className="truncate text-sm text-slate-400">{startName}</span>
                </Link>
              );
            })}

          {tab === 'page' &&
            filteredPages.map((p) => (
              <Link
                key={p}
                href={`/juz/${Math.min(30, Math.max(1, Math.ceil((p / 604) * 30)))}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-4 rounded-full px-4 py-3 text-[15px] text-slate-800 transition hover:bg-slate-100"
              >
                <span className="w-10 shrink-0 tabular-nums text-slate-500">{p}</span>
                <span>Page {p}</span>
              </Link>
            ))}

          {tab === 'verse' && (
            <div className="px-3 py-2 text-sm text-slate-500">
              <p>
                Enter a reference like <span className="font-medium text-slate-700">2:255</span> and
                press Enter.
              </p>
              <div className="mt-3 space-y-1">
                {[
                  ['1:1', 'Al-Fatihah'],
                  ['2:255', 'Ayat al-Kursi'],
                  ['36:1', 'Ya-Sin'],
                  ['67:1', 'Al-Mulk'],
                ].map(([ref, label]) => (
                  <button
                    key={ref}
                    type="button"
                    onClick={() => goVerse(ref)}
                    className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left transition hover:bg-slate-100"
                  >
                    <span className="font-medium text-slate-800">{ref}</span>
                    <span className="text-slate-500">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'surah' && filteredSurahs.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-slate-400">No surahs found</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
