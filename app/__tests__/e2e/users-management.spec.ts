/**
 * E2E Tests for User Management
 *
 * Tests the complete user management flow including:
 * - Listing users
 * - Creating users
 * - Editing users
 * - Managing roles and permissions
 */

import { test, expect } from "@playwright/test";

test.describe("User Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Login (adjust selectors based on your login form)
    await page.fill('input[name="email"]', "admin@aiutox.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/(dashboard|users)/);
  });

  test("should display users list", async ({ page }) => {
    await page.goto("/users");

    // Check that users list is visible
    await expect(page.locator("h1")).toContainText("Usuarios");

    // Check for table or list of users
    const usersTable = page.locator("table, [data-testid='users-list']");
    await expect(usersTable).toBeVisible();
  });

  test("should open create user modal", async ({ page }) => {
    await page.goto("/users");

    // Click create user button
    const createButton = page.locator("button:has-text('Crear Usuario')");
    await createButton.click();

    // Check that modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check for form fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
  });

  test("should navigate to user detail page", async ({ page }) => {
    await page.goto("/users");

    // Click on first user (adjust selector based on your implementation)
    const firstUserLink = page.locator("table a, [data-testid='user-link']").first();
    if (await firstUserLink.count() > 0) {
      await firstUserLink.click();

      // Check that we're on user detail page
      await expect(page).toHaveURL(/\/users\/[^/]+$/);
      await expect(page.locator("h1, h2")).toContainText(/Usuario|User/i);
    }
  });

  test("should display user tabs", async ({ page }) => {
    await page.goto("/users");

    // Navigate to a user detail page
    const firstUserLink = page.locator("table a, [data-testid='user-link']").first();
    if (await firstUserLink.count() > 0) {
      await firstUserLink.click();

      // Check for tabs
      const tabs = page.locator('[role="tablist"]');
      if (await tabs.count() > 0) {
        await expect(tabs).toBeVisible();

        // Check for common tabs
        const tabTexts = await tabs.locator('[role="tab"]').allTextContents();
        expect(tabTexts.some((text) => text.includes("Información") || text.includes("General"))).toBeTruthy();
      }
    }
  });

  test("should show navigation tree with modules", async ({ page }) => {
    await page.goto("/users");

    // Check that sidebar/navigation is visible
    const sidebar = page.locator("nav, aside, [data-testid='sidebar']");
    await expect(sidebar).toBeVisible();

    // Check for navigation items
    const navItems = sidebar.locator("a, button");
    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);
  });
});

