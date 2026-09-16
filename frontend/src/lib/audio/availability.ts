/** Audited 2026-09-16. Do not substitute another voice for unavailable recordings. */
export function unavailableReciterReason(slug: string): string | null {
  if (slug === 'warsh-abdul-basit') return 'Unavailable: this recording uses different ayah numbering.';
  if (slug === 'mustafa-ismail') return 'Unavailable: this verse-by-verse collection is incomplete.';
  if (slug === 'ps-shafeeq-ur-rahman') return 'Unavailable: the Pashto recordings have not been uploaded.';
  return null;
}
