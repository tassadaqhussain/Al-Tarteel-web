'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { useT } from '@/lib/i18n';
import { SITE_SHELL } from '@/components/layout/MainContainer';

export function SiteFooter() {
  const { t } = useT();

  return (
    <footer data-site-footer className="w-full border-t-4 border-amber-500 bg-[#063a32] text-white">
      <div className={SITE_SHELL}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-9 py-10 sm:py-12 md:grid-cols-[minmax(0,1.6fr)_minmax(140px,0.7fr)_minmax(160px,0.7fr)] md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 font-serif text-2xl font-bold">
              <span className="flex h-11 w-11 items-center justify-center rounded border border-white/15 bg-white shadow-sm">
                <SiteLogo size={34} className="h-8 w-8" alt="QuranPilot logo" />
              </span>
              <span>QuranPilot</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-emerald-50/75">
              {t('footerTagline')}
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
              {t('sitemap')}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-emerald-50/75 transition hover:text-white">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/surahs" className="text-emerald-50/75 transition hover:text-white">
                  {t('chapters')}
                </Link>
              </li>
              <li>
                <Link href="/learning-plans" className="text-emerald-50/75 transition hover:text-white">
                  {t('learningPlans')}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-emerald-50/75 transition hover:text-white">
                  {t('feedback')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
              {t('resources')}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/quran-in-year" className="text-emerald-50/75 transition hover:text-white">
                  {t('quranInYear')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-emerald-50/75 transition hover:text-white">
                  {t('search')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-emerald-50/75 transition hover:text-white">
                  {t('donate')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 px-14 py-5 text-center text-xs text-emerald-50/55 sm:px-0">
          © {new Date().getFullYear()} QuranPilot. {t('footerRights')}
        </div>
      </div>
    </footer>
  );
}
