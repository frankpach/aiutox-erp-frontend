import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./app/__tests__/e2e",
  fullyParallel: false, // Desactivar paralelo para ver resultados claros
  forbidOnly: false,
  retries: 0,
  workers: 1, // Solo un worker para resultados secuenciales
  maxFailures: 50,
  reporter: "line", // Solo reporter inline
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "off", // Sin trace para resultados limpios
    headless: true, // Headless para resultados consistentes
    screenshot: "off", // Sin screenshots para resultados limpios
    video: "off", // Sin video para resultados limpios
    actionTimeout: 10000,
    navigationTimeout: 30000,
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Solo Chromium - sin Firefox ni WebKit
  ],
  webServer: process.env.SKIP_WEBSERVER === "true" ? undefined : [
    {
      command: "cd ../backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000",
      url: "http://localhost:8000/healthz",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: "ignore",
      stderr: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL || "postgresql://devuser:devpass@localhost:15432/aiutox_erp_test",
        REDIS_URL: process.env.TEST_REDIS_URL || "redis://localhost:6379/1",
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
