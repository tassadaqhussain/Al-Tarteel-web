/**
 * Session-scoped in-memory audio cache for continuous Quran playback.
 *
 * - Stores fetched MP3 blobs as object URLs (RAM only).
 * - Cleared on surah end/change/stop, pagehide, and full refresh.
 * - NEVER writes to IndexedDB, Cache Storage, localStorage, or a SW.
 */

export type TemporaryAudioKeyParts = {
  reciterSlug: string;
  surahNumber: number;
  ayahNumber: number;
  audioType?: 'arabic';
};

type CacheEntry = {
  key: string;
  reciterSlug: string;
  surahNumber: number;
  ayahNumber: number;
  objectUrl: string;
  sourceUrl: string;
};

type Inflight = {
  promise: Promise<string | null>;
  controller: AbortController;
  surahNumber: number;
  ayahNumber: number;
};

export const AUDIO_KEEP_BEHIND = 1;
export const AUDIO_KEEP_AHEAD = 2;

export function makeAudioCacheKey(parts: TemporaryAudioKeyParts): string {
  const type = parts.audioType ?? 'arabic';
  return `${parts.reciterSlug}:${parts.surahNumber}:${parts.ayahNumber}:${type}`;
}

class TemporaryAudioCacheImpl {
  private entries = new Map<string, CacheEntry>();
  private inflight = new Map<string, Inflight>();
  private httpPrimers = new Map<string, HTMLAudioElement>();

  /** Best-effort browser HTTP cache warm when blob fetch is blocked (CORS). */
  private primeHttpCache(url: string): void {
    if (typeof Audio === 'undefined' || !url) return;
    if (this.httpPrimers.has(url)) return;
    try {
      const el = new Audio();
      el.preload = 'auto';
      el.src = url;
      this.httpPrimers.set(url, el);
    } catch {
      /* ignore */
    }
  }

  private releaseHttpPrimer(url: string): void {
    const el = this.httpPrimers.get(url);
    if (!el) return;
    el.removeAttribute('src');
    el.load();
    this.httpPrimers.delete(url);
  }

  has(key: string): boolean {
    return this.entries.has(key);
  }

  getObjectUrl(key: string): string | null {
    return this.entries.get(key)?.objectUrl ?? null;
  }

  /** Fetch and cache; returns object URL or null on failure/abort. Dedupes in-flight. */
  async preload(
    parts: TemporaryAudioKeyParts,
    url: string,
    externalSignal?: AbortSignal,
  ): Promise<string | null> {
    if (!url) return null;
    const key = makeAudioCacheKey(parts);
    const existing = this.entries.get(key);
    if (existing) return existing.objectUrl;

    const pending = this.inflight.get(key);
    if (pending) {
      if (externalSignal?.aborted) return null;
      return pending.promise;
    }

    const controller = new AbortController();
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', onExternalAbort, { once: true });

    const promise = (async (): Promise<string | null> => {
      try {
        const res = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          signal: controller.signal,
        });
        if (!res.ok) {
          this.primeHttpCache(url);
          return null;
        }
        const blob = await res.blob();
        if (controller.signal.aborted) return null;
        const raced = this.entries.get(key);
        if (raced) return raced.objectUrl;
        const objectUrl = URL.createObjectURL(blob);
        this.entries.set(key, {
          key,
          reciterSlug: parts.reciterSlug,
          surahNumber: parts.surahNumber,
          ayahNumber: parts.ayahNumber,
          objectUrl,
          sourceUrl: url,
        });
        return objectUrl;
      } catch {
        // CORS or network failure — still warm browser HTTP cache for online continuity.
        if (!controller.signal.aborted) this.primeHttpCache(url);
        return null;
      } finally {
        externalSignal?.removeEventListener('abort', onExternalAbort);
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, {
      promise,
      controller,
      surahNumber: parts.surahNumber,
      ayahNumber: parts.ayahNumber,
    });
    return promise;
  }

  release(key: string): void {
    const job = this.inflight.get(key);
    if (job) {
      job.controller.abort();
      this.inflight.delete(key);
    }
    const entry = this.entries.get(key);
    if (entry) {
      URL.revokeObjectURL(entry.objectUrl);
      this.releaseHttpPrimer(entry.sourceUrl);
      this.entries.delete(key);
    }
  }

  /**
   * Keep only a rolling window around the current ayah for one surah.
   * Entries for other surahs are left alone (caller should clearSurah when switching).
   */
  releaseOutsideWindow(
    surahNumber: number,
    ayahNumber: number,
    keepBehind = AUDIO_KEEP_BEHIND,
    keepAhead = AUDIO_KEEP_AHEAD,
  ): void {
    const min = ayahNumber - keepBehind;
    const max = ayahNumber + keepAhead;
    for (const [key, entry] of this.entries) {
      if (entry.surahNumber !== surahNumber) continue;
      if (entry.ayahNumber < min || entry.ayahNumber > max) {
        this.release(key);
      }
    }
    for (const [key, job] of this.inflight) {
      if (job.surahNumber !== surahNumber) continue;
      if (job.ayahNumber < min || job.ayahNumber > max) {
        job.controller.abort();
        this.inflight.delete(key);
      }
    }
  }

  clearSurah(surahNumber: number): void {
    for (const [key, entry] of [...this.entries]) {
      if (entry.surahNumber === surahNumber) this.release(key);
    }
    for (const [key, job] of [...this.inflight]) {
      if (job.surahNumber === surahNumber) {
        job.controller.abort();
        this.inflight.delete(key);
      }
    }
  }

  cancelPending(): void {
    for (const [, job] of this.inflight) {
      job.controller.abort();
    }
    this.inflight.clear();
  }

  clearSession(): void {
    this.cancelPending();
    for (const key of [...this.entries.keys()]) {
      this.release(key);
    }
    for (const url of [...this.httpPrimers.keys()]) {
      this.releaseHttpPrimer(url);
    }
  }

  size(): number {
    return this.entries.size;
  }
}

/** Module singleton — session RAM only; disappears on refresh/tab close. */
export const temporaryAudioCache = new TemporaryAudioCacheImpl();
