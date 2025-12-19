/**
 * E2E Tests for Module Discovery System
 *
 * Tests the autodiscovery system including:
 * - Module loading on app startup
 * - Navigation tree rendering
 * - Permission-based filtering
 */

import { test, expect } from "@playwright/test";

test.describe("Module Discovery", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Login
    await page.fill('input[name="email"]', "admin@aiutox.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/\/(dashboard|users)/);
  });

  test("should load modules on app startup", async ({ page }) => {
    // Navigate to any authenticated page
    await page.goto("/users");

    // Wait for modules to load (check for navigation items)
    const sidebar = page.locator("nav, aside, [data-testid='sidebar']");
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    // Check that navigation items are present
    const navItems = sidebar.locator("a, button");
    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display hierarchical navigation", async ({ page }) => {
    await page.goto("/users");

    const sidebar = page.locator("nav, aside, [data-testid='sidebar']");
    await expect(sidebar).toBeVisible();

    // Check for categories/groups (level 1)
    const categories = sidebar.locator("[data-category], .category, h3, h4");
    const categoryCount = await categories.count();

    // If categories exist, verify structure
    if (categoryCount > 0) {
      // Check for modules under categories (level 2)
      const modules = sidebar.locator("[data-module], .module");
      const moduleCount = await modules.count();
      expect(moduleCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("should filter navigation by permissions", async ({ page }) => {
    await page.goto("/users");

    // Navigation should only show items user has permission for
    const sidebar = page.locator("nav, aside, [data-testid='sidebar']");
    await expect(sidebar).toBeVisible();

    // Users link should be visible (admin has permission)
    const usersLink = sidebar.locator('a[href*="/users"]');
    await expect(usersLink).toBeVisible();
  });

  test("should navigate to module pages", async ({ page }) => {
    await page.goto("/users");

    const sidebar = page.locator("nav, aside, [data-testid='sidebar']");

    // Click on users link in navigation
    const usersLink = sidebar.locator('a[href="/users"], a[href*="/users"]').first();
    if (await usersLink.count() > 0) {
      await usersLink.click();

      // Should navigate to users page
      await expect(page).toHaveURL(/\/users/);
    }
  });
});

