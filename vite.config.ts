import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";

export default defineConfig({
  plugins: [react(), comlink()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    plugins: () => [comlink()],
  },
});
