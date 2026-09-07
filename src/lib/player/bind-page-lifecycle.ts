import type { AudioContext } from "standardized-audio-context";

import { type AudioPlaybackStore, isEffectivelyPlaying } from "@/lib/player/audio-playback-store";

export function bindPageLifecycle(
  playback: AudioPlaybackStore,
  audioContext: AudioContext,
  target: Window = window,
): () => void {
  let wasRunning = false;
  let wasPlaying = false;
  const handlePageHide = () => {
    wasRunning = audioContext.state === "running";
    wasPlaying = isEffectivelyPlaying(playback.getSnapshot());
    playback.pause();
  };
  const handlePageShow = (event: PageTransitionEvent) => {
    if (!event.persisted) return;
    if (wasRunning && audioContext.state === "suspended") void audioContext.resume();
    if (wasPlaying) playback.play();
  };
  target.addEventListener("pagehide", handlePageHide);
  target.addEventListener("pageshow", handlePageShow);
  return () => {
    target.removeEventListener("pagehide", handlePageHide);
    target.removeEventListener("pageshow", handlePageShow);
  };
}
