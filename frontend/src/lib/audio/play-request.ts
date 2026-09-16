/** Ignore superseded play promises: changing src or pausing aborts pending play(). */
export function createPlayRequest() {
  let generation = 0;
  return {
    cancel() { generation += 1; },
    play(audio: Pick<HTMLMediaElement, 'play'>, onFailure: (error: unknown) => void) {
      const request = ++generation;
      void audio.play().catch((error: unknown) => {
        if (request !== generation) return;
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return;
        onFailure(error);
      });
    },
  };
}
