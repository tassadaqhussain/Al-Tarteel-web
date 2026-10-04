'use client';

import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/messages';

/** Fill `{name}` placeholders in a translated message. */
export function format(message: string, vars?: Record<string, string | number>): string {
  if (!vars) return message;
  return message.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Translated UI text for server components; renders in the visitor's UI locale. */
export function Msg({ k, vars }: { k: MessageKey; vars?: Record<string, string | number> }) {
  const { t } = useT();
  return <>{format(t(k), vars)}</>;
}
