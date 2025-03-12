import { createContext } from "react";

export const appContextValue = (() => {
  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  return {
    audioContext,
    gainNode,
  };
})();

export const AppContext = createContext(appContextValue);
