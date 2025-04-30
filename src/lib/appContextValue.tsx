const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

export const appContextValue = {
  audioContext,
  gainNode,
};
