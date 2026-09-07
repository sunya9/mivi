import { vi } from "vitest";

import { type AudioPlaybackStore, type PlaybackSnapshot } from "@/lib/player/audio-playback-store";

const defaultSnapshot: PlaybackSnapshot = {
  status: "initial",
  playFeedbackAt: 0,
  position: 0,
  duration: 10,
  volume: 1,
  muted: false,
};

export function createMockStore(options?: { snapshot?: Partial<PlaybackSnapshot> }) {
  const snapshot: PlaybackSnapshot = { ...defaultSnapshot, ...options?.snapshot };
  return {
    subscribe: vi.fn<AudioPlaybackStore["subscribe"]>(() => () => {}),
    getSnapshot: vi.fn<AudioPlaybackStore["getSnapshot"]>(() => snapshot),
    seek: vi.fn<AudioPlaybackStore["seek"]>(),
    beginScrub: vi.fn<AudioPlaybackStore["beginScrub"]>(),
    scrub: vi.fn<AudioPlaybackStore["scrub"]>(),
    endScrub: vi.fn<AudioPlaybackStore["endScrub"]>(),
    togglePlay: vi.fn<AudioPlaybackStore["togglePlay"]>(),
    play: vi.fn<AudioPlaybackStore["play"]>(),
    pause: vi.fn<AudioPlaybackStore["pause"]>(),
    setVolume: vi.fn<AudioPlaybackStore["setVolume"]>(),
    toggleMute: vi.fn<AudioPlaybackStore["toggleMute"]>(),
    syncFromAudioContext: vi.fn<AudioPlaybackStore["syncFromAudioContext"]>(),
    setAudioBuffer: vi.fn<AudioPlaybackStore["setAudioBuffer"]>(),
    getFrequencyData: vi.fn<AudioPlaybackStore["getFrequencyData"]>(() => null),
    configureAnalyser: vi.fn<AudioPlaybackStore["configureAnalyser"]>(),
  } satisfies AudioPlaybackStore;
}
