'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Type,
  BookOpen,
  Languages,
  BookMarked,
  Mic2,
  Eye,
  AlignJustify,
  Check,
  X,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useSettingsStore, type FontSize, type MushafType, type ReadingMode } from '@/stores/settingsStore';
import { useTheme } from '@/components/ThemeProvider';
import { quranApi, audioApi, type TafsirSource, type Reciter, type Translator } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-[var(--fg)]">{title}</h2>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </section>
  );
}

// ── Row ────────────────────────────────────────────────────────────────────────
function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--fg)]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[var(--muted)]">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

// ── Chip group ─────────────────────────────────────────────────────────────────
function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            value === o.value
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--fg)]'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    fontSize,
    setFontSize,
    mushafType,
    setMushafType,
    readingMode,
    setReadingMode,
    showTranslation,
    setShowTranslation,
    showTransliteration,
    setShowTransliteration,
    showWordByWord,
    setShowWordByWord,
    translationSlugs,
    setTranslationSlugs,
    tafsirSlug,
    setTafsirSlug,
    reciterSlug,
    setReciterSlug,
  } = useSettingsStore();

  const [translators, setTranslators] = useState<Translator[]>([]);
  const [tafsirSources, setTafsirSources] = useState<TafsirSource[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);

  useEffect(() => {
    quranApi.translators().then(setTranslators).catch(() => {});
    quranApi.tafsirSources().then(setTafsirSources).catch(() => {});
    audioApi.reciters().then(setReciters).catch(() => {});
  }, []);

  const removeTranslation = (slug: string) => {
    setTranslationSlugs(translationSlugs.filter((s) => s !== slug));
  };

  const activeTranslators = translationSlugs
    .map((slug) => translators.find((t) => t.slug === slug))
    .filter(Boolean) as Translator[];

  const activeReciter = reciters.find((r) => r.slug === reciterSlug);
  const activeTafsir = tafsirSources.find((s) => s.slug === tafsirSlug);

  return (
    <div className="min-h-screen pb-16">
      <Header />

      {/* Sub-header */}
      <div className="sticky top-[57px] z-40 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-gold)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
          <h1 className="text-sm font-semibold text-[var(--fg)]">Settings</h1>
          <div className="w-16" />
        </div>
      </div>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        {/* ── Appearance ──────────────────────────────────────────────────── */}
        <Section title="Appearance" icon={<Sun className="h-4 w-4" />}>
          <Row label="Theme" description="Choose your preferred color scheme">
            <div className="flex gap-1.5">
              {([
                { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
                { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
                { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  title={t.label}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                    theme === t.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]'
                  )}
                  aria-label={t.label}
                  aria-pressed={theme === t.value}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* ── Reader ──────────────────────────────────────────────────────── */}
        <Section title="Reader" icon={<BookOpen className="h-4 w-4" />}>
          <Row label="Font Size" description="Arabic text size while reading">
            <ChipGroup<FontSize>
              options={[
                { value: 'sm', label: 'S' },
                { value: 'md', label: 'M' },
                { value: 'lg', label: 'L' },
                { value: 'xl', label: 'XL' },
              ]}
              value={fontSize}
              onChange={setFontSize}
            />
          </Row>

          <Row label="Mushaf Style" description="Text rendering style">
            <ChipGroup<MushafType>
              options={[
                { value: 'uthmani', label: 'Uthmani' },
                { value: 'indopak', label: 'IndoPak' },
                { value: 'simple', label: 'Simple' },
              ]}
              value={mushafType}
              onChange={setMushafType}
            />
          </Row>

          <Row label="Reading Mode" description="How verses are displayed">
            <ChipGroup<ReadingMode>
              options={[
                { value: 'paged', label: 'Paged' },
                { value: 'continuous', label: 'Continuous' },
              ]}
              value={readingMode}
              onChange={setReadingMode}
            />
          </Row>

          <Row label="Show Translation" description="Display translation below each verse">
            <Toggle checked={showTranslation} onChange={setShowTranslation} />
          </Row>

          <Row label="Show Transliteration" description="Display Latin transliteration">
            <Toggle checked={showTransliteration} onChange={setShowTransliteration} />
          </Row>

          <Row label="Word-by-Word" description="Show meaning for each word">
            <Toggle checked={showWordByWord} onChange={setShowWordByWord} />
          </Row>
        </Section>

        {/* ── Translations ────────────────────────────────────────────────── */}
        <Section title="Translations" icon={<Languages className="h-4 w-4" />}>
          {activeTranslators.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-[var(--muted)]">No translations selected.</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Open any Surah and use the translations button to add one.
              </p>
            </div>
          ) : (
            activeTranslators.map((t) => (
              <Row key={t.slug} label={t.name} description={t.languageCode ? `Language: ${t.languageCode}` : undefined}>
                <button
                  type="button"
                  onClick={() => removeTranslation(t.slug)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  aria-label={`Remove ${t.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Row>
            ))
          )}
        </Section>

        {/* ── Tafsir ──────────────────────────────────────────────────────── */}
        <Section title="Tafsir" icon={<BookMarked className="h-4 w-4" />}>
          {tafsirSources.length === 0 ? (
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--muted)]">Loading sources…</p>
            </div>
          ) : (
            <>
              {activeTafsir && (
                <Row label="Active Source" description={activeTafsir.author ?? undefined}>
                  <span className="rounded-full bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-500">
                    {activeTafsir.name}
                  </span>
                </Row>
              )}
              <div className="px-5 py-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Available Sources</p>
                <div className="space-y-1">
                  {tafsirSources.map((src) => (
                    <button
                      key={src.slug}
                      type="button"
                      onClick={() => setTafsirSlug(src.slug === tafsirSlug ? null : src.slug)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--ayah-highlight)]',
                        src.slug === tafsirSlug && 'bg-[var(--accent)]/5'
                      )}
                    >
                      <div>
                        <p className={cn('font-medium', src.slug === tafsirSlug ? 'text-[var(--accent)]' : 'text-[var(--fg)]')}>
                          {src.name}
                        </p>
                        {src.author && (
                          <p className="mt-0.5 text-xs text-[var(--muted)]">{src.author}</p>
                        )}
                      </div>
                      {src.slug === tafsirSlug && (
                        <Check className="h-4 w-4 text-[var(--accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ── Audio ───────────────────────────────────────────────────────── */}
        <Section title="Audio" icon={<Mic2 className="h-4 w-4" />}>
          {reciters.length === 0 ? (
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--muted)]">Loading reciters…</p>
            </div>
          ) : (
            <>
              {activeReciter && (
                <Row label="Active Reciter" description="Used when playing audio">
                  <span className="rounded-full bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-500">
                    {activeReciter.name}
                  </span>
                </Row>
              )}
              <div className="px-5 py-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Available Reciters</p>
                <div className="space-y-1">
                  {reciters.map((r) => (
                    <button
                      key={r.slug}
                      type="button"
                      onClick={() => setReciterSlug(r.slug === reciterSlug ? null : r.slug)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--ayah-highlight)]',
                        r.slug === reciterSlug && 'bg-[var(--accent)]/5'
                      )}
                    >
                      <div>
                        <p className={cn('font-medium', r.slug === reciterSlug ? 'text-[var(--accent)]' : 'text-[var(--fg)]')}>
                          {r.name}
                        </p>
                        {r.style && (
                          <p className="mt-0.5 text-xs text-[var(--muted)]">{r.style}</p>
                        )}
                      </div>
                      {r.slug === reciterSlug && (
                        <Check className="h-4 w-4 text-[var(--accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ── About ───────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-center">
          <p className="text-xs text-[var(--muted)]">Al-Tarteel · Quran Reader</p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]/60">All data sourced from authenticated Islamic texts</p>
        </div>
      </main>
    </div>
  );
}
