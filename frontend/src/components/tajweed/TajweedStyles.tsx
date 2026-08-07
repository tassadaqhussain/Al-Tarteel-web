'use client';

import { TAJWEED_RULE_LIST } from '@/lib/tajweed/rules';

/** Injects centralized tajweed colours once (light + dark). */
export function TajweedStyles() {
  const css = TAJWEED_RULE_LIST.map((rule) => {
    return [
      `.tajweed-text .tajweed-mark.${rule.id},.tajweed-text tajweed.${rule.id}{color:${rule.color}}`,
      `.dark .tajweed-text .tajweed-mark.${rule.id},.dark .tajweed-text tajweed.${rule.id}{color:${rule.colorDark}}`,
      `.tajweed-text .tajweed-mark.${rule.id}.tajweed-interactive{cursor:pointer;border-radius:0.15em}`,
      `.tajweed-text .tajweed-mark.${rule.id}.tajweed-interactive:hover,.tajweed-text .tajweed-mark.${rule.id}.tajweed-interactive:focus-visible{outline:2px solid currentColor;outline-offset:2px}`,
    ].join('');
  }).join('');

  const base = `
.tajweed-text.tajweed-disabled .tajweed-mark,
.tajweed-text.tajweed-disabled tajweed{color:inherit !important}
.tajweed-text .tajweed-mark,.tajweed-text tajweed{font:inherit}
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: `${base}${css}` }} />;
}
