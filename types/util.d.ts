import type { Download } from "playwright";

export declare module "@vitest/browser/context" {
  interface BrowserCommands {
    waitForDownload: () => Promise<Download>;
  }
}
