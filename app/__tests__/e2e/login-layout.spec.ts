/**
 * E2E Test for Login Flow and Layout Verification
 *
 * Tests:
 * 1. Login with admin credentials
 * 2. Verify layout components are displayed after login
 * 3. Verify navigation works
 *
 * IMPORTANT:
 * - Frontend server must be running on http://127.0.0.1:3000 (or adjust baseURL in playwright.config.ts)
 * - Backend server must be running and accessible
 * - Admin user must exist: admin@aiutox.com / password
 */

import { test, expect } from "@playwright/test";
import { checkFrontendServer, checkBackendServer } from "./helpers/check-server";
// import { createUserViaAPI } from "./helpers/create-user";

// Use only chromium for this test
test.use({
  browserName: "chromium",
  headless: false, // Run in headed mode to see the browser
});

// Test user credentials
const TEST_USER_EMAIL = "testuser@aiutox.com";
const TEST_USER_PASSWORD = "testpassword123";

// Admin credentials (from user rules)
const ADMIN_EMAIL = "admin@aiutox.com";
const ADMIN_PASSWORD = "password";

test.describe("Login and Layout Flow", () => {
  test.beforeAll(async ({ browser }) => {
    // Check if servers are running
    const context = await browser.newContext();
    const page = await context.newPage();

    const frontendRunning = await checkFrontendServer(page, "http://127.0.0.1:3000");
    const backendRunning = await checkBackendServer(page);

    await context.close();

    if (!frontendRunning) {
      throw new Error(
        "Frontend server is not running. Please start it with: cd frontend && npm run dev"
      );
    }

    if (!backendRunning) {
      console.warn(
        "⚠️  Backend server may not be running. Tests may fail if backend is required."
      );
    }
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    try {
      await page.goto("/login", { timeout: 10000, waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        localStorage.clear();
      });
    } catch (error) {
      console.error("Failed to navigate to login page:", error);
      throw error;
    }
  });

  test("should login successfully and display layout", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Verify login form is visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();

    // Fill login form with admin credentials
    // According to user rules: admin@<appname>.com / password
    console.log(`Attempting login with: ${ADMIN_EMAIL}`);

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    // Should redirect to dashboard when no redirect param exists
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    console.log(`Current URL after login: ${page.url()}`);

    // Verify we're logged in by checking for layout components
    // Header should be visible
    await expect(page.locator('header[role="banner"]')).toBeVisible({ timeout: 10000 });

    // Logo should be visible
    await expect(page.getByText("AiutoX ERP")).toBeVisible();

    // Sidebar should be visible (on desktop)
    await expect(page.locator('aside[role="navigation"]')).toBeVisible({ timeout: 5000 });

    // User menu should be visible
    await expect(page.locator('button[aria-label="Menú de usuario"]')).toBeVisible();

    // Main content area should be visible
    await expect(page.locator('main[role="main"]')).toBeVisible();

    // Footer should be visible
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
  });

  test("should display navigation items in sidebar", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Verify sidebar navigation items
    // Home should be visible (no permission required)
    await expect(page.getByRole("link", { name: /inicio/i })).toBeVisible({ timeout: 5000 });

    // Users should be visible if user has users.view permission
    // (Admin should have this permission)
    const usersLink = page.getByRole("link", { name: /usuarios/i });
    const isUsersVisible = await usersLink.isVisible().catch(() => false);

    if (isUsersVisible) {
      // Click on Users link
      await usersLink.click();
      await page.waitForURL(/\/users/, { timeout: 5000 });

      // Verify we're on users page
      expect(page.url()).toContain("/users");
    }
  });

  test("should open and close user menu", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Click on user menu
    const userMenuButton = page.locator('button[aria-label="Menú de usuario"]');
    await expect(userMenuButton).toBeVisible({ timeout: 5000 });
    await userMenuButton.click();

    // Verify menu options are visible
    await expect(page.getByText(/ver perfil/i)).toBeVisible({ timeout: 2000 });
    await expect(page.getByText(/configuración/i)).toBeVisible();
    await expect(page.getByText(/cerrar sesión/i)).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Open user menu
    const userMenuButton = page.locator('button[aria-label="Menú de usuario"]');
    await userMenuButton.click();

    // Click logout
    await page.getByText(/cerrar sesión/i).click();

    // Should redirect to login page
    await page.waitForURL(/\/login/, { timeout: 5000 });

    // Verify we're on login page
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Verify auth state is cleared
    const token = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(token).toBeNull();
  });

  test("should handle invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Try to login with invalid credentials
    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator('text=/credenciales inválidas|error al iniciar sesión/i')
    ).toBeVisible({ timeout: 5000 });

    // Should still be on login page
    expect(page.url()).toContain("/login");
  });
});



















