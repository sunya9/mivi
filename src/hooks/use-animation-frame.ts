import { useEffect, useEffectEvent, useRef } from "react";

export function useAnimationFrame(isPlaying: boolean, onAnimate: () => void, fps?: number) {
  const animationFrameRef = useRef<number | null>(null);
  const onAnimateEffect = useEffectEvent(onAnimate);
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const frameInterval = fps ? 1000 / fps : 0;
    let nextFireTime = 0;

    const loop = (timestamp: number) => {
      if (frameInterval > 0 && nextFireTime > 0 && timestamp + 1 < nextFireTime) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      // Advance by exact interval to preserve fractional accumulation
      nextFireTime = (nextFireTime || timestamp) + frameInterval;
      onAnimateEffect();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        onAnimateEffect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, fps]);
}
