'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { useT } from '@/lib/i18n';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { CONTENT_LOCALES, localeConfig, localePath } from '@/lib/i18n/content-locales';
import { DONATE_ENABLED } from '@/lib/features';

export function SiteFooter() {
  const { t } = useT();

  return (
    <footer
      data-site-footer
      className="w-full border-t border-white/10 bg-[#064E3B] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] text-white sm:pb-20"
    >
      <div className={SITE_SHELL}>
        <div className="flex flex-col gap-6 py-8 sm:py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-3 font-serif text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white shadow-sm">
                <SiteLogo size={30} className="h-7 w-7" alt="QuranPilot logo" />
              </span>
              <span>QuranPilot</span>
            </Link>

            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-emerald-50/85">
                <li>
                  <Link href="/surahs" className="transition hover:text-white">
                    {t('navSurahs')}
                  </Link>
                </li>
                <li>
                  <Link href="/juz" className="transition hover:text-white">
                    {t('tabJuz')}
                  </Link>
                </li>
                <li>
                  <Link href="/hifz" className="transition hover:text-white">
                    {t('hifz')}
                  </Link>
                </li>
                <li>
                  <Link href="/learning-plans" className="transition hover:text-white">
                    {t('learn')}
                  </Link>
                </li>
                <li>
                  <Link href="/tajweed" className="transition hover:text-white">
                    {t('tajweed')}
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="transition hover:text-white">
                    {t('navArticles')}
                  </Link>
                </li>
                <li>
                  <Link href="/quran-in-year" className="transition hover:text-white">
                    {t('quranInYear')}
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="transition hover:text-white">
                    {t('search')}
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="transition hover:text-white">
                    {t('feedback')}
                  </Link>
                </li>
                {DONATE_ENABLED && (
                  <li>
                    <Link href="/donate" className="transition hover:text-white">
                      {t('donate')}
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
            <nav aria-label="Quran translation languages">
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs sm:text-sm">
                {CONTENT_LOCALES.map((locale) => (
                  <li key={locale}>
                    <Link
                      href={localePath(locale, '/')}
                      hrefLang={locale}
                      lang={locale}
                      className="text-emerald-50/75 transition hover:text-white"
                    >
                      {localeConfig(locale).nativeName}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="text-xs text-emerald-50/65">
              © {new Date().getFullYear()} QuranPilot. {t('footerRights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
