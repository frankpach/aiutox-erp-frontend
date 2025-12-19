/**
 * Authentication helpers for E2E tests
 */

import type { Page } from "@playwright/test";

/**
 * Login as admin user
 * Uses the default admin credentials: admin@<appname>.com / password
 */
export async function loginAsAdmin(page: Page, appName: string = "aiutox") {
  // Navigate to login page (assuming it exists at /login)
  // If login is not implemented yet, we'll need to set auth directly
  await page.goto("/");

  // Check if we're already logged in by checking localStorage
  const token = await page.evaluate(() => localStorage.getItem("auth_token"));

  if (!token) {
    // If login page exists, perform login
    // Otherwise, set auth directly in localStorage and Zustand store
    const adminEmail = `admin@${appName}.com`;
    const adminPassword = "password";

    // Try to find login form
    const loginForm = page.locator('form[action*="login"], input[type="email"]').first();

    if (await loginForm.isVisible().catch(() => false)) {
      // Login via form
      await page.fill('input[type="email"]', adminEmail);
      await page.fill('input[type="password"]', adminPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(home|users|dashboard)/);
    } else {
      // Set auth directly (for development/testing)
      await page.evaluate(
        ({ email, password }) => {
          // Mock token (in real scenario, this would come from API)
          const mockToken = btoa(`${email}:${password}`);
          localStorage.setItem("auth_token", mockToken);

          // Set Zustand store
          const authState = {
            user: {
              id: "admin-user-id",
              email: email,
              full_name: "Admin User",
              is_active: true,
            },
            token: mockToken,
            isAuthenticated: true,
          };
          localStorage.setItem("auth-storage", JSON.stringify(authState));
        },
        { email: adminEmail, password: adminPassword }
      );
    }
  }

  // Wait for auth to be ready
  await page.waitForTimeout(500);
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth-storage");
  });
  await page.reload();
}


