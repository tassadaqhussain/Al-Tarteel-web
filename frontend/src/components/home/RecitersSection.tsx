import { Headphones } from 'lucide-react';
import { ReciterTile, type ReciterTileVariant } from '@/components/audio/ReciterTile';
import { Msg } from '@/components/i18n/Msg';
import type { MessageKey } from '@/lib/i18n/messages';
import { SITE_SHELL } from '@/components/layout/MainContainer';

const RECITERS: Array<{
  variant: ReciterTileVariant;
  name: string;
  desc: MessageKey;
}> = [
  { variant: 'alafasy', name: 'Mishary Rashid Alafasy', desc: 'reciterDescAlafasy' },
  { variant: 'sudais', name: 'Abdul Rahman Al-Sudais', desc: 'reciterDescSudais' },
  { variant: 'basit', name: 'Abdul Basit Abdus Samad', desc: 'reciterDescBasit' },
  { variant: 'dosari', name: 'Yasser Al-Dosari', desc: 'reciterDescHaramImam' },
  { variant: 'balila', name: 'Abdul Aziz Bin Bandar Balila', desc: 'reciterDescHaramImam' },
  { variant: 'ousi', name: 'Abdur Rahman Al-Ousi', desc: 'reciterDescOusi' },
];

export function RecitersSection() {
  return (
    <section className="w-full bg-surface py-16 2xl:py-20">
      <div className={SITE_SHELL}>
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl 2xl:text-5xl">
            <Msg k="recitersTitle" /> <br className="sm:hidden" />
            <span className="text-brand"><Msg k="recitersAccent" /></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECITERS.map((r) => (
            <div
              key={r.variant}
              className="group relative flex flex-col items-center rounded-3xl border border-line-subtle bg-brand/[0.025] p-6 text-center transition-all duration-300 hover:bg-brand/[0.05] hover:shadow-md motion-safe:hover:-translate-y-1"
            >
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-surface bg-brand/10 shadow-md transition motion-safe:group-hover:scale-105 sm:h-36 sm:w-36 xl:h-44 xl:w-44">
                <ReciterTile variant={r.variant} />
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 opacity-0 transition group-hover:opacity-100">
                  <Headphones className="h-8 w-8 text-white motion-safe:animate-pulse" />
                </div>
              </div>

              <h3 className="text-base font-bold text-ink transition group-hover:text-brand 2xl:text-lg">
                {r.name}
              </h3>
              <p className="mt-1 text-xs text-ink-muted"><Msg k={r.desc} /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
