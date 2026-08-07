'use client';

import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { parseTajweedHtml } from '@/lib/tajweed/parse';
import { getTajweedRule, type TajweedRule, type TajweedRuleId } from '@/lib/tajweed/rules';
import { TajweedRulePopover } from './TajweedRulePopover';

type Props = {
  textTajweed: string;
  textUthmani: string;
  className?: string;
  interactive?: boolean;
  showColors?: boolean;
};

/**
 * Renders verified Quran.com tajweed HTML as React nodes.
 * Canonical Arabic characters are never altered — only presentation wraps are added.
 */
export function TajweedText({
  textTajweed,
  textUthmani,
  className,
  interactive = true,
  showColors = true,
}: Props) {
  const tokens = useMemo(() => parseTajweedHtml(textTajweed), [textTajweed]);
  const [active, setActive] = useState<{ rule: TajweedRule; sample: string } | null>(null);

  if (!tokens.length) {
    return (
      <span className={className} lang="ar" dir="rtl" translate="no">
        {textUthmani}
      </span>
    );
  }

  const openRule = (ruleId: TajweedRuleId, sample: string) => {
    if (!interactive || !showColors) return;
    const rule = getTajweedRule(ruleId);
    if (rule) setActive({ rule, sample });
  };

  const onKey = (e: KeyboardEvent<HTMLSpanElement>, ruleId: TajweedRuleId, sample: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openRule(ruleId, sample);
    }
  };

  const nodes: ReactNode[] = tokens.map((token, index) => {
    if (token.type === 'text') {
      return <span key={index}>{token.value}</span>;
    }
    const rule = getTajweedRule(token.ruleId);
    const label = rule ? `${rule.name} (${rule.nameArabic})` : 'Tajweed rule';
    const clickable = interactive && showColors;

    return (
      <span
        key={index}
        data-tajweed={token.ruleId}
        className={cn('tajweed-mark', token.ruleId, clickable && 'tajweed-interactive')}
        title={label}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={clickable ? `Tajweed rule: ${label}` : undefined}
        onClick={
          clickable
            ? (e) => {
                e.stopPropagation();
                openRule(token.ruleId, token.value);
              }
            : undefined
        }
        onKeyDown={clickable ? (e) => onKey(e, token.ruleId, token.value) : undefined}
      >
        {token.value}
      </span>
    );
  });

  return (
    <>
      <span
        className={cn('tajweed-text', !showColors && 'tajweed-disabled', className)}
        lang="ar"
        dir="rtl"
        translate="no"
      >
        {nodes}
      </span>
      <TajweedRulePopover
        open={!!active}
        onOpenChange={(o) => {
          if (!o) setActive(null);
        }}
        rule={active?.rule ?? null}
        sample={active?.sample}
      />
    </>
  );
}
