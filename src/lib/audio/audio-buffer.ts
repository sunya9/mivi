import type { AudioBuffer, AudioContext } from "standardized-audio-context";

import type { SerializedAudio } from "@/lib/audio/audio";
import { int16ToFloat } from "@/lib/audio/pcm";

export function toAudioBuffer(audio: SerializedAudio, audioContext: AudioContext): AudioBuffer {
  const buffer = audioContext.createBuffer(audio.numberOfChannels, audio.length, audio.sampleRate);
  for (let i = 0; i < audio.numberOfChannels; i++) {
    buffer.copyToChannel(int16ToFloat(audio.channels[i]), i);
  }
  return buffer;
}
