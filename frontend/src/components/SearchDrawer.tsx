'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Mic, Search, TrendingUp, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { quranApi } from '@/lib/api';
import { getSurahHref, getSurahPath } from '@/lib/surah-meta';
import { parseQuranPageSearch, resolveDirectSearchHref } from '@/lib/search-navigation';

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

    const directHref = resolveDirectSearchHref(q);
    if (directHref) return navigate(directHref);

    const pageNumber = parseQuranPageSearch(q);
    if (pageNumber) {
      try {
        const ayahs = await quranApi.ayahsByPage(pageNumber, { limit: 1 });
        const first = ayahs[0];
        if (first?.surah?.number && first.number) {
          return navigate(
            getSurahHref(first.surah.number, {
              ayahId: first.id,
              ayahNumber: first.number,
            })
          );
        }
      } catch {
        // Fall through to the search results page when the Quran API is unavailable.
      }
    }

    // Try unified app commands before falling back to a translation search.
    const intent = parseVoiceIntent(q);
    const executed = executeVoiceCommand({
      intent,
      router,
    });

    if (executed) return;

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
        className="w-full max-w-none overflow-y-auto border-l border-line bg-surface p-0 text-ink [&>button]:hidden sm:w-[460px] sm:max-w-[460px]"
      >
        <SheetTitle className="sr-only">Search the Quran</SheetTitle>
        <form onSubmit={onSubmit} className="flex h-[88px] items-center gap-4 border-b border-line px-6">
          <button
            type="submit"
            className="rounded-full p-2 text-brand transition hover:bg-brand/10"
            aria-label="Run search"
            title="Run search"
          >
            <Search className="h-6 w-6" />
          </button>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search the Quran"
            className="min-w-0 flex-1 bg-transparent text-2xl text-ink outline-none placeholder:text-ink-muted"
          />
          <button type="button" onClick={onMicClick} className="rounded-full p-2 text-ink hover:bg-surface-3" aria-label="Voice search">
            <Mic className="h-7 w-7" />
          </button>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-ink hover:bg-surface-3" aria-label="Close search">
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
      <h2 className="pb-4 text-xl font-bold text-ink">{title}</h2>
      <div className="border-t border-line">{children}</div>
    </section>
  );
}

function Suggestion({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-5 border-b border-line px-2 py-4 text-left text-xl text-ink transition hover:bg-surface-2 hover:text-[var(--accent)]">
      <span className="text-ink-faint">{icon}</span>
      {label}
    </button>
  );
}
