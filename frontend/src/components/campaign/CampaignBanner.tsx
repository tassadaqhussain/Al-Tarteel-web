'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { campaignApi, type PublicCampaign } from '@/lib/api';

const HIDDEN_PREFIXES = [
  '/admin',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/donate/checkout',
];

function surfaceForPath(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/tajweed')) return 'tajweed';
  if (pathname.startsWith('/hifz')) return 'hifz';
  if (pathname.startsWith('/learning-plans')) return 'plans';
  if (pathname.startsWith('/surah/') || pathname.startsWith('/juz/')) return 'reader';
  return 'global';
}

function matchesSurface(campaign: PublicCampaign, surface: string): boolean {
  const channels = campaign.channels;
  if (channels.includes('in_app_global')) return true;
  if (surface === 'home') return channels.includes('in_app_home');
  if (surface === 'reader') return channels.includes('in_app_reader');
  if (surface === 'tajweed') return channels.includes('in_app_tajweed');
  if (surface === 'hifz') return channels.includes('in_app_hifz');
  if (surface === 'plans') return channels.includes('in_app_plans');
  return false;
}

export function CampaignBanner() {
  const pathname = usePathname() || '/';
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      setCampaign(null);
      return;
    }
    const surface = surfaceForPath(pathname);
    let cancelled = false;
    campaignApi
      .active(surface)
      .then((res) => {
        if (cancelled) return;
        const next = res.campaign;
        if (!next || !matchesSurface(next, surface)) {
          setCampaign(null);
          return;
        }
        const key = `qp-campaign-dismissed-${next.id}`;
        setDismissed(sessionStorage.getItem(key) === '1');
        setCampaign(next);
      })
      .catch(() => {
        if (!cancelled) setCampaign(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!campaign || dismissed) return null;

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2.5 sm:items-center sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-ink">{campaign.headline}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-3 sm:line-clamp-1">{campaign.body}</p>
        </div>
        <Link
          href={campaign.destination}
          className="shrink-0 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-brand-contrast hover:opacity-90"
        >
          {campaign.ctaLabel}
        </Link>
        <button
          type="button"
          aria-label="Dismiss campaign"
          className="shrink-0 rounded-md p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
          onClick={() => {
            sessionStorage.setItem(`qp-campaign-dismissed-${campaign.id}`, '1');
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
