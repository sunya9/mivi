import path from "path";
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "vite.config.ts",
  {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    test: {
      browser: {
        enabled: true,
        provider: "playwright",
        // https://vitest.dev/guide/browser/playwright
        instances: [{ browser: "chromium" }],
        headless: process.env.CI === "true",
      },
      include: ["**/*.browser.?(c|m)[jt]s?(x)"],
    },
  },
]);
