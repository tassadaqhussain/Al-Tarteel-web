import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { NamazHeading } from '@/components/namaz/NamazParts';
import { NamazOverview } from '@/components/namaz/NamazOverview';

export const metadata: Metadata = buildPageMetadata({
  title: 'Learn Namaz – Step-by-Step Salah Guide | QuranPilot',
  description:
    'Learn how to pray salah step by step, from wudu and qibla to salam, with Arabic, transliteration, translation, audio and cited sources.',
  path: '/learn-namaz',
  keywords: ['learn namaz', 'how to pray salah', 'salah steps', 'prayer guide', 'rakah'],
});

export default function LearnNamazPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Learn Namaz', path: '/learn-namaz' }]} />
        <NamazHeading />
        <NamazOverview />
      </main>
    </div>
  );
}
