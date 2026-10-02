import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { NamazHeading } from '@/components/namaz/NamazParts';
import { NamazLesson } from '@/components/namaz/NamazLesson';
import { NamazOutline } from '@/components/namaz/NamazOutline';
import { NAMAZ_CONTENT } from '@/lib/namaz/content';
import { getPrayer, isPrayerId, PRAYER_IDS } from '@/lib/namaz/lesson';

type Props = { params: Promise<{ prayer: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return PRAYER_IDS.map((prayer) => ({ prayer }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prayer: id } = await params;
  const prayer = getPrayer(NAMAZ_CONTENT, id);
  if (!prayer) return { title: 'Learn Namaz' };
  return buildPageMetadata({
    title: `How to Pray ${prayer.name.en} (${prayer.rakahs} Rak’ahs) – Learn Namaz | QuranPilot`,
    description: `Step-by-step guide to the ${prayer.rakahs} obligatory rak’ahs of ${prayer.name.en}, with Arabic, transliteration, translation, audio and cited sources.`,
    path: `/learn-namaz/${prayer.id}`,
    keywords: [`how to pray ${prayer.name.en}`, `${prayer.name.en} namaz`, 'salah steps'],
    type: 'article',
    // Held out of the index until the lesson content passes scholarly review
    // (see the review status in src/lib/namaz/content.ts).
    noIndex: true,
  });
}

export default async function NamazPrayerPage({ params }: Props) {
  const { prayer: id } = await params;
  if (!isPrayerId(id)) notFound();
  const prayer = getPrayer(NAMAZ_CONTENT, id)!;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Learn Namaz', path: '/learn-namaz' },
            { name: prayer.name.en, path: `/learn-namaz/${prayer.id}` },
          ]}
        />
        <NamazHeading prayerId={prayer.id} />
        <NamazLesson prayerId={prayer.id} />
        <NamazOutline prayerId={prayer.id} />
      </main>
    </div>
  );
}
