/**
 * Authentication Setup for E2E Tests
 *
 * Provides fixtures and helpers for authentication in E2E tests
 */

import { test as base, expect, type Page } from "@playwright/test";

/**
 * Login helper function
 */
export async function loginAsAdmin(page: Page) {
  // Navigate to login page
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
  const loginURL = `${baseURL}/login`;

  console.warn(`[AUTH] Navigating to: ${loginURL}`);
  await page.goto(loginURL, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait a bit for page to render
  await page.waitForTimeout(2000);

  // Check current URL - might already be logged in or redirected
  const currentUrl = page.url();
  console.warn(`[AUTH] Current URL after navigation: ${currentUrl}`);

  if (currentUrl.includes("/users") || currentUrl.includes("/dashboard")) {
    console.warn("[AUTH] Already logged in, skipping login");
    return;
  }

  // Check if page shows an error
  const pageTitle = await page.title();
  const pageText = await page.textContent("body");

  if (pageTitle === "Error" || (pageText && pageText.trim().length === 0)) {
    console.error(`[AUTH] Page shows error. Title: ${pageTitle}`);
    console.error(`[AUTH] Page content: ${pageText?.substring(0, 500)}`);

    // Try to get more info from the page
    const errorElement = page.locator("text=/Error|error|Failed/i").first();
    if ((await errorElement.count()) > 0) {
      const errorText = await errorElement.textContent();
      console.error(`[AUTH] Error text found: ${errorText}`);
    }

    // Check if it's a network error
    const response = await page
      .goto(loginURL, { waitUntil: "domcontentloaded", timeout: 10000 })
      .catch(() => null);
    if (!response || !response.ok()) {
      throw new Error(
        `Server returned error: ${response?.status()} ${response?.statusText()}. Make sure the frontend server is running on ${baseURL}`
      );
    }
  }

  // Wait for page to be ready - check for either login form or already logged in
  try {
    // Try multiple selectors for email input
    const emailInput = page
      .locator(
        'input[type="email"], input[id="email"], input[name="email"], input[placeholder*="email" i]'
      )
      .first();
    console.warn("[AUTH] Waiting for email input...");
    await emailInput.waitFor({ state: "visible", timeout: 20000 });
    console.warn("[AUTH] Email input found");

    // Fill login form - using owner@aiutox.com for full access to all pages
    await emailInput.fill("owner@aiutox.com");
    console.warn("[AUTH] Email filled");

    const passwordInput = page
      .locator('input[type="password"], input[id="password"]')
      .first();
    await passwordInput.waitFor({ state: "visible", timeout: 5000 });
    await passwordInput.fill("password");
    console.warn("[AUTH] Password filled");

    // Submit
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")'
      )
      .first();
    await submitButton.waitFor({ state: "visible", timeout: 5000 });
    await submitButton.click();
    console.warn("[AUTH] Submit clicked");

    // Wait for navigation to dashboard/users
    await page.waitForURL(/\/users|\/dashboard/, { timeout: 20000 });
    console.warn("[AUTH] Navigation completed");
  } catch (error) {
    // Log page content for debugging
    const pageText = await page.textContent("body");
    console.error(
      `[AUTH] Login error: ${error instanceof Error ? error.message : String(error)}`
    );
    console.error(`[AUTH] Page URL: ${page.url()}`);
    console.error(`[AUTH] Page title: ${await page.title()}`);
    console.error(
      `[AUTH] Page text (first 500 chars): ${pageText?.substring(0, 500)}`
    );

    // If we can't find login form, check if we're already logged in
    const finalUrl = page.url();
    if (finalUrl.includes("/users") || finalUrl.includes("/dashboard")) {
      console.warn("[AUTH] Already logged in after error, continuing");
      return;
    }
    // If not logged in and can't find form, throw error
    throw new Error(
      `Failed to login: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Verify we're logged in (either Usuarios, Dashboard, or any other page content should be visible)
  try {
    const usuariosOrDashboard = page
      .locator("text=Usuarios")
      .or(page.locator("text=Dashboard"))
      .first();
    await expect(usuariosOrDashboard).toBeVisible({ timeout: 5000 });
    console.warn("[AUTH] Login verification complete");
  } catch (_error) {
    // If we can't find Usuarios or Dashboard, check if we're on a valid page
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      throw new Error("Login failed - still on login page");
    }
    // If we're not on login page, assume login was successful
    console.warn("[AUTH] Login verification complete (alternative page)");
  }
}

/**
 * Login helper for custom user
 */
export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Wait for login form to be visible
  const emailInput = page.locator('input[type="email"], input[id="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 15000 });

  await emailInput.fill(email);

  const passwordInput = page.locator(
    'input[type="password"], input[id="password"]'
  );
  await passwordInput.fill(password);

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  await page.waitForURL(/\/users|\/dashboard/, { timeout: 15000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');

  // Click logout
  await page.click("text=Logout");

  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Extended test with auth fixtures
 */
type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  // Auto-login as admin before each test
  authenticatedPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

export { expect };
