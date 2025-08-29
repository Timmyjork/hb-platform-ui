// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vitest config is colocated here for simplicity.
// Uses jsdom and a global test env with a lightweight setup file.

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
});
