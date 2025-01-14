import { useCallback, useEffect } from "react";

import { Renderer } from "@/renderers/Renderer";

import { useRef } from "react";
import { midiTracksAtom } from "@/atoms/midiTracksAtom";
import {
  currentTimeAtom,
  isPlayingAtom,
  mutedAtom,
  seekAtom,
  togglePlayAtom,
  volumeAtom,
} from "@/atoms/playerAtom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { durationAtom } from "@/atoms/durationAtom";

export const useMidiVisualizer = (renderer: Renderer | undefined) => {
  const [currentTime, updateCurrentTime] = useAtom(currentTimeAtom);
  const togglePlay = useSetAtom(togglePlayAtom);
  const seek = useSetAtom(seekAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const midiTracks = useAtomValue(midiTracksAtom);
  const duration = useAtomValue(durationAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [muted, setMuted] = useAtom(mutedAtom);
  const animationFrameRef = useRef<number>(0);

  const animate = useCallback(() => {
    if (!renderer || !midiTracks) return;
    renderer.render(midiTracks.tracks, {
      currentTime: currentTime(),
      duration,
    });
    updateCurrentTime();

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [currentTime, duration, midiTracks, renderer, updateCurrentTime]);

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
  }, [animate, isPlaying]);

  const render = useCallback(() => {
    if (!renderer || isPlaying) return;
    renderer.render(midiTracks?.tracks || [], {
      currentTime: currentTime(),
      duration,
    });
  }, [currentTime, duration, isPlaying, midiTracks?.tracks, renderer]);

  useEffect(() => {
    if (isPlaying) return;
    render();
  }, [isPlaying, render]);

  return {
    duration,
    isPlaying,
    togglePlay,
    render,
    setVolume,
    setMuted,
    volume,
    muted,
    seek,
    currentTime,
  };
};
