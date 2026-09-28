/**
 * New-feature announcements, newest first. Add an entry here when a feature
 * ships; signed-in users see it in "What's new" and admins can email it once
 * from Admin → Announcements.
 *
 * - `id` is permanent: read state and the email log are keyed on it.
 * - `publishedAt` controls ordering, and users only get an unread notice for
 *   announcements published after they created their account.
 * - English is required; add other locales only with reviewed translations.
 */

export type AnnouncementText = { en: string } & Partial<Record<string, string>>;

export type Announcement = {
  id: string;
  /** ISO date (YYYY-MM-DD). Entries dated in the future stay hidden until then. */
  publishedAt: string;
  title: AnnouncementText;
  body: AnnouncementText;
  ctaLabel: AnnouncementText;
  /** Site path, e.g. `/learn-namaz`. */
  ctaPath: string;
  /** Email copy; when omitted, the announcement cannot be emailed. */
  email?: { subject: string; body: string };
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'learn-namaz-2026-09',
    publishedAt: '2026-09-28',
    title: { en: 'New: Learn Namaz', ur: 'نیا: نماز سیکھیں', ar: 'جديد: تعلّم الصلاة' },
    body: {
      en: 'A calm, step-by-step guide to salah — from wudu and qibla to salam — with Arabic, transliteration, translation, recitation audio and a practice mode.',
      ur: 'وضو اور قبلہ سے سلام تک، نماز کی پُرسکون مرحلہ وار رہنمائی — عربی متن، رومن تلفظ، ترجمہ، تلاوت کی آڈیو اور مشق موڈ کے ساتھ۔',
      ar: 'دليل هادئ خطوة بخطوة للصلاة، من الوضوء واستقبال القبلة حتى التسليم، مع النص العربي والنطق والترجمة وتلاوة صوتية ووضع للتدريب.',
    },
    ctaLabel: { en: 'Start learning', ur: 'سیکھنا شروع کریں', ar: 'ابدأ التعلّم' },
    ctaPath: '/learn-namaz',
    email: {
      subject: 'New on QuranPilot: Learn Namaz',
      body:
        'We have added Learn Namaz: a calm, step-by-step guide to performing salah, from preparation through salam.\n\n' +
        'Each step shows what to do, the Arabic recitation with transliteration and translation, and spoken guidance you can replay or slow down. A practice mode reads each step aloud as you go.\n\n' +
        'The lesson content cites its sources and notes where schools of thought differ.',
    },
  },
];

export function publishedAnnouncements(now = new Date()): Announcement[] {
  const today = now.toISOString().slice(0, 10);
  return ANNOUNCEMENTS.filter((a) => a.publishedAt <= today).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function findAnnouncement(id: string): Announcement | undefined {
  return ANNOUNCEMENTS.find((a) => a.id === id);
}
