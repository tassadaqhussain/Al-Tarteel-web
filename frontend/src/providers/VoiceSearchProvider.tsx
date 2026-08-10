'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceSpeechRecognizer, type VoiceLanguage } from '@/lib/voice/speechRecognition';
import { parseVoiceIntent, type VoiceIntent } from '@/lib/voice/parseVoiceIntent';
import { executeVoiceCommand } from '@/lib/voice/executeVoiceCommand';

export interface LowConfidenceData {
  transcript: string;
  intent: VoiceIntent;
}

export interface VoiceSearchContextType {
  isListening: boolean;
  isProcessing: boolean;
  isOverlayOpen: boolean;
  transcript: string;
  language: VoiceLanguage;
  intent: VoiceIntent | null;
  feedbackMessage: string | null;
  lowConfidenceData: LowConfidenceData | null;
  errorMessage: string | null;
  startListening: (lang?: VoiceLanguage) => void;
  stopListening: () => void;
  cancelListening: () => void;
  closeOverlay: () => void;
  setLanguage: (lang: VoiceLanguage) => void;
  processRawQuery: (query: string) => void;
  executeLowConfidenceAction: (action: 'search' | 'retry' | 'cancel') => void;
}

const VoiceSearchContext = createContext<VoiceSearchContextType | null>(null);

export function VoiceSearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const recognizerRef = useRef<VoiceSpeechRecognizer | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguageState] = useState<VoiceLanguage>('en-US');
  const [intent, setIntent] = useState<VoiceIntent | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [lowConfidenceData, setLowConfidenceData] = useState<LowConfidenceData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    recognizerRef.current = new VoiceSpeechRecognizer();
    return () => {
      recognizerRef.current?.stop();
    };
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
    setIntent(null);
    setLowConfidenceData(null);
    setErrorMessage(null);
    setFeedbackMessage(null);
    recognizerRef.current?.stop();
  }, []);

  const handleParsedIntent = useCallback(
    (spokenText: string) => {
      setIsProcessing(true);
      const parsed = parseVoiceIntent(spokenText);
      setIntent(parsed);

      // Low confidence guardrail check
      if (parsed.confidence < 0.6 || parsed.type === 'UNKNOWN') {
        setIsProcessing(false);
        setLowConfidenceData({ transcript: spokenText, intent: parsed });
        return;
      }

      // High confidence intent execution
      setTimeout(() => {
        executeVoiceCommand({
          intent: parsed,
          router,
          onFeedback: (msg) => setFeedbackMessage(msg),
        });
        setIsProcessing(false);
        setTimeout(() => closeOverlay(), 1200);
      }, 400);
    },
    [router, closeOverlay]
  );

  const startListening = useCallback(
    (lang?: VoiceLanguage) => {
      const activeLang = lang || language;
      setLanguageState(activeLang);
      setTranscript('');
      setIntent(null);
      setLowConfidenceData(null);
      setErrorMessage(null);
      setFeedbackMessage(null);
      setIsOverlayOpen(true);

      if (!VoiceSpeechRecognizer.isSupported()) {
        setErrorMessage('Voice recognition is not supported in this browser.');
        return;
      }

      const started = recognizerRef.current?.start({
        lang: activeLang,
        continuous: false,
        interimResults: true,
        onStart: () => {
          setIsListening(true);
        },
        onResult: (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            setIsListening(false);
            handleParsedIntent(text);
          }
        },
        onEnd: () => {
          setIsListening(false);
        },
        onError: (err) => {
          setIsListening(false);
          setErrorMessage(err || 'Could not capture speech');
        },
      });

      if (!started) {
        setIsListening(false);
        setErrorMessage('Could not initialize microphone.');
      }
    },
    [language, handleParsedIntent]
  );

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    setIsListening(false);
    if (transcript.trim()) {
      handleParsedIntent(transcript);
    }
  }, [transcript, handleParsedIntent]);

  const cancelListening = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  const setLanguage = useCallback((lang: VoiceLanguage) => {
    setLanguageState(lang);
  }, []);

  const processRawQuery = useCallback(
    (rawQuery: string) => {
      const q = rawQuery.trim();
      if (!q) return;
      setTranscript(q);
      setIsOverlayOpen(true);
      handleParsedIntent(q);
    },
    [handleParsedIntent]
  );

  const executeLowConfidenceAction = useCallback(
    (action: 'search' | 'retry' | 'cancel') => {
      if (action === 'cancel') {
        closeOverlay();
        return;
      }
      if (action === 'retry') {
        setLowConfidenceData(null);
        startListening();
        return;
      }
      if (action === 'search') {
        const text = lowConfidenceData?.transcript || transcript;
        closeOverlay();
        if (text) {
          router.push(`/search?q=${encodeURIComponent(text)}`);
        }
      }
    },
    [lowConfidenceData, transcript, closeOverlay, startListening, router]
  );

  return (
    <VoiceSearchContext.Provider
      value={{
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
      }}
    >
      {children}
    </VoiceSearchContext.Provider>
  );
}

export function useVoiceSearchContext() {
  const ctx = useContext(VoiceSearchContext);
  if (!ctx) {
    throw new Error('useVoiceSearchContext must be used within a VoiceSearchProvider');
  }
  return ctx;
}
