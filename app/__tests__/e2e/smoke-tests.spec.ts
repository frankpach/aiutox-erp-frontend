/**
 * Smoke Tests - Critical path validation
 * These tests must pass consistently before running the full suite
 *
 * IMPORTANT: Run in headed mode to see browser and debug issues
 * Run with: npx playwright test smoke-tests.spec.ts --project=chromium --headed --workers=1
 */

import { test, expect } from "@playwright/test";

// Parametrize URLs to avoid surprises
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:3000";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@aiutox.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "password";

// Helper to log progress with timestamp
function logStep(step: string, details?: unknown) {
  const now = new Date().toISOString();
  const timePart = now.split("T")[1];
  const timestamp = timePart ? timePart.split(".")[0] : now;
  console.log(`[${timestamp}] 🔍 ${step}`);
  if (details) {
    console.log(`[${timestamp}]    Details:`, JSON.stringify(details, null, 2));
  }
}


test.describe("Smoke Tests", () => {
  // Run tests serially to avoid race conditions
  test.describe.configure({ mode: "serial" });

  test("1. Backend health check", async ({ request }) => {
    logStep("Testing backend health endpoint...", { BACKEND_URL });

    try {
      const res = await request.get(`${BACKEND_URL}/healthz`);
      logStep(`Backend health response: ${res.status()}`);

      expect(res.status()).toBe(200);
      const body = await res.json();
      logStep("Backend health body:", body);

      expect(body).toMatchObject({ status: "ok" });
      logStep("✅ Backend health check PASSED");
    } catch (error) {
      logStep("❌ Backend health check FAILED", { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  });

  test("2. Backend login endpoint", async ({ request }) => {
    logStep("Testing backend login endpoint...", { BACKEND_URL });

    try {
      const res = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
        data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      });

      logStep(`Login response status: ${res.status()}`);
      expect(res.status()).toBe(200);

      const body = await res.json();
      logStep("Login response body keys:", Object.keys(body));

      expect(body?.data?.access_token).toBeTruthy();
      logStep("✅ Backend login endpoint PASSED - Token received");
    } catch (error) {
      logStep("❌ Backend login endpoint FAILED", { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  });

  test("3. Frontend loads and shows login page", async ({ page }) => {
    logStep("Starting frontend load test...", { FRONTEND_URL });

    // Capture console errors to detect React Router issues, redirect loops, etc.
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => {
      consoleErrors.push(`pageerror: ${err.message}`);
      logStep("Page error captured", { error: err.message });
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`console.error: ${msg.text()}`);
        logStep("Console error captured", { error: msg.text() });
      }
    });

    try {
      logStep("Navigating to /login...");
      // Use absolute URL to avoid baseURL dependency
      await page.goto(`${FRONTEND_URL}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });

      const currentUrl = page.url();
      logStep(`Current URL after navigation: ${currentUrl}`);

      await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
      logStep("✅ Body element is visible");

      // Use more robust selectors: name attribute OR type, and role-based for button
      const emailInput = page.locator('input[name="email"], input[type="email"]').first();
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      const submitButton = page.getByRole("button").filter({ hasText: /sign in|login|ingresar|iniciar sesión/i }).first();

      await expect(emailInput).toBeVisible({ timeout: 10000 });
      logStep("✅ Email input is visible");

      await expect(passwordInput).toBeVisible({ timeout: 10000 });
      logStep("✅ Password input is visible");

      await expect(submitButton).toBeVisible({ timeout: 10000 });
      logStep("✅ Submit button is visible");

      // Get button text for verification
      const buttonText = await submitButton.textContent();
      logStep(`Submit button text: ${buttonText}`);

      // Wait a bit for visual inspection (only in headed mode)
      logStep("Waiting 2 seconds for visual inspection...");
      await page.waitForTimeout(2000);

      // Check for console errors
      logStep("Console errors captured:", consoleErrors);
      if (consoleErrors.length > 0) {
        logStep("⚠️ Console errors found");
        // Filter out non-critical errors (CSP warnings, deprecations, etc.)
        const criticalErrors = consoleErrors.filter(
          (err) =>
            !err.includes("Warning") &&
            !err.includes("warning") &&
            !err.includes("Deprecation") &&
            !err.includes("X-Frame-Options") &&
            !err.includes("frame-ancestors") &&
            !err.includes("Content Security Policy")
        );
        if (criticalErrors.length > 0) {
          logStep("❌ Critical console errors found:", criticalErrors);
        }
        expect(criticalErrors).toEqual([]);
      }

      logStep("✅ Frontend loads test PASSED");
    } catch (error) {
      logStep("❌ Frontend loads test FAILED", { error: error instanceof Error ? error.message : String(error) });
      logStep("Console errors at failure:", consoleErrors);

      try {
        await page.screenshot({ path: "test-results/smoke-frontend-failed.png", fullPage: true });
        logStep("Screenshot saved to test-results/smoke-frontend-failed.png");
      } catch {
        logStep("Could not take screenshot");
      }

      throw error;
    }
  });

  test("4. CORS headers (OPTIONS preflight)", async ({ request }) => {
    // Test CORS preflight (OPTIONS) - this validates the browser can make requests
    // We test /healthz since it's a public endpoint
    const originCandidates = [
      process.env.FRONTEND_ORIGIN ?? "http://127.0.0.1:3000",
      "http://localhost:3000",
    ];

    for (const origin of originCandidates) {
      logStep("Testing CORS preflight...", { BACKEND_URL, origin });

      try {
        // Preflight OPTIONS request (what browser actually does before cross-origin requests)
        const preflight = await request.fetch(`${BACKEND_URL}/healthz`, {
          method: "OPTIONS",
          headers: {
            Origin: origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
          },
        });

        logStep(`Preflight status: ${preflight.status()}`);
        expect([200, 204]).toContain(preflight.status());

        const preHeaders = preflight.headers();
        const allowOrigin = preHeaders["access-control-allow-origin"];
        const allowMethods = preHeaders["access-control-allow-methods"];
        const allowHeaders = preHeaders["access-control-allow-headers"];

        logStep("Preflight CORS headers:", { allowOrigin, allowMethods, allowHeaders });

        // CORS headers must be present
        expect(allowOrigin).toBeTruthy();
        expect(allowMethods ?? "").toMatch(/GET/i);

        // Verify origin is allowed
        if (allowOrigin) {
          const originHost = origin.replace("http://", "").replace("https://", "");
          const isValid = allowOrigin === "*" || allowOrigin.includes(originHost);
          logStep(`CORS origin validation: ${isValid ? "VALID" : "INVALID"} (${allowOrigin})`);
          expect(isValid).toBeTruthy();
        }

        // Also test actual GET to ensure CORS headers come back on real responses
        const res = await request.get(`${BACKEND_URL}/healthz`, {
          headers: { Origin: origin },
        });

        logStep(`GET /healthz status: ${res.status()}`);
        expect(res.status()).toBe(200);

        const headers = res.headers();
        const corsHeader = headers["access-control-allow-origin"];
        logStep(`GET CORS allow-origin: ${corsHeader}`);

        expect(corsHeader).toBeTruthy();

        logStep(`✅ CORS test PASSED for origin: ${origin}`);
      } catch (error) {
        logStep(`❌ CORS test FAILED for origin: ${origin}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }
  });
});
