'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X, Search, MessageCircle, RefreshCw, Volume2, Globe } from 'lucide-react';
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

function getReadableVoiceError(message: string) {
  if (message === 'not-allowed' || message === 'permission-denied') {
    return 'Microphone access is blocked. You can continue with typed search.';
  }

  if (message === 'no-speech') {
    return 'No speech was detected. Please try again.';
  }

  return message;
}

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

  useEffect(() => {
    if (!isOverlayOpen) return;

    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [isOverlayOpen]);

  if (!isOverlayOpen) return null;

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      processRawQuery(inputVal);
      setInputVal('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overscroll-none p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={cancelListening}
      />

      {/* Modal Container */}
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overscroll-contain overflow-y-auto rounded border border-emerald-950/15 border-t-4 border-t-amber-500 bg-white p-4 text-slate-900 shadow-[0_28px_80px_-28px_rgba(2,44,38,0.55)] sm:p-6">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-emerald-950 text-white">
              <Mic className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Voice Search</h2>
              <p className="text-xs text-slate-500">Search the Quran by voice or text</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeOverlay}
            className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:border-emerald-800 hover:text-emerald-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Language selector chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-800" />
          <span className="mr-1 text-xs font-semibold text-slate-600">Language</span>
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
                'rounded border px-3 py-1.5 text-xs font-semibold transition',
                language === item.code
                  ? 'border-emerald-900 bg-emerald-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-700 hover:text-emerald-900'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Listening & Transcript visual display */}
        <div className="my-6 flex flex-col items-center text-center sm:my-7">
          {/* Animated Microphone Icon */}
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => (isListening ? stopListening() : startListening())}
              className={cn(
                'relative flex h-20 w-20 items-center justify-center rounded-full border text-white shadow-sm transition-all duration-300 sm:h-24 sm:w-24',
                isListening
                  ? 'scale-105 border-emerald-700 bg-emerald-800 ring-8 ring-emerald-700/15'
                  : 'border-emerald-900/15 bg-emerald-50 hover:border-emerald-700 hover:bg-emerald-100'
              )}
            >
              {isListening ? (
                <Mic className="h-10 w-10 animate-pulse text-white" />
              ) : (
                <MicOff className="h-9 w-9 text-emerald-900/70 sm:h-10 sm:w-10" />
              )}
            </button>
            {isListening && (
              <span className="absolute -inset-3 -z-10 animate-ping rounded-full bg-emerald-700/15" />
            )}
          </div>

          {/* Status Label */}
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
            {isListening
              ? 'Listening'
              : isProcessing
              ? 'Searching'
              : 'Ready'}
          </p>

          {/* Live Speech Transcript */}
          <div className="mt-3 min-h-12 w-full px-2 sm:px-4">
            {transcript ? (
              <p className="font-sans text-lg font-semibold leading-snug text-slate-950 sm:text-xl">
                “{transcript}”
              </p>
            ) : (
              <p className="text-sm text-slate-500">Surah, ayah, page, or topic</p>
            )}
          </div>

          {/* Feedback or Error Toast */}
          {feedbackMessage && (
            <div className="mt-4 inline-flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Volume2 className="h-4 w-4" />
              {feedbackMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {getReadableVoiceError(errorMessage)}
            </div>
          )}
        </div>

        {/* Low Confidence Disambiguation View */}
        {lowConfidenceData && (
          <div className="my-4 rounded border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-sm font-semibold text-amber-900">
              I heard: <span className="font-bold text-slate-950">“{lowConfidenceData.transcript}”</span>
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Please choose an action below or retry speaking.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => executeLowConfidenceAction('ask_ai')}
                className="inline-flex items-center gap-1.5 rounded bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Ask AI
              </button>
              <button
                type="button"
                onClick={() => executeLowConfidenceAction('search')}
                className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-700 hover:text-emerald-900"
              >
                <Search className="h-3.5 w-3.5" />
                Search Quran
              </button>
              <button
                type="button"
                onClick={() => executeLowConfidenceAction('retry')}
                className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-700 hover:text-emerald-900"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Voice
              </button>
              <button
                type="button"
                onClick={() => executeLowConfidenceAction('cancel')}
                className="rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-500 hover:text-slate-950"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Typed Input Fallback */}
        <form onSubmit={handleTextSubmit} className="relative mt-4">
          <div className="flex min-h-12 items-center rounded border border-slate-300 bg-white px-4 py-2.5 shadow-sm focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
            <Search className="h-4 w-4 shrink-0 text-emerald-800" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search Surah, ayah, page, or topic"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-950 placeholder-slate-400 outline-none"
            />
            {inputVal && (
              <button
                type="submit"
                className="rounded bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-900"
              >
                Run
              </button>
            )}
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="mb-2.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SUGGESTIONS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => processRawQuery(ex)}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
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
