import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // Disable source maps in production
    minify: "terser", // Minify JS using Terser
    terserOptions: {
      compress: {
        drop_console: true, // Console log সরিয়ে ফেলবে
        drop_debugger: true, // Debugger সরিয়ে ফেলবে
      },
    },
  },
}));
