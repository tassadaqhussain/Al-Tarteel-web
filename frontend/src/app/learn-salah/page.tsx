import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckSquare, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { SalahGuide } from '@/components/salah/SalahGuide';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { buildPageMetadata } from '@/lib/seo';
import { SITE_SHELL } from '@/components/layout/MainContainer';

export const metadata: Metadata = buildPageMetadata({
  title: 'Salah Step by Step Visual Check | Complete Prayer Guide',
  description:
    'Learn Salah step-by-step with interactive visual alignment guides, posture checklists, 7-point Sujood verification, Arabic recitation, and complete daily prayer walkthroughs.',
  path: '/learn-salah',
  keywords: [
    'salah step by step',
    'salah visual check',
    'learn salah visual',
    'prayer posture check',
    'learn namaz step by step',
    'how to pray salah',
    'salah alignment guide',
    'seven points of sujood',
    'prayer guide for beginners',
  ],
});

export default function LearnSalahPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />
      <main className={SITE_SHELL + ' flex-1 py-8 lg:py-12'}>
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Learn Salah', path: '/learn-salah' },
          ]}
        />

        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Visual Alignment & Verification</span>
          </div>

          <h1 className="mt-3 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
            Salah Step-by-Step Visual Check
          </h1>

          <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
            Master every movement of prayer with interactive posture alignment guides, 
            7-point Sujood indicators, audio dhikr recitations, and visual checklists for all 5 daily prayers.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
            <Link
              href="/al-fatihah"
              className="rounded-full border border-line bg-surface px-4 py-2 font-semibold text-ink transition hover:border-[var(--accent)]"
            >
              Open Al-Fatihah
            </Link>
            <Link
              href="/tajweed"
              className="rounded-full border border-line bg-surface px-4 py-2 font-semibold text-ink transition hover:border-[var(--accent)]"
            >
              Learn Tajweed
            </Link>
          </div>
        </div>

        <SalahGuide />
      </main>
      <SiteFooter />
    </div>
  );
}
