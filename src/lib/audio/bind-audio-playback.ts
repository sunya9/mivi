import type { AudioContext } from "standardized-audio-context";

import type { SerializedAudio } from "@/lib/audio/audio";
import { toAudioBuffer } from "@/lib/audio/audio-buffer";
import type { FileSlot } from "@/lib/file-store/file-slot";
import type { AudioPlaybackStore } from "@/lib/player/audio-playback-store";

export function bindAudioToPlayback(
  audioSlot: FileSlot<SerializedAudio>,
  playback: AudioPlaybackStore,
  audioContext: AudioContext,
): void {
  let lastDecoded: SerializedAudio | undefined;
  const apply = () => {
    const decoded = audioSlot.getSnapshot().decoded;
    if (decoded === lastDecoded) return;
    lastDecoded = decoded;
    playback.setAudioBuffer(decoded && toAudioBuffer(decoded, audioContext));
  };
  apply();
  audioSlot.subscribe(apply);
}
