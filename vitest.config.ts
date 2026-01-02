import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // Polyfill for react-dom/test-utils in React 19
      // @testing-library/react still tries to import from react-dom/test-utils
      // which is deprecated. We redirect it to our polyfill.
      "react-dom/test-utils": path.resolve(
        __dirname,
        "./app/__tests__/polyfills/react-dom-test-utils.ts"
      ),
      // Mock for virtual:pwa-register/react in tests
      "virtual:pwa-register/react": path.resolve(
        __dirname,
        "./app/__mocks__/virtual-pwa-register-react.ts"
      ),
      // NOTE: We don't alias "react" here because it would create circular dependencies.
      // Instead, we configure React.act in setup.ts before @testing-library/react loads.
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./app/__tests__/setup.ts"],
    include: ["app/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/app/__tests__/e2e/**", // Exclude Playwright E2E tests
    ],
    // Parallel execution configuration
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 2, // Reducido a 2 para evitar EMFILE en Windows
      },
    },
    // File-level parallelism - ejecutar archivos de test en paralelo
    fileParallelism: true,
    // Test-level parallelism dentro de cada archivo
    sequence: {
      shuffle: false, // Mantener orden para debugging
      concurrent: true, // Ejecutar tests dentro de un archivo en paralelo cuando sea seguro
    },
    // Test timeouts - reduced to avoid long waits
    testTimeout: 5000,
    hookTimeout: 5000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "app/__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
      ],
    },
  },
});

