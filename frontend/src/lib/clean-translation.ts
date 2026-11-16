/**
 * Remove embedded HTML footnote markers (e.g. `<sup foot_note="...">1</sup>`)
 * and stray footnote digits glued to words/punctuation in imported translations,
 * while preserving verse numbers and standalone numbers in the text.
 */
export function cleanTranslationText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/([.,;!?"'”’\)\]\p{L}])(\d{1,2})(?=\s|$|[.,;!?"'”’\)\]])/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
