import { useEffect, useRef } from "react";

export function useAnimationFrame(onAnimate: FrameRequestCallback) {
  const animationFrameRef = useRef<number>(0);
  const onAnimateRef = useRef(onAnimate);

  useEffect(() => {
    onAnimateRef.current = onAnimate;
  }, [onAnimate]);

  useEffect(() => {
    const animate: FrameRequestCallback = (timestamp) => {
      onAnimateRef.current(timestamp);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
}
