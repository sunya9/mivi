import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { comlink } from "vite-plugin-comlink";
import Unfonts from "unplugin-fonts/vite";
import tailwindcss from "@tailwindcss/vite";

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
