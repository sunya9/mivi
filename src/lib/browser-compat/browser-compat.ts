export interface BrowserApiStatus {
  name: string;
  supported: boolean;
}

function checkCanvas2dSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("2d") !== null;
  } catch {
    return false;
  }
}

export function checkBrowserApis(): BrowserApiStatus[] {
  return [
    { name: "Canvas 2D", supported: checkCanvas2dSupport() },
    { name: "Web Audio API", supported: "AudioContext" in window },
    { name: "IndexedDB", supported: "indexedDB" in window },
    { name: "Web Workers", supported: "Worker" in window },
    { name: "VideoEncoder", supported: "VideoEncoder" in window },
    { name: "AudioEncoder", supported: "AudioEncoder" in window },
    { name: "OffscreenCanvas", supported: "OffscreenCanvas" in window },
  ];
}
