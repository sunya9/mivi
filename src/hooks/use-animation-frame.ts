import { useEffect, useEffectEvent, useRef } from "react";

export function useAnimationFrame(
  isPlaying: boolean,
  onAnimate: FrameRequestCallback,
) {
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

    const loop: FrameRequestCallback = (time) => {
      onAnimateEffect(time);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);
}
