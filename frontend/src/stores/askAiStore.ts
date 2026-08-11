import { create } from 'zustand';

type AskAiState = {
  open: boolean;
  /** Prefill / auto-ask text consumed once when the sheet opens. */
  pendingPrompt: string | null;
  autoAsk: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  setOpen: (open: boolean) => void;
  /** Open Ask AI with spoken/typed text; optionally auto-submit. */
  openWithPrompt: (prompt: string, opts?: { autoAsk?: boolean }) => void;
  /** Read-and-clear pending prompt for the sheet. */
  consumePendingPrompt: () => { prompt: string; autoAsk: boolean } | null;
};

export const useAskAiStore = create<AskAiState>((set, get) => ({
  open: false,
  pendingPrompt: null,
  autoAsk: false,
  openSheet: () => set({ open: true }),
  closeSheet: () => set({ open: false, pendingPrompt: null, autoAsk: false }),
  setOpen: (open) => set(open ? { open: true } : { open: false, pendingPrompt: null, autoAsk: false }),
  openWithPrompt: (prompt, opts) => {
    const text = prompt.trim();
    if (!text) {
      set({ open: true });
      return;
    }
    set({
      open: true,
      pendingPrompt: text,
      autoAsk: opts?.autoAsk !== false,
    });
  },
  consumePendingPrompt: () => {
    const { pendingPrompt, autoAsk } = get();
    if (!pendingPrompt) return null;
    set({ pendingPrompt: null, autoAsk: false });
    return { prompt: pendingPrompt, autoAsk };
  },
}));
