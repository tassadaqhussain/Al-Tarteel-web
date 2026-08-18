'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  BookMarked,
  BookOpen,
  Check,
  ClipboardCopy,
  Code2,
  GraduationCap,
  Languages,
  MessageCircle,
  MessageSquarePlus,
  Pin,
  Repeat2,
  Search,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type VerseMoreAction =
  | 'tafsir'
  | 'lessons'
  | 'reflections'
  | 'hadith'
  | 'related'
  | 'pin'
  | 'advanced-copy'
  | 'word-by-word'
  | 'repeat'
  | 'translations'
  | 'feedback'
  | 'embed'
  | 'settings';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: VerseMoreAction) => void;
  wordByWordEnabled?: boolean;
  pinned?: boolean;
}

const ITEMS: {
  id: VerseMoreAction;
  label: string;
  icon: ReactNode;
}[] = [
  { id: 'tafsir', label: 'Tafsir', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'lessons', label: 'Lessons', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'reflections', label: 'Reflections', icon: <MessageCircle className="h-4 w-4" /> },
  { id: 'hadith', label: 'Hadith', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'related', label: 'Related content', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'pin', label: 'Pin & compare', icon: <Pin className="h-4 w-4" /> },
  { id: 'advanced-copy', label: 'Advanced Copy', icon: <ClipboardCopy className="h-4 w-4" /> },
  { id: 'word-by-word', label: 'Word By Word', icon: <Search className="h-4 w-4" /> },
  { id: 'repeat', label: 'Repeat Verse', icon: <Repeat2 className="h-4 w-4" /> },
  { id: 'translations', label: 'Translations', icon: <Languages className="h-4 w-4" /> },
  { id: 'feedback', label: 'Translation Feedback', icon: <MessageSquarePlus className="h-4 w-4" /> },
  { id: 'embed', label: 'Embed Widget', icon: <Code2 className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export function VerseMoreMenu({
  open,
  onOpenChange,
  onAction,
  wordByWordEnabled = false,
  pinned = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Verse options"
      className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl"
    >
      {ITEMS.map((item) => {
        const active =
          (item.id === 'word-by-word' && wordByWordEnabled) ||
          (item.id === 'pin' && pinned) ||
          (item.id === 'embed' && copiedEmbed);

        return (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => {
              if (item.id === 'embed') {
                setCopiedEmbed(true);
                window.setTimeout(() => setCopiedEmbed(false), 1500);
              }
              onAction(item.id);
              if (item.id !== 'embed') onOpenChange(false);
            }}
            className={cn(
              'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50',
              active && 'text-[var(--accent)]'
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center text-slate-500">
              {item.id === 'embed' && copiedEmbed ? <Check className="h-4 w-4 text-emerald-500" /> : item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {(item.id === 'word-by-word' && wordByWordEnabled) || (item.id === 'pin' && pinned) ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
