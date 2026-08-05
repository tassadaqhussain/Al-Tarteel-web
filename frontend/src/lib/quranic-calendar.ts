import calendarData from '@/data/quranic-calendar.json';
import { getSurahMeta } from '@/lib/surah-meta';

export type CalendarWeekRaw = {
  weekNumber: string;
  hijriYear: string;
  hijriMonth: string;
  year: string;
  month: string;
  day: string;
  ranges: string;
};

export type VerseRef = {
  surah: number;
  ayah: number;
  nameSimple: string;
  nameArabic: string;
};

export type CalendarWeek = {
  week: number;
  hijriYear: number;
  hijriMonth: number;
  date: Date;
  ranges: string;
  start: VerseRef;
  end: VerseRef;
};

export type ProgressGroup = {
  id: string;
  label: string;
  from: number;
  to: number;
  weeks: CalendarWeek[];
};

const HIJRI_MONTHS: Record<number, string> = {
  1: "Muharram",
  2: "Safar",
  3: "Rabi' al-Awwal",
  4: "Rabi' al-Thani",
  5: "Jumada al-Ula",
  6: "Jumada al-Akhirah",
  7: "Rajab",
  8: "Sha'ban",
  9: "Ramadan",
  10: "Shawwal",
  11: "Dhu al-Qi'dah",
  12: "Dhu al-Hijjah",
};

/** Accordion ranges as shown on Quran.com/calendar */
const GROUP_BOUNDS: [number, number][] = [
  [1, 9],
  [10, 18],
  [19, 23],
  [24, 29],
  [30, 35],
  [36, 40],
  [41, 46],
];

const DEFAULT_REFLECTIONS = [
  'What is one lesson from this week’s reading that you can apply in your daily life?',
  'Which verse stood out to you, and why?',
];

const REFLECTION_PROMPTS: Record<number, string[]> = {};

function parseRange(ranges: string): { start: VerseRef; end: VerseRef } {
  const [startPart, endPart] = ranges.split('-');
  const [startSurah, startAyah] = startPart.split(':').map(Number);
  const [endSurah, endAyah] = endPart.split(':').map(Number);
  const startMeta = getSurahMeta(startSurah);
  const endMeta = getSurahMeta(endSurah);
  return {
    start: {
      surah: startSurah,
      ayah: startAyah,
      nameSimple: startMeta.nameSimple,
      nameArabic: startMeta.nameArabic,
    },
    end: {
      surah: endSurah,
      ayah: endAyah,
      nameSimple: endMeta.nameSimple,
      nameArabic: endMeta.nameArabic,
    },
  };
}

function toWeek(raw: CalendarWeekRaw): CalendarWeek {
  const { start, end } = parseRange(raw.ranges);
  return {
    week: Number(raw.weekNumber),
    hijriYear: Number(raw.hijriYear),
    hijriMonth: Number(raw.hijriMonth),
    date: new Date(Number(raw.year), Number(raw.month) - 1, Number(raw.day)),
    ranges: raw.ranges,
    start,
    end,
  };
}

let cachedWeeks: CalendarWeek[] | null = null;

export function getAllCalendarWeeks(): CalendarWeek[] {
  if (cachedWeeks) return cachedWeeks;
  const weeks: CalendarWeek[] = [];
  for (const monthWeeks of Object.values(calendarData as Record<string, CalendarWeekRaw[]>)) {
    for (const raw of monthWeeks) weeks.push(toWeek(raw));
  }
  weeks.sort((a, b) => a.week - b.week);
  cachedWeeks = weeks;
  return weeks;
}

export function getCalendarWeek(weekNumber: number): CalendarWeek | undefined {
  return getAllCalendarWeeks().find((w) => w.week === weekNumber);
}

/** Current program week (1–46), based on schedule dates with cycle wrap. */
export function getCurrentProgramWeek(date = new Date()): number {
  const weeks = getAllCalendarWeeks();
  if (weeks.length === 0) return 1;

  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  const first = weeks[0].date;
  const last = weeks[weeks.length - 1].date;

  if (today < first) return 1;

  if (today > last) {
    const daysPast = Math.floor((today.getTime() - last.getTime()) / 86400000);
    // Rough next-cycle progress after Sha'ban / Ramadan gap (~4–5 weeks)
    const cycleOffset = Math.floor(daysPast / 7) - 5;
    const w = ((cycleOffset % 46) + 46) % 46;
    return w + 1;
  }

  let current = weeks[0].week;
  for (const week of weeks) {
    if (week.date <= today) current = week.week;
    else break;
  }
  return current;
}

export function getHijriMonthName(month: number): string {
  return HIJRI_MONTHS[month] || `Month ${month}`;
}

export function formatVerseLabel(ref: VerseRef): string {
  return `${ref.nameSimple} Verse ${ref.ayah} (${ref.surah}:${ref.ayah})`;
}

export function formatWeekReadingLabel(week: CalendarWeek): string {
  return `${formatVerseLabel(week.start)} To ${formatVerseLabel(week.end)}`;
}

export function weekReadingHref(week: CalendarWeek): string {
  return `/surah/${week.start.surah}`;
}

export function getProgressGroups(): ProgressGroup[] {
  const weeks = getAllCalendarWeeks();
  return GROUP_BOUNDS.map(([from, to]) => ({
    id: `${from}-${to}`,
    label: `Week ${from} - ${to}`,
    from,
    to,
    weeks: weeks.filter((w) => w.week >= from && w.week <= to),
  }));
}

export function getReflectionPrompts(week: number): string[] {
  return REFLECTION_PROMPTS[week] || DEFAULT_REFLECTIONS;
}

export function getFaqItems(): { question: string; answer: string }[] {
  return [
    {
      question: 'What is "Quran in a Year"?',
      answer:
        'Quran in a Year is a simple, structured reading plan to help you complete the entire Quran in one year—from the end of one Ramadan to the beginning of the next. The goal is to gain a basic understanding of the Quran from cover to cover without feeling pressured or overwhelmed.',
    },
    {
      question: 'How does the program work?',
      answer:
        "You are invited to make time each week to read just a few pages of the Quran in a language you understand. There are 46 readings in total, one for each week in the Islamic calendar from Shawwal to Sha'ban.",
    },
    {
      question: 'Do I need to know how to read Arabic to participate?',
      answer:
        'Not at all. The starting point is to engage with the Quran’s meanings through any translation you are comfortable with. QuranPilot offers translations to make this accessible for everyone.',
    },
    {
      question: 'What if I fall behind or join late?',
      answer:
        'Feel free to go back and complete the weeks that you’ve missed, or start from the current week and continue at your own pace. Consistency matters more than perfection.',
    },
    {
      question: 'Is this free? Can I share it?',
      answer:
        'Yes — this program is free. You’re welcome to share it with family and friends and invite them on the journey.',
    },
  ];
}
