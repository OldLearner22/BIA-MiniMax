import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import sourceIdentifierPlugin from "vite-plugin-source-identifier";

const isProd = process.env.BUILD_MODE === "prod";
export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: "data-matrix",
      includeProps: true,
    }),
  ],
  server: {
    proxy: {
      "/api": {
        // Use DEV_BACKEND_URL to override during development; default to Node server on 3001
        target: process.env.DEV_BACKEND_URL || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
