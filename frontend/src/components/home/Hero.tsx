import Image from 'next/image';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { HeroContent } from './HeroContent';

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-emerald-900/10 bg-[#eef2ed] py-8 sm:py-11 lg:py-16">
      <Image
        src="/images/quran-hero-v2.png"
        alt="An open Quran on a wooden rehal in a bright mosque"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="-z-20 object-cover object-[67%_center] sm:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-white/54 sm:bg-white/42" aria-hidden />
      <div className={`${SITE_SHELL} relative`}>
        <HeroContent />
      </div>
    </section>
  );
}
