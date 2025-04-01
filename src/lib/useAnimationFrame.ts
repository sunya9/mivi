import { useCallback, useRef } from "react";

import { useEffect } from "react";

export const useAnimationFrame = (onAnimate: FrameRequestCallback) => {
  const animationFrameRef = useRef<number>(0);

  const animate: FrameRequestCallback = useCallback(
    (timestamp) => {
      onAnimate(timestamp);
      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [onAnimate],
  );

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);
};
