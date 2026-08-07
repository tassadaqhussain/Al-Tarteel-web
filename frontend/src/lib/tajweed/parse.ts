import { getTajweedRule, KNOWN_TAJWEED_CLASS_SET, type TajweedRuleId } from './rules';

export type TajweedToken =
  | { type: 'text'; value: string }
  | { type: 'rule'; ruleId: TajweedRuleId; value: string };

/**
 * Strip ALL markup from a tajweed HTML string, leaving plain Arabic text.
 * Used for integrity checks — output must match canonical `textUthmani`.
 */
export function stripTajweedMarkup(html: string): string {
  if (!html) return '';
  return html
    .replace(/<\/?tajweed\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Normalize for integrity comparison (Unicode NFC; unify odd spaces). */
export function normalizeQuranText(text: string): string {
  return text.normalize('NFC').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Returns true when stripping verified tajweed markup yields the canonical Uthmani text.
 */
export function tajweedPreservesCanonicalText(
  textUthmani: string,
  textTajweed: string | null | undefined,
): boolean {
  if (!textTajweed) return true;
  return (
    normalizeQuranText(stripTajweedMarkup(textTajweed)) ===
    normalizeQuranText(textUthmani)
  );
}

/**
 * Parse Quran.com-style tajweed HTML into tokens.
 * Only `<tajweed class="known_rule">…</tajweed>` annotations are recognised.
 * Any other tags are discarded (text content kept) — never executed as HTML.
 */
export function parseTajweedHtml(html: string): TajweedToken[] {
  if (!html) return [];
  const tokens: TajweedToken[] = [];
  // Match <tajweed ...>content</tajweed> (non-greedy, case-insensitive)
  const re = /<tajweed\b([^>]*)>([\s\S]*?)<\/tajweed>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    if (match.index > lastIndex) {
      pushText(tokens, decodeEntities(stripAllTags(html.slice(lastIndex, match.index))));
    }
    const attrs = match[1] ?? '';
    const inner = decodeEntities(stripAllTags(match[2] ?? ''));
    const classMatch = /\bclass\s*=\s*["']([^"']+)["']/i.exec(attrs);
    const classNames = (classMatch?.[1] ?? '')
      .split(/\s+/)
      .map((c) => c.trim())
      .filter(Boolean);
    const ruleId = classNames.find((c) => KNOWN_TAJWEED_CLASS_SET.has(c)) as
      | TajweedRuleId
      | undefined;

    if (ruleId && getTajweedRule(ruleId) && inner) {
      tokens.push({ type: 'rule', ruleId, value: inner });
    } else if (inner) {
      // Unknown / missing class — keep letters, do not invent a rule
      pushText(tokens, inner);
    }
    lastIndex = re.lastIndex;
  }

  if (lastIndex < html.length) {
    pushText(tokens, decodeEntities(stripAllTags(html.slice(lastIndex))));
  }

  return mergeAdjacentText(tokens);
}

function stripAllTags(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function pushText(tokens: TajweedToken[], value: string) {
  if (!value) return;
  tokens.push({ type: 'text', value });
}

function mergeAdjacentText(tokens: TajweedToken[]): TajweedToken[] {
  const out: TajweedToken[] = [];
  for (const t of tokens) {
    const prev = out[out.length - 1];
    if (t.type === 'text' && prev?.type === 'text') {
      prev.value += t.value;
    } else {
      out.push(t.type === 'text' ? { ...t } : t);
    }
  }
  return out;
}

/** Reconstruct plain text from tokens (must equal stripTajweedMarkup). */
export function tokensToPlainText(tokens: TajweedToken[]): string {
  return tokens.map((t) => t.value).join('');
}
