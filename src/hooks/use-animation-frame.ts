import { useEffect, useEffectEvent, useRef } from "react";

export function useAnimationFrame(isPlaying: boolean, onAnimate: () => void) {
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

    const loop = () => {
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
  }, [isPlaying]);
}
