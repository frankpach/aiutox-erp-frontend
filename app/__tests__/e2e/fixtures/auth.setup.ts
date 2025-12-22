/**
 * Authentication Setup for E2E Tests
 *
 * Provides fixtures and helpers for authentication in E2E tests
 */

import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Login helper function
 */
export async function loginAsAdmin(page: Page) {
  // Navigate to login page
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
  const loginURL = `${baseURL}/login`;

  console.log(`[AUTH] Navigating to: ${loginURL}`);
  await page.goto(loginURL, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait a bit for page to render
  await page.waitForTimeout(2000);

  // Check current URL - might already be logged in or redirected
  const currentUrl = page.url();
  console.log(`[AUTH] Current URL after navigation: ${currentUrl}`);

  if (currentUrl.includes("/users") || currentUrl.includes("/dashboard")) {
    console.log("[AUTH] Already logged in, skipping login");
    return;
  }

  // Wait for page to be ready - check for either login form or already logged in
  try {
    // Try multiple selectors for email input
    const emailInput = page.locator('input[type="email"], input[id="email"], input[placeholder*="email" i]').first();
    console.log("[AUTH] Waiting for email input...");
    await emailInput.waitFor({ state: "visible", timeout: 20000 });
    console.log("[AUTH] Email input found");

    // Fill login form - using owner@aiutox.com for full access to all pages
    await emailInput.fill("owner@aiutox.com");
    console.log("[AUTH] Email filled");

    const passwordInput = page.locator('input[type="password"], input[id="password"]').first();
    await passwordInput.waitFor({ state: "visible", timeout: 5000 });
    await passwordInput.fill("password");
    console.log("[AUTH] Password filled");

    // Submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    await submitButton.waitFor({ state: "visible", timeout: 5000 });
    await submitButton.click();
    console.log("[AUTH] Submit clicked");

    // Wait for navigation to dashboard/users
    await page.waitForURL(/\/users|\/dashboard/, { timeout: 20000 });
    console.log("[AUTH] Navigation completed");
  } catch (error) {
    // Log page content for debugging
    const pageContent = await page.content();
    const pageText = await page.textContent("body");
    console.error(`[AUTH] Login error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`[AUTH] Page URL: ${page.url()}`);
    console.error(`[AUTH] Page title: ${await page.title()}`);
    console.error(`[AUTH] Page text (first 500 chars): ${pageText?.substring(0, 500)}`);

    // If we can't find login form, check if we're already logged in
    const finalUrl = page.url();
    if (finalUrl.includes("/users") || finalUrl.includes("/dashboard")) {
      console.log("[AUTH] Already logged in after error, continuing");
      return;
    }
    // If not logged in and can't find form, throw error
    throw new Error(`Failed to login: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Verify we're logged in (either Usuarios or Dashboard should be visible)
  const usuariosOrDashboard = page.locator("text=Usuarios").or(page.locator("text=Dashboard")).first();
  await expect(usuariosOrDashboard).toBeVisible({ timeout: 10000 });
  console.log("[AUTH] Login verification complete");
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

  const passwordInput = page.locator('input[type="password"], input[id="password"]');
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
  await page.click('text=Logout');

  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Extended test with auth fixtures
 */
export const test = base.extend({
  // Auto-login as admin before each test
  authenticatedPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

export { expect };






