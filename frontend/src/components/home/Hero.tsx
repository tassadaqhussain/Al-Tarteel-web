import Image from 'next/image';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { HeroContent } from './HeroContent';

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-emerald-900/10 bg-surface-2 py-10 sm:py-14 lg:py-20">
      <Image
        src="/images/quran-hero-v2.png"
        alt="An open Quran on a wooden rehal in a bright mosque"
        fill
        priority
        fetchPriority="high"
        quality={75}
        sizes="100vw"
        className="-z-20 object-cover object-[67%_center] sm:object-center"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-surface-app/95 via-surface-app/85 to-surface-app/25 dark:from-surface-app/95 dark:via-surface-app/85 dark:to-surface-app/45"
        aria-hidden
      />
      <div className={`${SITE_SHELL} relative`}>
        <HeroContent />
      </div>
    </section>
  );
}
