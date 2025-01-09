import { useCallback, useEffect, useMemo } from "react";

import { Renderer } from "@/renderers/Renderer";
import { useState } from "react";

import { useRef } from "react";
import { MidiState } from "@/types/midi";
import { AudioHandler } from "@/lib/AudioHandler";

export const useMidiVisualizer = (
  renderer: Renderer | undefined,
  audioHandler: AudioHandler | undefined,
  midiState: MidiState | undefined,
) => {
  const [isPlaying, setIsPlayingInternal] = useState(false);
  const duration = useMemo(
    () => audioHandler?.getDuration || 0,
    [audioHandler],
  );
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const [currentTime, setCurrentTimeInternal] = useState(0);
  useEffect(() => {
    if (!renderer || !audioHandler || !midiState || isPlaying) return;
    renderer.render(midiState.tracks, {
      duration: audioHandler.getDuration,
      currentTime,
    });
  }, [audioHandler, currentTime, midiState, renderer, isPlaying]);

  const animate = useCallback(
    (timestamp: number) => {
      if (!renderer || !audioHandler || !midiState) return;

      lastFrameTimeRef.current = timestamp;

      setCurrentTimeInternal(audioHandler.getCurrentTime);
      renderer.render(midiState.tracks, {
        currentTime,
        duration: audioHandler.getDuration,
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [audioHandler, currentTime, midiState, renderer],
  );

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animationFrameRef.current);
    } else {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, audioHandler, isPlaying]);

  const setIsPlaying = useCallback(
    (nextPlayingState: boolean) => {
      if (nextPlayingState) {
        audioHandler?.play();
      } else {
        audioHandler?.pause();
      }
      setIsPlayingInternal(nextPlayingState);
    },
    [audioHandler],
  );

  const setCurrentTime = useCallback(
    (nextCurrentTime: number) => {
      audioHandler?.seek(nextCurrentTime, isPlaying);
      setCurrentTimeInternal(nextCurrentTime);
      if (!renderer || !audioHandler || !midiState) return;
      renderer.render(midiState.tracks, {
        currentTime: nextCurrentTime,
        duration: audioHandler.getDuration,
      });
    },
    [audioHandler, isPlaying, renderer, midiState],
  );

  const render = useCallback(() => {
    if (!renderer || !audioHandler || !midiState) return;
    renderer.render(midiState.tracks, {
      currentTime,
      duration: audioHandler.getDuration,
    });
  }, [audioHandler, currentTime, midiState, renderer]);

  return {
    currentTime,
    duration,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    render,
  };
};
