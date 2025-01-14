import { atom } from "jotai";
import { fileDb, fileKeys } from "@/atoms/minidb";
import { atomWithStorage } from "jotai/utils";
import { durationAtom } from "@/atoms/durationAtom";

interface AudioInfo {
  readonly audioBuffer: AudioBuffer;
  readonly audio: File;
}

export interface SerializedAudio {
  readonly length: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
  readonly duration: number;
  readonly channels: Float32Array[];
}

// base states
const context = atom(() => {
  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  return {
    audioContext,
    gainNode,
  };
});
export const audioFileAtom = fileDb.item(fileKeys.audio);
const startTimeAtom = atom(0);
const currentTimeBaseAtom = atom(0);
const audioInfoBaseAtom = atom<AudioInfo>();
const audioSourceAtom = atom<AudioBufferSourceNode>();
const volumeAtomWithStorage = atomWithStorage("mivi:volume", 1);
const mutedAtomWithStorage = atomWithStorage("mivi:muted", false);

// getters
export const currentTimeAtom = atom(
  (get) => () => get(currentTimeBaseAtom),
  (get, set, value?: number) => {
    const pauseIfNeeded = async (currentTime: number) => {
      const duration = await get(durationAtom);
      if (currentTime > duration) {
        set(pauseAtom);
        return;
      }
    };
    if (get(isPlayingAtom)) {
      const currentTime =
        get(context).audioContext.currentTime - get(startTimeAtom);
      pauseIfNeeded(currentTime);
      set(currentTimeBaseAtom, currentTime);
    } else if (typeof value === "number") {
      set(currentTimeBaseAtom, value);
      pauseIfNeeded(value);
    }
  },
);
export const audioDurationAtom = atom(async (get) => {
  const audioInfo = await get(audioInfoAtom);
  return audioInfo?.audioBuffer.duration || 0;
});
export const serializeAtom = atom(async (get) => {
  const audioInfo = await get(audioInfoAtom);
  if (!audioInfo) return undefined;
  const audioBuffer = audioInfo.audioBuffer;
  return {
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    duration: audioBuffer.duration,
    channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) =>
      audioBuffer.getChannelData(i),
    ),
  } as const;
});

export const isPlayingAtom = atom((get) => !!get(audioSourceAtom));

// setters
const updateGainNodeAtom = atom(null, (get, _, volume: number) => {
  const audioContext = get(context);
  const now = audioContext.audioContext.currentTime;
  audioContext.gainNode.gain.cancelScheduledValues(now);
  audioContext.gainNode.gain.setTargetAtTime(volume, now, 0.01);
});

// getters and setters

const createAudioBufferFromFile = async (
  audioFile: File,
  audioContext: AudioContext,
) => {
  const arrayBuffer = await audioFile.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
};

export const audioInfoAtom = atom(
  (get) => {
    const audioFile = get(audioFileAtom);
    if (audioFile) {
      return createAudioBufferFromFile(
        audioFile,
        get(context).audioContext,
      ).then((audioBuffer) => ({
        audio: audioFile,
        audioBuffer,
      }));
    }
  },
  (get, set, audioFile?: File) => {
    if (audioFile) {
      createAudioBufferFromFile(audioFile, get(context).audioContext).then(
        (audioBuffer) => {
          set(audioInfoBaseAtom, {
            audio: audioFile,
            audioBuffer,
          });
        },
      );
    } else {
      set(audioInfoBaseAtom, undefined);
    }
    return set(audioFileAtom, audioFile);
  },
);

export const volumeAtom = atom(
  (get) => get(volumeAtomWithStorage),
  (get, set, value: number) => {
    const isMuted = get(mutedAtomWithStorage);
    if (!isMuted) {
      const volume = Math.max(0, Math.min(1, value));
      set(updateGainNodeAtom, volume);
    }
    set(volumeAtomWithStorage, value);
  },
);

export const mutedAtom = atom(
  (get) => get(mutedAtomWithStorage),
  (get, set, muted: boolean) => {
    set(mutedAtomWithStorage, muted);
    const volume = muted ? 0 : get(volumeAtom);
    set(updateGainNodeAtom, volume);
  },
);

export const pauseAtom = atom(null, (get, set) => {
  const audioSource = get(audioSourceAtom);
  set(currentTimeAtom);
  if (audioSource) {
    audioSource.stop();
    set(audioSourceAtom, undefined);
  }
});
export const playAtom = atom(null, async (get, set) => {
  const audioInfo = await get(audioInfoAtom);
  if (audioInfo) {
    const { audioContext, gainNode } = get(context);
    const source = audioContext.createBufferSource();
    source.buffer = audioInfo.audioBuffer;
    source.connect(gainNode);
    source.start(0, get(currentTimeAtom)());
    set(audioSourceAtom, source);
  }
  set(
    startTimeAtom,
    get(context).audioContext.currentTime - get(currentTimeAtom)(),
  );
});

export const seekAtom = atom(null, (get, set, time: number) => {
  const audioSource = get(audioSourceAtom);
  const wasPlaying = get(isPlayingAtom);
  if (audioSource) {
    audioSource.stop();
    audioSource.disconnect();
    set(audioSourceAtom, undefined);
  }
  set(currentTimeAtom, time);
  if (wasPlaying) {
    set(playAtom);
  }
});

export const togglePlayAtom = atom(null, (get, set) => {
  if (get(isPlayingAtom)) {
    set(pauseAtom);
  } else {
    set(playAtom);
  }
});
