import { defineConfig, devices } from "@playwright/test";

const runAllBrowsers =
  process.env.CI === "true" || process.env.PLAYWRIGHT_ALL_BROWSERS === "true";

export default defineConfig({
  testDir: "./app/__tests__/e2e",
  fullyParallel: true, // Ejecutar tests en paralelo cuando sea posible
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Parallel execution: 4 workers en desarrollo, 1 en CI
  // fullyParallel permite que tests en diferentes archivos se ejecuten en paralelo
  workers: process.env.CI ? 1 : 4,
  // Maximum number of test failures before stopping
  maxFailures: process.env.CI ? undefined : 10,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    ...(process.env.CI ? [["junit", { outputFile: "test-results/junit.xml" }] as const] : []),
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    headless: process.env.CI ? true : false, // No headless en desarrollo según reglas
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Timeout para acciones
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // ⚠️ CRÍTICO: Bloquear Service Workers en tests por defecto
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(runAllBrowsers
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
    {
      name: "pwa",
      use: {
        ...devices["Desktop Chrome"],
        serviceWorkers: "allow",
      },
      testMatch: "**/pwa*.spec.ts",
    },
  ],
  // Configurar servidores para E2E tests
  // Si SKIP_WEBSERVER=true, Playwright asumirá que los servidores ya están corriendo
  webServer:
    process.env.SKIP_WEBSERVER === "true"
      ? undefined
      : [
          {
            command:
              "cd ../backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000",
            url: "http://localhost:8000/healthz",
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
            stdout: "ignore",
            stderr: "pipe",
            env: {
              ...process.env,
              DATABASE_URL:
                process.env.TEST_DATABASE_URL ||
                "postgresql://devuser:devpass@localhost:15432/aiutox_erp_test",
              REDIS_URL:
                process.env.TEST_REDIS_URL || "redis://localhost:6379/1",
            },
          },
          {
            command: "npm run dev",
            url: "http://127.0.0.1:3000",
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
            stdout: "ignore",
            stderr: "pipe",
          },
        ],
});
