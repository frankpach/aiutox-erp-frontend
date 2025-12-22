/**
 * Debug test to verify login communication
 */

import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@aiutox.com";
const ADMIN_PASSWORD = "password";

test.describe("Debug Login", () => {
  test("debug login flow", async ({ page }) => {
    // Capture all network requests
    const requests: Array<{ url: string; method: string; status?: number }> = [];
    const responses: Array<{ url: string; status: number; body?: string }> = [];

    page.on("request", (request) => {
      if (request.url().includes("api/v1")) {
        requests.push({
          url: request.url(),
          method: request.method(),
        });
      }
    });

    page.on("response", async (response) => {
      if (response.url().includes("api/v1")) {
        const body = await response.text().catch(() => "");
        responses.push({
          url: response.url(),
          status: response.status(),
          body: body.substring(0, 200),
        });
      }
    });

    // Capture console logs
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

      // Fill form
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);

      // Wait for login response BEFORE clicking submit
      const loginResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/api/v1/auth/login") && response.request().method() === "POST",
        { timeout: 15000 }
      );

      // Click submit button - try multiple selectors
      const submitButton = page.locator('button[type="submit"]').first();
      await expect(submitButton).toBeVisible({ timeout: 5000 });
      await submitButton.click({ force: true });

      // Wait for login response
      const loginResponse = await loginResponsePromise;

    console.log("Login response status:", loginResponse.status());
    console.log("Login response body:", await loginResponse.text());

    // Wait a bit for any navigation or state updates
    await page.waitForTimeout(2000);

    console.log("\n=== Network Requests ===");
    requests.forEach((req) => console.log(`${req.method} ${req.url}`));

    console.log("\n=== Network Responses ===");
    responses.forEach((res) => console.log(`${res.status} ${res.url}`));

    console.log("\n=== Console Logs ===");
    consoleLogs.forEach((log) => console.log(log));

    console.log("\n=== Current URL ===");
    const currentURL = page.url();
    console.log(currentURL);

    // Try to get localStorage with timeout protection
    console.log("\n=== LocalStorage ===");
    try {
      const authToken = await Promise.race([
        page.evaluate(() => localStorage.getItem("auth_token")),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      ]) as string | null;
      const refreshToken = await Promise.race([
        page.evaluate(() => localStorage.getItem("refresh_token")),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      ]) as string | null;
      console.log("auth_token:", authToken ? `${authToken.substring(0, 30)}...` : "null");
      console.log("refresh_token:", refreshToken ? `${refreshToken.substring(0, 30)}...` : "null");
    } catch (error) {
      console.log("Error reading localStorage:", error);
    }

    // Check if we're on dashboard
    if (currentURL.includes("/dashboard")) {
      console.log("\n✅ Successfully redirected to dashboard");
    } else {
      console.log(`\n❌ Still on ${currentURL}, expected /dashboard`);
      await page.screenshot({ path: "test-results/debug-login.png", fullPage: true });
    }
  });
});

