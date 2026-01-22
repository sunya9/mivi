/// <reference types="vitest" />
import path from "path";
import { execFileSync } from "child_process";
import { defineConfig, PluginOption } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import Unfonts from "unplugin-fonts/vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import { BrowserCommand } from "vitest/node";
import { playwright } from "@vitest/browser-playwright";
import * as pkg from "./package.json";

const deps = Object.keys(pkg.dependencies);

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [
          "babel-plugin-react-compiler",
          "@babel/plugin-transform-explicit-resource-management",
        ],
      },
    }),
    Unfonts({
      google: {
        families: [
          {
            name: "Geist",
            styles: "wght@100..900",
          },
        ],
      },
    }),
    VitePWA({
      registerType: "prompt",
      manifest: {
        name: "MiVi",
        short_name: "MiVi",
        description: "MiVi is a midi visualizer.",
        theme_color: "oklch(0.5823 0.1411 327.2)",
        background_color: "oklch(0.985 0.002 247.839)",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["music", "utilities"],
        display: "standalone",
      },
      devOptions: {
        enabled: mode === "generateSW",
      },
      workbox: {
        runtimeCaching: [
          // https://vite-pwa-org.netlify.app/workbox/generate-sw.html#cache-external-resources
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    mode === "analyze" &&
      (visualizer({
        open: true,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }) as PluginOption),
    // Put the Codecov vite plugin after all other plugins
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "mivi",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
    mode === "development" && devBranchTitlePlugin(),
  ],
  optimizeDeps: {
    include: ["mediabunny", "throttle-debounce"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            ...deps.filter(
              (dep) => dep.includes("react") || dep.includes("@radix-ui"),
            ),
            "react-dom/client",
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      tests: path.resolve(__dirname, "./tests"),
    },
  },
  base: "/mivi/",
  test: {
    watch: false,
    silent: "passed-only",
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        ...(configDefaults.coverage.exclude || []),
        "src/components/ui/**",
        "dev-dist",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "happy-dom",
          setupFiles: ["./tests/setup.ts", "@vitest/web-worker"],
        },
      },
      {
        extends: true,
        test: {
          name: "e2e",
          setupFiles: ["./tests/browser.setup.ts"],
          browser: {
            commands: { waitForDownload },
            screenshotFailures: false,
            enabled: true,
            provider: playwright(),
            // https://vitest.dev/guide/browser/playwright
            instances: [{ browser: "chromium" }],
            headless: false,
            viewport: {
              width: 1024,
              height: 768,
            },
          },
          include: ["**/*.browser.?(c|m)[jt]s?(x)"],
        },
      },
    ],
  },
}));

const waitForDownload: BrowserCommand<[]> = (ctx) =>
  ctx.page.waitForEvent("download");

function devBranchTitlePlugin(): PluginOption {
  return {
    name: "dev-branch-title",
    transformIndexHtml(html) {
      try {
        const branch = execFileSync("git", ["branch", "--show-current"], {
          encoding: "utf-8",
        }).trim();
        if (branch) {
          return html.replace(
            /<title>(.*?)<\/title>/,
            `<title>$1 (${branch})</title>`,
          );
        }
      } catch {
        // ignore
      }
      return html;
    },
  };
}
