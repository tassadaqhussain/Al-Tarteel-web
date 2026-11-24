#!/usr/bin/env node
/**
 * Checks 5 surahs per prefixed locale (/ur, /ps, /fa) on a running build:
 *  - HTTP 200
 *  - <html lang="{locale}" dir="rtl">
 *  - Localized <title> and <meta name="description">
 *  - No English H1/H2/H3 headings (except proper nouns like QuranPilot)
 *  - No duplicate H2 headings on the same page
 *
 * Usage:
 *   node scripts/check-localized-surahs.mjs [baseUrl]
 */

const baseUrl = (process.argv[2] || 'http://127.0.0.1:3099').replace(/\/$/, '');
const LOCALES = ['ur', 'ps', 'fa'];
const SAMPLE_SLUGS = ['al-fatihah', 'al-kahf', 'ya-sin', 'al-mulk', 'al-ikhlas'];
const ALLOWED_PROPER_NOUN_RE = /\bQuranPilot\b/g;
const ENGLISH_WORD_RE = /\b[A-Za-z]{3,}\b/g;

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const out = [];
  for (const m of html.matchAll(re)) {
    const text = stripTags(m[1]);
    if (text) out.push(text);
  }
  return out;
}

async function main() {
  const errors = [];

  for (const locale of LOCALES) {
    console.log(`\nChecking locale /${locale} across ${SAMPLE_SLUGS.length} surahs:`);
    for (const slug of SAMPLE_SLUGS) {
      const url = `${baseUrl}/${locale}/${slug}`;
      const res = await fetch(url);
      if (res.status !== 200) {
        errors.push(`${url}: HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      const lang = (html.match(/<html[^>]+lang="([^"]+)"/i) || [])[1];
      const dir = (html.match(/<html[^>]+dir="([^"]+)"/i) || [])[1];
      const title = stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
      const desc = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) || [])[1] || '';

      if (lang !== locale || dir !== 'rtl') {
        errors.push(`${url}: expected lang="${locale}" dir="rtl", got lang="${lang}" dir="${dir}"`);
      }
      const titleEn = title.replace(ALLOWED_PROPER_NOUN_RE, '').match(ENGLISH_WORD_RE);
      if (titleEn) {
        errors.push(`${url}: English words in <title>: ${titleEn.join(', ')} ("${title}")`);
      }
      const descEn = desc.replace(ALLOWED_PROPER_NOUN_RE, '').match(ENGLISH_WORD_RE);
      if (descEn) {
        errors.push(`${url}: English words in meta description: ${descEn.join(', ')}`);
      }

      const h1s = extractHeadings(html, 'h1');
      const h2s = extractHeadings(html, 'h2');
      const h3s = extractHeadings(html, 'h3');

      for (const [level, list] of [['H1', h1s], ['H2', h2s], ['H3', h3s]]) {
        for (const text of list) {
          const eng = text.replace(ALLOWED_PROPER_NOUN_RE, '').match(ENGLISH_WORD_RE);
          if (eng) {
            errors.push(`${url}: English words in ${level} "${text}": ${eng.join(', ')}`);
          }
        }
      }

      const seenH2 = new Set();
      for (const h2 of h2s) {
        if (seenH2.has(h2)) {
          errors.push(`${url}: Duplicate H2 "${h2}"`);
        }
        seenH2.add(h2);
      }

      console.log(
        `  /${locale}/${slug}: HTTP 200 | lang=${lang} dir=${dir} | H1=${h1s.length} H2=${h2s.length} H3=${h3s.length} | H2s=[${h2s.join(' ; ')}]`,
      );
    }
  }

  if (errors.length > 0) {
    console.error(`\nFAILED with ${errors.length} error(s):`);
    for (const e of errors) console.error(`  ERROR: ${e}`);
    process.exit(1);
  }
  console.log('\nALL LOCALIZED SURAH HEADING & METADATA CHECKS PASSED.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
