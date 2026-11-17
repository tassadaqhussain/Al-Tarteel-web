'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, Loader2, Send, X } from 'lucide-react';
import {
  quranApi,
  type HadithItem,
  type LessonPost,
  type OfficialTafsir,
  type OfficialTafsirResource,
  type RelatedQuestion,
} from '@/lib/api';
import { useStudyStore, type StudyTab } from '@/stores/studyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAskAiStore } from '@/stores/askAiStore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const TABS: { id: StudyTab; label: string }[] = [
  { id: 'tafsir', label: 'Tafsir' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'hadith', label: 'Hadith' },
  { id: 'related', label: 'Related' },
];

const DEFAULT_TAFSIR_RESOURCE_ID = 169; // Ibn Kathir (English)

function sanitizeTafsirHtml(text: string) {
  if (typeof window === 'undefined') return text;
  const doc = new DOMParser().parseFromString(text, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, link, style').forEach((node) => node.remove());
  doc.body.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        node.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}

const cleanHadithHtml = (html: string) =>
  html
    .replace(/\[quran[^\]]*\]\{([^}]*)\}/gi, '$1')
    .replace(/<(?!\/?(?:p|br|strong|em)\b)[^>]*>/gi, '');

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out')), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function StudyBody({ showCloseButton }: { showCloseButton: boolean }) {
  const activeVerse = useStudyStore((s) => s.activeVerse);
  const studyTab = useStudyStore((s) => s.studyTab);
  const setStudyTab = useStudyStore((s) => s.setStudyTab);
  const closeStudy = useStudyStore((s) => s.closeStudy);

  const tafsirSlug = useSettingsStore((s) => s.tafsirSlug);
  const setTafsirSlug = useSettingsStore((s) => s.setTafsirSlug);
  const openWithPrompt = useAskAiStore((s) => s.openWithPrompt);

  const [resources, setResources] = useState<OfficialTafsirResource[]>([]);
  const [resourceId, setResourceId] = useState<number>(DEFAULT_TAFSIR_RESOURCE_ID);
  const [tafsir, setTafsir] = useState<OfficialTafsir | null>(null);
  const [lessons, setLessons] = useState<LessonPost[]>([]);
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [questions, setQuestions] = useState<RelatedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    let cancelled = false;
    quranApi
      .officialTafsirResources()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : [];
        setResources(list);
        if (tafsirSlug) {
          const preferred = list.find(
            (item) => item.slug === tafsirSlug || `qf-${item.id}` === tafsirSlug,
          );
          if (preferred) setResourceId(preferred.id);
        }
      })
      .catch(() => {
        if (!cancelled) setResources([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tafsirSlug]);

  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => {
      const aEn = (a.language_name || '').toLowerCase() === 'english' ? 0 : 1;
      const bEn = (b.language_name || '').toLowerCase() === 'english' ? 0 : 1;
      if (aEn !== bEn) return aEn - bEn;
      return a.name.localeCompare(b.name);
    });
  }, [resources]);

  useEffect(() => {
    if (!activeVerse) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (studyTab === 'tafsir') {
      withTimeout(
        quranApi.officialTafsir(activeVerse.surahNumber, activeVerse.ayahNumber, resourceId),
      )
        .then((data) => {
          if (!cancelled) setTafsir(data ?? null);
        })
        .catch(() => {
          if (!cancelled) {
            setTafsir(null);
            setError('Could not load tafsir for this verse. Please try again.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (studyTab === 'lessons') {
      withTimeout(
        quranApi.lessons(activeVerse.surahNumber, activeVerse.ayahNumber, {
          languageId: 2,
          limit: 10,
        }),
      )
        .then((res) => {
          if (!cancelled) setLessons(Array.isArray(res?.data) ? res.data : []);
        })
        .catch(() => {
          if (!cancelled) {
            setLessons([]);
            setError('Could not load lessons for this verse.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (studyTab === 'hadith') {
      withTimeout(
        quranApi.hadiths(activeVerse.surahNumber, activeVerse.ayahNumber, {
          language: 'en',
          limit: 10,
        }),
      )
        .then((res) => {
          if (!cancelled) setHadiths(Array.isArray(res?.hadiths) ? res.hadiths : []);
        })
        .catch(() => {
          if (!cancelled) {
            setHadiths([]);
            setError('No hadith linked to this verse.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      withTimeout(
        quranApi.relatedContent(activeVerse.surahNumber, activeVerse.ayahNumber, {
          language: 'en',
          limit: 10,
        }),
      )
        .then((res) => {
          if (!cancelled) setQuestions(Array.isArray(res?.questions) ? res.questions : []);
        })
        .catch(() => {
          if (!cancelled) {
            setQuestions([]);
            setError('Could not load related content for this verse.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [activeVerse, studyTab, resourceId]);

  if (!activeVerse) return null;

  const tafsirHtml = tafsir?.text ? sanitizeTafsirHtml(tafsir.text) : '';

  const handleAsk = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    const prefix = `Regarding ${activeVerse.surahName} ${activeVerse.surahNumber}:${activeVerse.ayahNumber}: `;
    openWithPrompt(
      q ? `${prefix}${q}` : `Explain ${activeVerse.surahName} ${activeVerse.surahNumber}:${activeVerse.ayahNumber}`,
      { autoAsk: Boolean(q) },
    );
    setQuestion('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">
              Verse {activeVerse.surahNumber}:{activeVerse.ayahNumber}
            </p>
            <p className="text-xs text-ink-muted">{activeVerse.surahName}</p>
          </div>
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={closeStudy}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close study panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setStudyTab(t.id)}
            className={cn(
              'min-h-9 rounded-lg px-2 py-1.5 text-xs font-semibold transition',
              studyTab === t.id
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        {studyTab === 'tafsir' && sortedResources.length > 0 && (
          <div className="mb-3">
            <label htmlFor="study-tafsir-source" className="sr-only">
              Tafsir source
            </label>
            <select
              id="study-tafsir-source"
              value={resourceId}
              onChange={(e) => {
                const nextId = Number(e.target.value);
                setResourceId(nextId);
                const found = sortedResources.find((r) => r.id === nextId);
                if (found) setTafsirSlug(found.slug || `qf-${found.id}`);
              }}
              className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs font-semibold text-ink focus:border-[var(--accent)] focus:outline-none"
            >
              {sortedResources.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.name} ({src.language_name})
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-xs text-ink-muted">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[var(--accent)]" />
            Loading…
          </div>
        ) : error ? (
          <p className="py-8 text-center text-xs text-ink-muted">{error}</p>
        ) : studyTab === 'tafsir' ? (
          tafsirHtml ? (
            <div
              className="tafsir-content text-sm leading-relaxed text-ink-2"
              dangerouslySetInnerHTML={{ __html: tafsirHtml }}
            />
          ) : (
            <p className="py-8 text-center text-xs text-ink-muted">
              No tafsir available for this verse and source.
            </p>
          )
        ) : studyTab === 'lessons' ? (
          lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((l) => (
                <article
                  key={l.id}
                  className="rounded-xl border border-line bg-surface-2 p-3.5 text-sm leading-relaxed text-ink-2"
                >
                  <p className="mb-1.5 text-xs font-semibold text-ink">
                    {[l.author?.firstName, l.author?.lastName].filter(Boolean).join(' ') ||
                      l.author?.username ||
                      'Contributor'}
                  </p>
                  <p className="whitespace-pre-wrap">{l.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-ink-muted">
              No lessons linked to this verse.
            </p>
          )
        ) : studyTab === 'hadith' ? (
          hadiths.length > 0 ? (
            <div className="space-y-3">
              {hadiths.map((h, i) => {
                const txt = h.hadith.find((x) => x.lang === 'en') ?? h.hadith[0];
                if (!txt) return null;
                return (
                  <article
                    key={`${h.hadithNumber}-${i}`}
                    className="rounded-xl border border-line bg-surface-2 p-3.5 text-sm leading-relaxed text-ink-2"
                  >
                    <p className="mb-1.5 text-xs font-semibold text-[var(--accent)]">
                      {h.name} · #{h.hadithNumber}
                    </p>
                    <div dangerouslySetInnerHTML={{ __html: cleanHadithHtml(txt.body) }} />
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-ink-muted">
              No hadith linked to this verse.
            </p>
          )
        ) : questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-line bg-surface-2 p-3.5 text-sm text-ink-2"
              >
                <p className="font-semibold text-ink">{q.body}</p>
                {q.summary && <p className="mt-1 text-xs text-ink-muted">{q.summary}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-ink-muted">
            No related questions for this verse.
          </p>
        )}
      </div>

      <form onSubmit={handleAsk} className="mt-4 border-t border-line pt-3">
        <label htmlFor="study-ask-ai" className="sr-only">
          Ask about this verse
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-1.5 focus-within:border-[var(--accent)]">
          <input
            id="study-ask-ai"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this verse…"
            className="min-w-0 flex-1 bg-transparent text-xs text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] transition hover:opacity-90"
            aria-label="Ask AI about this verse"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export function StudyPanel() {
  const studyOpen = useStudyStore((s) => s.studyOpen);
  const activeVerse = useStudyStore((s) => s.activeVerse);
  const closeStudy = useStudyStore((s) => s.closeStudy);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (!studyOpen || !activeVerse) return null;

  if (isDesktop) {
    return (
      <aside
        aria-label="Verse study panel"
        className="sticky top-24 flex max-h-[calc(100vh-7.5rem)] w-[360px] shrink-0 flex-col self-start overflow-hidden rounded-2xl border border-line bg-surface p-5"
      >
        <StudyBody showCloseButton={true} />
      </aside>
    );
  }

  return (
    <Sheet open={studyOpen} onOpenChange={(open) => !open && closeStudy()}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-5"
      >
        <SheetTitle className="sr-only">
          Study Verse {activeVerse.surahNumber}:{activeVerse.ayahNumber}
        </SheetTitle>
        <StudyBody showCloseButton={false} />
      </SheetContent>
    </Sheet>
  );
}
