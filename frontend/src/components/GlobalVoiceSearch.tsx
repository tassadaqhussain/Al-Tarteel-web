'use client';

import React, { useState } from 'react';
import { Mic, MicOff, X, Search, Sparkles, RefreshCw, Volume2, Globe } from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { type VoiceLanguage } from '@/lib/voice/speechRecognition';
import { cn } from '@/lib/utils';

const EXAMPLE_SUGGESTIONS = [
  'Surah Yaseen',
  'Surah Baqarah ayah 255',
  'Ayatul Kursi',
  'Verses about parents',
  'Open bookmarks',
  'Show Urdu translation',
  'Play audio',
];

export function GlobalVoiceSearch() {
  const {
    isListening,
    isProcessing,
    isOverlayOpen,
    transcript,
    language,
    intent,
    feedbackMessage,
    lowConfidenceData,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    closeOverlay,
    setLanguage,
    processRawQuery,
    executeLowConfidenceAction,
  } = useVoiceSearch();

  const [inputVal, setInputVal] = useState('');

  if (!isOverlayOpen) return null;

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      processRawQuery(inputVal);
      setInputVal('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={cancelListening}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="font-serif text-lg font-bold text-slate-100 sm:text-xl">
              Voice Search &amp; Commands
            </h3>
          </div>

          <button
            type="button"
            onClick={closeOverlay}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Language selector chips */}
        <div className="mt-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Language:</span>
          {[
            { code: 'en-US' as VoiceLanguage, label: 'English' },
            { code: 'ur-PK' as VoiceLanguage, label: 'Urdu / اردو' },
            { code: 'ar-SA' as VoiceLanguage, label: 'Arabic / العربية' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLanguage(item.code);
                if (isListening) startListening(item.code);
              }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition',
                language === item.code
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Listening & Transcript visual display */}
        <div className="my-8 flex flex-col items-center text-center">
          {/* Animated Microphone Icon */}
          <div className="relative mb-6">
            <button
              type="button"
              onClick={() => (isListening ? stopListening() : startListening())}
              className={cn(
                'relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300',
                isListening
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 scale-105 ring-8 ring-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700'
              )}
            >
              {isListening ? (
                <Mic className="h-10 w-10 animate-pulse text-white" />
              ) : (
                <MicOff className="h-10 w-10 text-slate-400" />
              )}
            </button>
            {isListening && (
              <span className="absolute -inset-3 -z-10 animate-ping rounded-full bg-emerald-500/20" />
            )}
          </div>

          {/* Status Label */}
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {isListening
              ? 'Listening… Speak now'
              : isProcessing
              ? 'Processing intent…'
              : 'Tap microphone to speak'}
          </p>

          {/* Live Speech Transcript */}
          <div className="mt-4 min-h-[60px] w-full px-4">
            {transcript ? (
              <p className="font-sans text-xl font-semibold leading-snug text-slate-100 sm:text-2xl">
                “{transcript}”
              </p>
            ) : (
              <p className="text-sm italic text-slate-500">
                Try saying: “Surah Yaseen”, “Ayatul Kursi”, or “Open Bookmarks”…
              </p>
            )}
          </div>

          {/* Feedback or Error Toast */}
          {feedbackMessage && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-300">
              <Volume2 className="h-4 w-4" />
              {feedbackMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-2 text-sm text-red-300">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Low Confidence Disambiguation View */}
        {lowConfidenceData && (
          <div className="my-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
            <p className="text-sm font-semibold text-amber-300">
              I heard: <span className="font-bold text-white">“{lowConfidenceData.transcript}”</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Please choose an action below or retry speaking.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => executeLowConfidenceAction('search')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                <Search className="h-3.5 w-3.5" />
                Search Quran
              </button>
              <button
                type="button"
                onClick={() => executeLowConfidenceAction('retry')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Voice
              </button>
              <button
                type="button"
                onClick={() => executeLowConfidenceAction('cancel')}
                className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Typed Input Fallback */}
        <form onSubmit={handleTextSubmit} className="relative mt-4">
          <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 focus-within:border-emerald-500">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Or type a query/command…"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder-slate-500 outline-none"
            />
            {inputVal && (
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Run
              </button>
            )}
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-6 border-t border-slate-800 pt-4">
          <p className="mb-2.5 text-left text-xs font-semibold text-slate-400">
            Try saying or typing:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SUGGESTIONS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => processRawQuery(ex)}
                className="rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-950/30 hover:text-emerald-300"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
