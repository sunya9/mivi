import { AppContext } from "@/contexts/app-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

type PlayingState =
  | {
      type: "playing";
      audioSource: AudioBufferSourceNode;
    }
  | {
      type: "paused";
    }
  | {
      type: "seeking";
      wasPlaying: boolean;
    };

export function usePlayer(audioBuffer: AudioBuffer | undefined) {
  const { audioContext, gainNode } = use(AppContext);
  const [localStorageVolume, setLocalStorageVolume] =
    useLocalStorage<number>("mivi:volume");
  const [localStorageMuted, setLocalStorageMuted] =
    useLocalStorage<boolean>("mivi:muted");
  const volume = useMemo(() => localStorageVolume ?? 1, [localStorageVolume]);
  const muted = useMemo(() => localStorageMuted ?? false, [localStorageMuted]);
  const [startTime, setStartTime] = useState(0);
  const currentTimeRef = useRef(0);
  // Return 0 if audioBuffer is removed
  const getCurrentTime = useCallback(
    () => (audioBuffer ? currentTimeRef.current : 0),
    [audioBuffer],
  );
  const [playingState, setPlayingState] = useState<PlayingState>({
    type: "paused",
  });
  // Derived state: not playing if audioBuffer is removed
  const isPlaying =
    audioBuffer !== undefined && playingState.type === "playing";
  const duration = useMemo(() => audioBuffer?.duration || 0, [audioBuffer]);
  const [currentTimeSecInternal, setCurrentTimeSec] = useState(0);
  // Derived state: reset to 0 if audioBuffer is removed
  const currentTimeSec = audioBuffer ? currentTimeSecInternal : 0;

  // Stop audio and reset currentTimeRef when audio is removed
  useEffect(() => {
    if (!audioBuffer) {
      if (playingState.type === "playing") {
        playingState.audioSource.stop();
      }
      currentTimeRef.current = 0;
    }
  }, [audioBuffer, playingState]);

  const pause = useCallback(() => {
    if (playingState.type === "playing") {
      playingState.audioSource.stop();
      setPlayingState({ type: "paused" });
    }
  }, [playingState]);
  const pauseIfNeeded = useCallback(
    (currentTime: number) => {
      if (currentTime > duration) {
        pause();
      }
    },
    [duration, pause],
  );
  const updateCurrentTime = useCallback(
    (sec?: number) => {
      const currentTime = isPlaying
        ? audioContext.currentTime - startTime
        : sec;
      if (currentTime === undefined) return;
      setCurrentTimeSec(currentTime);
      pauseIfNeeded(currentTime);
      currentTimeRef.current = currentTime;
    },
    [audioContext, isPlaying, pauseIfNeeded, startTime],
  );

  const updateGainNode = useCallback(
    ({ muted, volume }: { muted: boolean; volume: number }) => {
      const now = audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      const calculatedVolume = muted ? 0 : Math.max(0, Math.min(1, volume));
      gainNode.gain.setTargetAtTime(calculatedVolume, now, 0);
    },
    [audioContext.currentTime, gainNode.gain],
  );
  const setVolume = useCallback(
    (volume: number) => {
      setLocalStorageVolume(volume);
      updateGainNode({ volume, muted });
    },
    [muted, setLocalStorageVolume, updateGainNode],
  );
  const play = useCallback(() => {
    if (audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      updateGainNode({ muted, volume });
      source.connect(gainNode);
      source.start(0, currentTimeRef.current);
      setPlayingState({ type: "playing", audioSource: source });
    }
    setStartTime(audioContext.currentTime - currentTimeRef.current);
  }, [audioBuffer, audioContext, updateGainNode, muted, volume, gainNode]);

  const seek = useCallback(
    (time: number, commit: boolean) => {
      if (playingState.type === "playing") {
        playingState.audioSource.stop();
        playingState.audioSource.disconnect();
        setPlayingState({ type: "seeking", wasPlaying: true });
      } else if (playingState.type === "paused") {
        setPlayingState({ type: "seeking", wasPlaying: false });
      }
      const adjustedSeekTime = time < 1 ? 0 : time;
      updateCurrentTime(adjustedSeekTime);
      if (!commit) return;
      if (playingState.type === "seeking" && playingState.wasPlaying) {
        play();
      }
    },
    [playingState, play, updateCurrentTime],
  );
  // workaround for slider
  const makeSureToCommit = useCallback(() => {
    if (playingState.type === "seeking" && playingState.wasPlaying) {
      play();
    }
  }, [playingState, play]);
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);
  const toggleMute = useCallback(() => {
    const newMuted = !muted;
    setLocalStorageMuted(newMuted);
    updateGainNode({ muted: newMuted, volume });
  }, [muted, setLocalStorageMuted, updateGainNode, volume]);
  return {
    volume,
    setVolume,
    muted,
    seek,
    togglePlay,
    isPlaying,
    getCurrentTime,
    updateCurrentTime,
    currentTimeSec,
    toggleMute,
    makeSureToCommit,
  };
}
