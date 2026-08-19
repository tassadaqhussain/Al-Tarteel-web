'use client';

import { useCallback, useState } from 'react';
import { Check, Code2, ImageIcon, Link2, Video, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getSurahHref, getSurahPath } from '@/lib/surah-meta';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  textUthmani: string;
  translation?: string;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ShareVerseModal({
  open,
  onOpenChange,
  surahNumber,
  surahName,
  ayahNumber,
  textUthmani,
  translation,
}: Props) {
  const [copied, setCopied] = useState<'link' | 'embed' | 'image' | null>(null);

  const path = getSurahHref(surahNumber, { ayahNumber });
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verseUrl = origin ? `${origin}${path}` : path;

  const shareText = [
    textUthmani,
    translation,
    `— ${surahName} ${surahNumber}:${ayahNumber}`,
    verseUrl,
  ].filter(Boolean).join('\n\n');

  const embedCode = `<iframe src="${origin}${getSurahPath(surahNumber)}?embed=1#ayah-${surahNumber}-${ayahNumber}" title="${surahName} ${surahNumber}:${ayahNumber}" width="100%" height="360" frameborder="0" loading="lazy"></iframe>`;

  const flash = (key: 'link' | 'embed' | 'image') => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(verseUrl).catch(() => null);
    flash('link');
  }, [verseUrl]);

  const copyEmbed = useCallback(async () => {
    await navigator.clipboard.writeText(embedCode).catch(() => null);
    flash('embed');
  }, [embedCode]);

  const openShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=640,height=640');
  };

  const downloadImage = useCallback(async () => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f766e');
    gradient.addColorStop(1, '#134e4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.12, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '600 36px Georgia, serif';
    ctx.fillText('Al-Tarteel', width / 2, 120);

    ctx.font = '48px "Amiri", "Traditional Arabic", serif';
    const arabicLines = wrapText(ctx, textUthmani, width - 160);
    let y = height / 2 - ((arabicLines.length - 1) * 72) / 2 - (translation ? 80 : 0);
    for (const line of arabicLines) {
      ctx.fillText(line, width / 2, y);
      y += 72;
    }

    if (translation) {
      ctx.font = '28px Georgia, serif';
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      const enLines = wrapText(ctx, translation, width - 180);
      y += 48;
      for (const line of enLines.slice(0, 6)) {
        ctx.fillText(line, width / 2, y);
        y += 40;
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '500 26px Georgia, serif';
    ctx.fillText(`${surahName} ${surahNumber}:${ayahNumber}`, width / 2, height - 120);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;

    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      flash('image');
    } catch {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${surahName}-${surahNumber}-${ayahNumber}.png`;
      a.click();
      URL.revokeObjectURL(url);
      flash('image');
    }
  }, [ayahNumber, surahName, surahNumber, textUthmani, translation]);

  const actions = [
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <FacebookIcon className="h-5 w-5" />,
      onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verseUrl)}`),
    },
    {
      id: 'x',
      label: 'X',
      icon: <XIcon className="h-5 w-5" />,
      onClick: () => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon className="h-5 w-5" />,
      onClick: () => openShare(`https://wa.me/?text=${encodeURIComponent(shareText)}`),
    },
    {
      id: 'link',
      label: copied === 'link' ? 'Copied' : 'Copy Link',
      icon: copied === 'link' ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />,
      onClick: () => void copyLink(),
    },
    {
      id: 'embed',
      label: copied === 'embed' ? 'Copied' : 'Copy Embed',
      icon: copied === 'embed' ? <Check className="h-5 w-5" /> : <Code2 className="h-5 w-5" />,
      onClick: () => void copyEmbed(),
    },
    {
      id: 'video',
      label: 'Generate Video/Image',
      icon: <Video className="h-5 w-5" />,
      onClick: () => void downloadImage(),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-0 bg-surface p-0 shadow-2xl sm:rounded-2xl">
        <div className="relative px-6 pb-8 pt-7 sm:px-8">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-ink-faint transition-colors hover:bg-surface-3 hover:text-ink-2"
            aria-label="Close share dialog"
          >
            <X className="h-5 w-5" />
          </button>

          <DialogTitle className="pr-10 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Share the Quran!
          </DialogTitle>
          <DialogDescription className="mt-4 max-w-md text-base leading-relaxed text-ink-3">
            The Prophet ﷺ said: &ldquo;Convey from me, even if it is one verse.&rdquo; (Bukhari 3461)
          </DialogDescription>

          <div className="mt-8 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-6">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-surface transition-transform group-hover:scale-105 group-hover:bg-ink-2">
                  {action.icon}
                </span>
                <span className="text-xs font-medium leading-tight text-ink-2">{action.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center">
            <button
              type="button"
              onClick={() => void downloadImage()}
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105',
                'bg-[var(--accent)]'
              )}
              aria-label="Copy or download verse image"
            >
              {copied === 'image' ? <Check className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
            </button>
            <p className="mt-3 text-sm font-semibold text-ink">
              {copied === 'image' ? 'Image ready' : 'Copy/Download Image'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}
