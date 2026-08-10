'use client';

import { useVoiceSearchContext } from '@/providers/VoiceSearchProvider';

/**
 * Public hook to access global voice search state & commands from any component.
 */
export function useVoiceSearch() {
  return useVoiceSearchContext();
}
