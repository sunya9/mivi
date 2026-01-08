export interface BrowserApiStatus {
  name: string;
  supported: boolean;
}

export function checkBrowserApis(): BrowserApiStatus[] {
  return [
    { name: "Web Audio API", supported: "AudioContext" in window },
    { name: "IndexedDB", supported: "indexedDB" in window },
    { name: "Web Workers", supported: "Worker" in window },
    { name: "VideoEncoder", supported: "VideoEncoder" in window },
    { name: "AudioEncoder", supported: "AudioEncoder" in window },
    { name: "OffscreenCanvas", supported: "OffscreenCanvas" in window },
  ];
}
