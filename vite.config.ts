import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { comlink } from "vite-plugin-comlink";
import Unfonts from "unplugin-fonts/vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        presets: ["jotai/babel/preset"],
        plugins: ["@babel/plugin-proposal-explicit-resource-management"],
      },
    }),
    comlink(),
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
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    plugins: () => [comlink()],
  },
  base: "/mivi/",
});
