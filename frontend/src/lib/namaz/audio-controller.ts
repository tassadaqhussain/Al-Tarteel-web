'use client';

import { useSyncExternalStore } from 'react';
import { createPlayRequest } from '@/lib/audio/play-request';
import { pickVoice, warmSpeechVoices } from '@/lib/speakWordMeaning';
import { useAudioStore } from '@/stores/audioStore';

/**
 * One player for the Learn Namaz lesson: spoken guidance (device speech
 * synthesis in the learner's language) and recorded recitation audio play
 * through here, one track at a time. Arabic is never synthesised — only
 * recorded audio from the Quran library or reviewed recordings is played.
 */

export type LessonSegment =
  | { kind: 'speech'; text: string; lang: string }
  | { kind: 'audio'; url: string };

export type LessonAudioStatus = 'idle' | 'playing' | 'paused' | 'ended' | 'error';

export type LessonAudioState = {
  trackId: string | null;
  status: LessonAudioStatus;
  error: 'audio' | 'offline' | null;
  /** Non-fatal: guidance text could not be spoken on this device. */
  noVoice: boolean;
  segmentIndex: number;
};

const IDLE: LessonAudioState = { trackId: null, status: 'idle', error: null, noVoice: false, segmentIndex: 0 };

type PlayOptions = { slow?: boolean; onEnded?: () => void };

class LessonAudioController {
  private state: LessonAudioState = IDLE;
  private listeners = new Set<() => void>();
  private audio: HTMLAudioElement | null = null;
  private segments: LessonSegment[] = [];
  private slow = false;
  private onEnded: (() => void) | undefined;
  /** Bumped on every play/stop so late callbacks from old tracks are ignored. */
  private token = 0;
  private playRequest = createPlayRequest();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => this.state;

  private set(patch: Partial<LessonAudioState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  private element(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
    }
    return this.audio;
  }

  play(trackId: string, segments: LessonSegment[], opts: PlayOptions = {}) {
    this.halt();
    const token = ++this.token;
    this.segments = segments;
    this.slow = Boolean(opts.slow);
    this.onEnded = opts.onEnded;
    // Only one thing speaks at a time: quiet the Quran reader's player.
    if (useAudioStore.getState().isPlaying) useAudioStore.getState().setPlaying(false);
    this.set({ trackId, status: 'playing', error: null, noVoice: false, segmentIndex: 0 });
    if (segments.length === 0) {
      this.finish(token);
      return;
    }
    this.runSegment(token, 0);
  }

  private runSegment(token: number, index: number) {
    if (token !== this.token) return;
    const segment = this.segments[index];
    if (!segment) {
      this.finish(token);
      return;
    }
    this.set({ segmentIndex: index });
    const next = () => this.runSegment(token, index + 1);

    if (segment.kind === 'speech') {
      const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
      const voice = synth ? pickVoice(segment.lang) : null;
      if (!synth || !voice) {
        this.set({ noVoice: true });
        next();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = this.slow ? 0.72 : 0.95;
      utterance.onend = () => next();
      utterance.onerror = (event) => {
        if (token !== this.token) return;
        if (event.error === 'interrupted' || event.error === 'canceled') return;
        this.set({ noVoice: true });
        next();
      };
      synth.cancel();
      synth.speak(utterance);
      return;
    }

    const audio = this.element();
    audio.onended = () => {
      if (token === this.token) next();
    };
    audio.onerror = () => {
      if (token !== this.token) return;
      this.fail();
    };
    audio.src = segment.url;
    audio.playbackRate = this.slow ? 0.75 : 1;
    audio.defaultPlaybackRate = audio.playbackRate;
    this.playRequest.play(audio, () => {
      if (token === this.token) this.fail();
    });
  }

  private fail() {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    this.set({ status: 'error', error: offline ? 'offline' : 'audio' });
  }

  private finish(token: number) {
    if (token !== this.token) return;
    this.set({ status: 'ended' });
    const cb = this.onEnded;
    this.onEnded = undefined;
    cb?.();
  }

  pause() {
    if (this.state.status !== 'playing') return;
    const segment = this.segments[this.state.segmentIndex];
    if (segment?.kind === 'speech') window.speechSynthesis?.pause();
    else {
      this.playRequest.cancel();
      this.audio?.pause();
    }
    this.set({ status: 'paused' });
  }

  resume() {
    if (this.state.status !== 'paused') return;
    const token = this.token;
    const index = this.state.segmentIndex;
    const segment = this.segments[index];
    this.set({ status: 'playing' });
    if (segment?.kind === 'speech') {
      const synth = window.speechSynthesis;
      synth.resume();
      // Some mobile browsers drop paused utterances; restart the sentence.
      window.setTimeout(() => {
        if (token === this.token && this.state.status === 'playing' && !synth.speaking) {
          this.runSegment(token, index);
        }
      }, 250);
    } else if (this.audio) {
      this.playRequest.play(this.audio, () => {
        if (token === this.token) this.fail();
      });
    }
  }

  setSlow(slow: boolean) {
    this.slow = slow;
    if (this.audio) {
      this.audio.playbackRate = slow ? 0.75 : 1;
      this.audio.defaultPlaybackRate = this.audio.playbackRate;
    }
  }

  /** Silence output without notifying listeners (used before a new track). */
  private halt() {
    this.token++;
    this.playRequest.cancel();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.pause();
    }
  }

  stop() {
    this.halt();
    this.onEnded = undefined;
    this.set(IDLE);
  }
}

let controller: LessonAudioController | null = null;

export function lessonAudio(): LessonAudioController {
  if (!controller) {
    controller = new LessonAudioController();
    warmSpeechVoices();
  }
  return controller;
}

export function useLessonAudioState(): LessonAudioState {
  return useSyncExternalStore(
    (l) => lessonAudio().subscribe(l),
    () => lessonAudio().getState(),
    () => IDLE,
  );
}
