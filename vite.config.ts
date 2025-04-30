/// <reference types="vitest" />
import path from "path";
import { defineConfig, PluginOption } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import Unfonts from "unplugin-fonts/vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import { codecovVitePlugin } from "@codecov/vite-plugin";

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: ["@babel/plugin-proposal-explicit-resource-management"],
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
      registerType: "autoUpdate",
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
        ],
        categories: ["music", "utilities"],
        display: "standalone",
      },
      devOptions: {
        enabled: mode === "development",
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
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom/client"],
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
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts", "@vitest/web-worker"],
    watch: false,
    coverage: {
      provider: "istanbul",
      exclude: [
        ...(configDefaults.coverage?.exclude ?? []),
        "src/components/ui/**",
        "dev-dist",
      ],
    },
  },
}));
