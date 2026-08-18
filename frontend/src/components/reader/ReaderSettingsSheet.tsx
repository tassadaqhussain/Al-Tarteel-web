'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Minus, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { audioApi, quranApi, type Reciter, type Translator } from '@/lib/api';
import { catalogTranslationReciters } from '@/lib/audio/translation-reciters';
import { useSettingsStore, WORD_BY_WORD_LOCALES, type FontSize, type MushafType } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { TranslationSheet } from './TranslationSheet';
import { ReciterSheet } from './ReciterSheet';
import { rebuildActivePlayback } from '@/lib/audio/playback';

type SettingsTab = 'arabic' | 'translation' | 'word';
const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const SCRIPTS: { value: MushafType; label: string }[] = [
  { value: 'uthmani', label: 'Uthmani' },
  { value: 'indopak', label: 'IndoPak' },
  { value: 'simple', label: 'Tajweed' },
];

interface Props { open: boolean; onOpenChange: (open: boolean) => void }

export function ReaderSettingsSheet({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<SettingsTab>('arabic');
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [recitersOpen, setRecitersOpen] = useState(false);
  const [translationPickerOpen, setTranslationPickerOpen] = useState(false);
  const [translators, setTranslators] = useState<Translator[]>([]);
  const {
    fontSize, setFontSize, mushafLines, setMushafLines, mushafType, setMushafType,
    showTranslation, setShowTranslation, showWordByWord, setShowWordByWord,
    translationSlugs, setTranslationSlugs, reciterSlug, setReciterSlug,
    translationReciterSlug, setTranslationReciterSlug,
    showTajweedRules, setShowTajweedRules, copyVerseAsGlyphs, setCopyVerseAsGlyphs,
    translationFontSize, setTranslationFontSize,
    wordByWordFontSize, setWordByWordFontSize, wordByWordDisplay, setWordByWordDisplay,
    wordByWordShowTranslation, setWordByWordShowTranslation,
    wordByWordShowTransliteration, setWordByWordShowTransliteration,
    wordByWordLocale, setWordByWordLocale, wordClickPlayAudio, setWordClickPlayAudio,
    wordClickSpeakMeaning, setWordClickSpeakMeaning,
  } = useSettingsStore();

  useEffect(() => {
    if (!open) return;
    audioApi.reciters().then((data) => {
      const list = Array.isArray(data) ? data : [];
      const hasTranslations = list.some((item) => item.kind === 'translation');
      setReciters(hasTranslations ? list : [...list, ...catalogTranslationReciters()]);
    }).catch(() => setReciters(catalogTranslationReciters()));
    quranApi.translators().then((data) => setTranslators(Array.isArray(data) ? data : [])).catch(() => setTranslators([]));
  }, [open]);

  const fontIndex = FONT_SIZES.indexOf(fontSize);
  const activeReciter = reciters.find((r) => r.slug === reciterSlug && r.kind !== 'translation') || reciters.find((r) => r.isDefault) || reciters.find((r) => r.kind !== 'translation') || reciters[0];
  const activeTranslationReciter = reciters.find((r) => r.slug === translationReciterSlug);

  const reset = () => {
    setMushafType('uthmani'); setFontSize('md'); setMushafLines(15);
    setShowTajweedRules(false); setCopyVerseAsGlyphs(false);
    setTranslationFontSize('md'); setWordByWordFontSize('md'); setWordByWordDisplay('tooltip');
    setWordByWordShowTranslation(true); setWordByWordShowTransliteration(false); setWordByWordLocale('ur'); setWordClickPlayAudio(true); setWordClickSpeakMeaning(true);
    setShowTranslation(true); setShowWordByWord(false);
    setTranslationSlugs(['en-sahih-international']);
  };

  const selectedTranslationNames = translationSlugs.map((slug) => translators.find((item) => item.slug === slug)?.name || slug.replaceAll('-', ' '));
  const selectedTranslationSummary = selectedTranslationNames.length > 1
    ? `${selectedTranslationNames[0]}, and ${selectedTranslationNames.length - 1} other${selectedTranslationNames.length > 2 ? 's' : ''}`
    : selectedTranslationNames[0] || 'Choose a translation';

  const selectTab = (value: SettingsTab) => {
    setTab(value);
    // Opening Word By Word is an explicit request to use the feature. Quran
    // text and word metadata are already loaded, so apply it immediately.
    if (value === 'word') setShowWordByWord(true);
    if (value === 'translation') setShowTranslation(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-none flex-col bg-white p-0 text-slate-800 [&>button]:hidden sm:w-[460px] sm:max-w-[460px]">
        <SheetTitle className="sr-only">Reader settings</SheetTitle>
        <div className="grid grid-cols-3 border-b border-slate-200" role="tablist" aria-label="Reader settings sections">
          {([
            ['arabic', 'Arabic'], ['translation', 'Translation'], ['word', 'Word By Word'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} data-state={tab === value ? 'active' : 'inactive'} onPointerUp={(event) => { event.preventDefault(); selectTab(value); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectTab(value); } }} className={cn('touch-manipulation select-none border-b-2 px-2 py-6 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px]', tab === value ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-slate-500 hover:text-slate-800')}>
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {tab === 'arabic' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Preview:</p>
                <div className="my-3 h-px bg-slate-200" />
                <div className="py-4 text-center">
                  <span className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white">the Most Gracious</span>
                  <p className="mt-4 font-arabic text-4xl leading-loose" dir="rtl">
                    {mushafType === 'simple' && copyVerseAsGlyphs && <span className="ml-2 text-3xl text-emerald-700">۝</span>}
                    بِسْمِ ٱللَّهِ <span className={cn(showTajweedRules || mushafType !== 'simple' ? 'text-[var(--accent)]' : 'text-slate-900')}>ٱلرَّحْمَـٰنِ</span> ٱلرَّحِيمِ
                  </p>
                  <p className="mt-3 text-left text-xl leading-8 text-slate-800">In the Name of Allah—the Most Compassionate, Most Merciful.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 rounded-full bg-slate-100 p-1.5">
                {SCRIPTS.map((script) => (
                  <button
                    key={script.value}
                    type="button"
                    onClick={() => {
                      setMushafType(script.value);
                      if (script.value === 'simple') setShowTajweedRules(true);
                    }}
                    className={cn('rounded-full px-2 py-2.5 text-base transition', mushafType === script.value ? 'bg-white font-medium text-slate-900 shadow' : 'text-slate-500')}
                  >
                    {script.label}
                  </button>
                ))}
              </div>

              <CheckSetting
                label="Show Tajweed colours while reading:"
                checked={showTajweedRules}
                onChange={setShowTajweedRules}
              />
              <p className="text-sm text-slate-500">
                Uses verified Quran.com Uthmani tajweed annotations. Canonical Arabic text is never rewritten.
              </p>

              {mushafType === 'simple' ? (
                <div className="space-y-5">
                  <CheckSetting label="Copy verse as glyphs" checked={copyVerseAsGlyphs} onChange={setCopyVerseAsGlyphs} />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Lines</span>
                  <label className="relative">
                    <select value={mushafLines} onChange={(e) => setMushafLines(Number(e.target.value))} className="appearance-none rounded-lg bg-slate-100 py-3 pl-5 pr-12 text-lg outline-none">
                      {[10, 12, 15, 16].map((n) => <option key={n} value={n}>{n} Lines</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Font size</span>
                <div className="flex items-center gap-8">
                  <button type="button" disabled={fontIndex === 0} onClick={() => setFontSize(FONT_SIZES[Math.max(0, fontIndex - 1)])} className="p-2 disabled:opacity-30"><Minus /></button>
                  <span className="w-5 text-center text-xl">{fontIndex + 2}</span>
                  <button type="button" disabled={fontIndex === FONT_SIZES.length - 1} onClick={() => setFontSize(FONT_SIZES[Math.min(FONT_SIZES.length - 1, fontIndex + 1)])} className="p-2 disabled:opacity-30"><Plus /></button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setRecitersOpen(true)}
                  className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-5 py-5 text-left ring-1 ring-transparent transition hover:bg-slate-100 focus-visible:ring-[var(--accent)]"
                >
                  <span>
                    <span className="block text-sm text-slate-500">Selected Reciter</span>
                    <span className="mt-1 block text-lg font-bold">
                      {activeReciter?.name || 'Choose a reciter'}
                      {activeReciter?.style ? ` · ${activeReciter.style}` : ''}
                    </span>
                  </span>
                  <ChevronRight className="text-slate-500" />
                </button>
                <ReciterSheet
                  open={recitersOpen}
                  onOpenChange={setRecitersOpen}
                  selectedSlug={activeReciter?.slug}
                  onSelect={(slug) => {
                    setReciterSlug(slug);
                    void rebuildActivePlayback({ arabicSlug: slug, keepPlaying: true });
                  }}
                  selectedTranslationSlug={translationReciterSlug}
                  onSelectTranslation={(slug) => {
                    setTranslationReciterSlug(slug);
                    void rebuildActivePlayback({ translationSlug: slug, keepPlaying: true });
                  }}
                />
              </div>
            </div>
          )}

          {tab === 'translation' && (
            <div className="space-y-7">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Preview:</p>
                <div className="my-3 h-px bg-slate-200" />
                <div className="py-4 text-center">
                  <span className="inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white">the Most Gracious</span>
                  <p className="mt-4 font-arabic text-4xl leading-loose" dir="rtl">بِسْمِ ٱللَّهِ <span className="text-[var(--accent)]">ٱلرَّحْمَـٰنِ</span> ٱلرَّحِيمِ</p>
                  <p className={cn('mt-3 text-left leading-relaxed text-slate-800', { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl', xl: 'text-3xl' }[translationFontSize])}>In the Name of Allah—the Most Compassionate, Most Merciful.</p>
                </div>
              </div>

              <button type="button" onClick={() => setTranslationPickerOpen(true)} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-5 py-5 text-left transition hover:bg-slate-100">
                <span className="min-w-0 pr-4"><span className="block text-base text-slate-500">Selected Translations</span><span className="mt-1 block truncate text-lg font-bold capitalize">{selectedTranslationSummary}</span></span>
                <ChevronRight className="h-7 w-7 shrink-0 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setRecitersOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-5 py-5 text-left transition hover:bg-slate-100"
              >
                <span className="min-w-0 pr-4">
                  <span className="block text-base text-slate-500">Voice translation</span>
                  <span className="mt-1 block truncate text-lg font-bold">
                    {activeTranslationReciter
                      ? `${activeTranslationReciter.languageName || 'Translation'} · ${activeTranslationReciter.name}`
                      : 'Off — tap to play after each verse'}
                  </span>
                </span>
                <ChevronRight className="h-7 w-7 shrink-0 text-slate-500" />
              </button>

              <SizeSetting label="Font size" value={translationFontSize} onChange={setTranslationFontSize} />
              {!showTranslation && <button type="button" onClick={() => setShowTranslation(true)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-medium text-[var(--accent)]">Show translations while reading</button>}
            </div>
          )}
          {tab === 'word' && (
            <div className="space-y-6">
              <TogglePanel title="Word By Word" description="Tap a word for Arabic audio plus its meaning spoken in your language. Switch EN/UR/BN/ID/TR/FA/HI chips when those translations are imported." checked={showWordByWord} onChange={setShowWordByWord} />
              <div><p className="mb-3 text-lg font-medium">Display</p><Segmented options={[['tooltip', 'Tooltip'], ['inline', 'Inline']]} value={wordByWordDisplay} onChange={(v) => setWordByWordDisplay(v as 'tooltip' | 'inline')} /></div>
              <div className="space-y-4"><p className="text-lg font-medium">Type</p><CheckSetting label="Translation" checked={wordByWordShowTranslation} onChange={setWordByWordShowTranslation} /><CheckSetting label="Transliteration" checked={wordByWordShowTransliteration} onChange={setWordByWordShowTransliteration} /></div>
              <label className="flex items-center justify-between"><span className="text-lg font-medium">Word By Word Language</span><select value={wordByWordLocale} onChange={(e) => setWordByWordLocale(e.target.value as typeof wordByWordLocale)} className="rounded-lg bg-slate-100 px-4 py-3">{WORD_BY_WORD_LOCALES.map((locale) => <option key={locale.code} value={locale.code}>{locale.label}</option>)}</select></label>
              <SizeSetting label="Word font size" value={wordByWordFontSize} onChange={setWordByWordFontSize} />
              <CheckSetting label="Play Arabic word audio when clicked" checked={wordClickPlayAudio} onChange={setWordClickPlayAudio} />
              <CheckSetting label="Speak word meaning in selected language" checked={wordClickSpeakMeaning} onChange={setWordClickSpeakMeaning} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-7 py-5">
          <button type="button" onClick={reset} className="text-lg font-semibold text-slate-500">Reset</button>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-xl bg-slate-950 px-6 py-3 text-lg font-bold text-white">Done</button>
        </div>
        <TranslationSheet open={translationPickerOpen} onOpenChange={setTranslationPickerOpen} />
      </SheetContent>
    </Sheet>
  );
}

function TogglePanel({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="rounded-2xl bg-slate-50 p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div><button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('relative h-7 w-12 rounded-full transition', checked ? 'bg-[var(--accent)]' : 'bg-slate-300')}><span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition', checked ? 'left-6' : 'left-1')} /></button></div></div>;
}

function CheckSetting({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-lg font-medium">{label}</span>
      <button type="button" role="checkbox" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--accent)] transition', checked ? 'bg-[var(--accent)] text-white' : 'bg-slate-100 text-transparent')}>
        <Check className="h-5 w-5" />
      </button>
    </div>
  );
}

function SizeSetting({ label, value, onChange }: { label: string; value: FontSize; onChange: (value: FontSize) => void }) {
  const index = FONT_SIZES.indexOf(value);
  return <div className="flex items-center justify-between"><span className="text-lg font-medium">{label}</span><div className="flex items-center gap-8"><button type="button" disabled={index === 0} onClick={() => onChange(FONT_SIZES[Math.max(0, index - 1)])} className="p-2 disabled:opacity-30"><Minus /></button><span className="w-5 text-center text-xl">{index + 2}</span><button type="button" disabled={index === FONT_SIZES.length - 1} onClick={() => onChange(FONT_SIZES[Math.min(FONT_SIZES.length - 1, index + 1)])} className="p-2 disabled:opacity-30"><Plus /></button></div></div>;
}

function Segmented({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (value: string) => void }) {
  return <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1.5">{options.map(([key, label]) => <button key={key} type="button" onClick={() => onChange(key)} className={cn('rounded-full px-3 py-2.5 transition', value === key ? 'bg-white font-medium shadow' : 'text-slate-500')}>{label}</button>)}</div>;
}
