import type { Download } from "playwright";

declare module "vitest/browser" {
  interface BrowserCommands {
    waitForDownload: () => Promise<Download>;
  }
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    preventDefault: () => void;
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
    platforms: string[];
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

export {};
