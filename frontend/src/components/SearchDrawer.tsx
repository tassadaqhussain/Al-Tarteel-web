'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Mic, Search, TrendingUp, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { quranApi } from '@/lib/api';
import { getSurahPath } from '@/lib/surah-meta';
import { SURAH_PAGE_SIZE } from '@/lib/surah-pagination';

import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { parseVoiceIntent } from '@/lib/voice/parseVoiceIntent';
import { executeVoiceCommand } from '@/lib/voice/executeVoiceCommand';

const POPULAR = [
  { label: 'Al-Mulk', href: getSurahPath(67) },
  { label: 'Nuh', href: getSurahPath(71) },
  { label: 'Al-Kahf', href: getSurahPath(18) },
  { label: 'Ya-Sin', href: getSurahPath(36) },
];

const EXAMPLES = ['Juz 1', 'Page 1', 'Ya-Sin', '36', '2:255'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDrawer({ open, onOpenChange }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const { startListening } = useVoiceSearch();

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 100);
    else setQuery('');
  }, [open]);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const submit = async (value = query) => {
    const q = value.trim();
    if (!q) return;

    onOpenChange(false);

    // Try unified intent parser first
    const intent = parseVoiceIntent(q);
    const executed = executeVoiceCommand({
      intent,
      router,
    });

    if (executed) return;

    const juz = q.match(/^juz\s*(\d{1,2})$/i);
    if (juz) {
      const number = Number(juz[1]);
      if (number >= 1 && number <= 30) return navigate(`/juz/${number}`);
    }

    const page = q.match(/^page\s*(\d{1,3})$/i);
    if (page) {
      const number = Number(page[1]);
      if (number >= 1 && number <= 604) {
        try {
          const ayahs = await quranApi.ayahsByPage(number, { limit: 1 });
          const first = ayahs[0];
          if (first?.surah?.number) return navigate(getSurahPath(first.surah.number));
        } catch {}
      }
    }

    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const onMicClick = () => {
    onOpenChange(false);
    startListening();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-none overflow-y-auto border-l border-slate-200 bg-white p-0 text-slate-800 [&>button]:hidden sm:w-[460px] sm:max-w-[460px]"
      >
        <SheetTitle className="sr-only">Search the Quran</SheetTitle>
        <form onSubmit={onSubmit} className="flex h-[88px] items-center gap-4 border-b border-slate-200 px-6">
          <Search className="h-7 w-7 shrink-0 text-slate-600" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search the Quran"
            className="min-w-0 flex-1 bg-transparent text-2xl text-slate-800 outline-none placeholder:text-slate-500"
          />
          <button type="button" onClick={onMicClick} className="rounded-full p-2 text-slate-900 hover:bg-slate-100" aria-label="Voice search">
            <Mic className="h-7 w-7" />
          </button>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-slate-900 hover:bg-slate-100" aria-label="Close search">
            <X className="h-7 w-7" />
          </button>
        </form>

        <div className="px-7 py-8">
          <SuggestionSection title="Popular searches">
            {POPULAR.map((item) => (
              <Suggestion key={item.label} label={item.label} icon={<TrendingUp className="h-5 w-5" />} onClick={() => navigate(item.href)} />
            ))}
          </SuggestionSection>

          <SuggestionSection title="Try searching for" className="mt-7">
            {EXAMPLES.map((label) => (
              <Suggestion key={label} label={label} icon={<BookOpen className="h-5 w-5" />} onClick={() => void submit(label)} />
            ))}
          </SuggestionSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SuggestionSection({ title, className = '', children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={className}>
      <h2 className="pb-4 text-xl font-bold text-slate-900">{title}</h2>
      <div className="border-t border-slate-200">{children}</div>
    </section>
  );
}

function Suggestion({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-5 border-b border-slate-200 px-2 py-4 text-left text-xl text-slate-800 transition hover:bg-slate-50 hover:text-[var(--accent)]">
      <span className="text-slate-300">{icon}</span>
      {label}
    </button>
  );
}
