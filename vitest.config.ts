import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    // Unit/component tests only. Playwright specs live in e2e/ and must never be collected here.
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
    css: false,
    restoreMocks: true,
    coverage: {
      // Uses the default v8 provider; install @vitest/coverage-v8 to enable `vitest --coverage`.
      reporter: ["text", "html"],
      include: ["lib/**", "components/**", "app/api/**", "data/**"],
      exclude: ["components/motion/**", "**/*.d.ts"],
    },
  },
});
