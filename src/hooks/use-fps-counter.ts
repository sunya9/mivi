import { useCallback, useRef, useState } from "react";

/**
 * Tracks actual rendered frames per second.
 * Call `tick()` on each rendered frame; the returned `fps` updates ~once per second.
 */
export function useFpsCounter(): { fps: number; tick: () => void; reset: () => void } {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  const tick = useCallback(() => {
    const now = performance.now();
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = now;
    }
    frameCountRef.current++;
    const elapsed = now - lastTimeRef.current;
    if (elapsed >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / elapsed));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  }, []);

  const reset = useCallback(() => {
    frameCountRef.current = 0;
    lastTimeRef.current = 0;
    setFps(0);
  }, []);

  return { fps, tick, reset };
}
