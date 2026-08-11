'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { useT } from '@/lib/i18n';

export function SiteFooter() {
  const { t } = useT();

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-serif text-xl font-bold text-slate-900">
              <SiteLogo size={24} className="h-6 w-6" alt="QuranPilot logo" />
              <span>QuranPilot</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">{t('footerTagline')}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('sitemap')}</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-emerald-800">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/surahs" className="text-slate-500 hover:text-emerald-800">
                  {t('chapters')}
                </Link>
              </li>
              <li>
                <Link href="/learning-plans" className="text-slate-500 hover:text-emerald-800">
                  {t('learningPlans')}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-slate-500 hover:text-emerald-800">
                  {t('feedback')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('resources')}</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/quran-in-year" className="text-slate-500 hover:text-emerald-800">
                  {t('quranInYear')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-slate-500 hover:text-emerald-800">
                  {t('search')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-slate-500 hover:text-emerald-800">
                  {t('donate')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} QuranPilot. {t('footerRights')}
        </div>
      </div>
    </footer>
  );
}
