interface BrowserApiStatus {
  name: string;
  supported: boolean;
}

export function checkBrowserApis(): BrowserApiStatus[] {
  return [
    { name: "VideoEncoder", supported: "VideoEncoder" in window },
    { name: "AudioEncoder", supported: "AudioEncoder" in window },
    { name: "OffscreenCanvas", supported: "OffscreenCanvas" in window },
  ];
}
