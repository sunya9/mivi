import type { Download } from "playwright";

export declare module "vitest/browser" {
  interface BrowserCommands {
    waitForDownload: () => Promise<Download>;
  }
}
