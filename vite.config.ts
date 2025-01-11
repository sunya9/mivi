import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import Unfonts from "unplugin-fonts/vite";

export default defineConfig({
  plugins: [
    react(),
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
});
