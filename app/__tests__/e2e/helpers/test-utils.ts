/**
 * Common test utilities for E2E tests
 * Extracted from smoke tests best practices
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

// Parametrized URLs - avoid surprises with localhost vs 127.0.0.1
export const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:3000";
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// Admin credentials
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@aiutox.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "password";

/**
 * Log step with timestamp for debugging
 */
export function logStep(step: string, details?: unknown): void {
  const now = new Date().toISOString();
  const timePart = now.split("T")[1];
  const timestamp = timePart ? timePart.split(".")[0] : now;
  console.log(`[${timestamp}] 🔍 ${step}`);
  if (details) {
    console.log(`[${timestamp}]    Details:`, JSON.stringify(details, null, 2));
  }
}

/**
 * Non-critical console errors to ignore (CSP warnings, deprecations, etc.)
 */
export const IGNORABLE_CONSOLE_ERRORS = [
  "Warning",
  "warning",
  "Deprecation",
  "X-Frame-Options",
  "frame-ancestors",
  "Content Security Policy",
  "downloadable font",
  "favicon",
];

/**
 * Filter console errors, keeping only critical ones
 */
export function filterCriticalErrors(errors: string[]): string[] {
  return errors.filter((err) =>
    !IGNORABLE_CONSOLE_ERRORS.some((ignore) => err.includes(ignore))
  );
}

/**
 * Setup console error capturing for a page
 * Returns array that will be populated with errors
 */
export function setupConsoleCapture(page: Page): string[] {
  const errors: string[] = [];

  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
    logStep("Page error captured", { error: err.message });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console.error: ${msg.text()}`);
    }
  });

  return errors;
}

/**
 * Robust login function that works consistently
 * Uses the proven pattern from smoke tests
 */
export async function performLogin(
  page: Page,
  options: {
    email?: string;
    password?: string;
    expectSuccess?: boolean;
  } = {}
): Promise<{ success: boolean; status?: number; error?: string }> {
  const email = options.email ?? ADMIN_EMAIL;
  const password = options.password ?? ADMIN_PASSWORD;
  const expectSuccess = options.expectSuccess ?? true;

  logStep("Performing login...", { email });

  // Navigate to login page with absolute URL
  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: "domcontentloaded" });

  // Wait for login form
  await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
  logStep("Login form visible");

  // Fill credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Setup response listener before clicking
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/auth/login") &&
      response.request().method() === "POST",
    { timeout: 15000 }
  ).catch((error) => {
    logStep("Login request timeout or error", { error: String(error) });
    return null;
  });

  // Wait for React to hydrate and be ready
  await page.waitForTimeout(500);

  // Click submit button - use regular click, not force
  const submitButton = page.locator('button[type="submit"]').first();
  await expect(submitButton).toBeVisible({ timeout: 5000 });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  // Focus the password field first, then press Enter (more reliable than click)
  await page.locator('input[type="password"]').focus();
  await page.keyboard.press("Enter");

  // Wait for response
  const response = await loginResponsePromise;

  if (!response) {
    const error = "Login request did not complete";
    logStep("Login failed", { error });
    return { success: false, error };
  }

  const status = response.status();
  logStep(`Login response status: ${status}`);

  if (expectSuccess && status !== 200) {
    const responseBody = await response.text().catch(() => "No body");
    const error = `Login failed with status ${status}. Response: ${responseBody}`;
    logStep("Login failed", { error });
    return { success: false, status, error };
  }

  if (expectSuccess) {
    // Wait for navigation to dashboard
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      await page.waitForLoadState("domcontentloaded");
      logStep("Login successful, redirected to dashboard");
    } catch {
      const currentUrl = page.url();
      const error = `Login succeeded but did not redirect to dashboard. Current URL: ${currentUrl}`;
      logStep("Login redirect failed", { error, currentUrl });
      return { success: false, status, error };
    }
  }

  return { success: status === 200, status };
}

/**
 * Check if authenticated and wait for page to be ready
 * Useful after navigating to protected routes
 */
export async function waitForAuthenticatedPage(page: Page): Promise<boolean> {
  // Wait for ProtectedRoute to sync
  await page.waitForTimeout(500);

  // Check if we got redirected to login
  const currentUrl = page.url();
  if (currentUrl.includes("/login")) {
    logStep("Redirected to login - not authenticated", { currentUrl });
    return false;
  }

  // Wait for page content
  await page.waitForLoadState("domcontentloaded");
  logStep("Authenticated page ready", { currentUrl });
  return true;
}

/**
 * Navigate to a protected route and verify authentication
 */
export async function navigateToProtectedRoute(
  page: Page,
  route: string
): Promise<boolean> {
  logStep(`Navigating to protected route: ${route}`);
  await page.goto(`${FRONTEND_URL}${route}`, { waitUntil: "domcontentloaded" });
  return await waitForAuthenticatedPage(page);
}

/**
 * Take screenshot on failure for debugging
 */
export async function captureFailureScreenshot(
  page: Page,
  testName: string
): Promise<void> {
  try {
    const filename = `test-results/${testName.replace(/\s+/g, "-")}-failed.png`;
    await page.screenshot({ path: filename, fullPage: true });
    logStep(`Screenshot saved to ${filename}`);
  } catch {
    logStep("Could not take screenshot");
  }
}

