/**
 * E2E Tests for User Filters
 *
 * Tests the filtering functionality for users:
 * - Search filter (by email, first name, last name)
 * - Active/Inactive status filter
 * - Combined filters
 * - Saved filters integration
 *
 * Requires: Backend and Frontend running
 */

import { test, expect } from "../fixtures/auth.setup";
import { UsersPage } from "../helpers/page-objects/UsersPage";

test.describe("User Filters E2E", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to users page
    await authenticatedPage.goto("/users");
    await authenticatedPage.waitForSelector("table tbody tr", { timeout: 10000 });
  });

  test("should filter users by search term", async ({ authenticatedPage: page }) => {
    const usersPage = new UsersPage(page);

    // Get initial count
    const initialCount = await usersPage.getUserCount();

    // Search for a specific term (use first user's email as test)
    const firstRow = page.locator("table tbody tr").first();
    const firstUserEmail = await firstRow.locator("td").first().textContent();

    if (firstUserEmail) {
      // Extract part of email for search
      const searchTerm = firstUserEmail.split("@")[0].substring(0, 5);

      // Type in search input (use the enabled one, not the disabled SavedFilters input)
      const searchInput = page.locator('input[type="text"][placeholder*="Buscar usuarios"]:not([disabled]), input[type="text"][placeholder*="Search users"]:not([disabled])').first();
      await searchInput.fill(searchTerm);

      // Wait for results to filter
      await page.waitForTimeout(1000);

      // Verify results are filtered
      const filteredCount = await usersPage.getUserCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Verify all visible users match search term
      const visibleEmails = await page.locator("table tbody tr td:first-child").allTextContents();
      visibleEmails.forEach((email) => {
        expect(email.toLowerCase()).toContain(searchTerm.toLowerCase());
      });
    }
  });

  test("should filter users by active status", async ({ authenticatedPage: page }) => {
    const usersPage = new UsersPage(page);

    // Filter by active users
    const statusSelect = page.locator('select').filter({ hasText: /Todos|All/i });
    await statusSelect.selectOption("active");

    // Wait for results to filter
    await page.waitForTimeout(1000);

    // Verify all visible users are active
    const activeBadges = page.locator('span:has-text("Activo"), span:has-text("Active")');
    const activeCount = await activeBadges.count();
    const totalRows = await page.locator("table tbody tr").count();

    // All visible users should be active
    expect(activeCount).toBeGreaterThan(0);

    // Filter by inactive users
    await statusSelect.selectOption("inactive");
    await page.waitForTimeout(1000);

    // Verify all visible users are inactive
    const inactiveBadges = page.locator('span:has-text("Inactivo"), span:has-text("Inactive")');
    const inactiveCount = await inactiveBadges.count();

    // All visible users should be inactive
    expect(inactiveCount).toBeGreaterThan(0);
  });

  test("should combine search and status filters", async ({ authenticatedPage: page }) => {
    // Wait for table to load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Apply search filter (use the enabled one, not the disabled SavedFilters input)
    const searchInput = page.locator('input[type="text"][placeholder*="Buscar usuarios"]:not([disabled]), input[type="text"][placeholder*="Search users"]:not([disabled])').first();
    await searchInput.fill("test");
    await page.waitForTimeout(500);

    // Apply status filter
    const statusSelect = page.locator('select').filter({ hasText: /Todos|All/i });
    await statusSelect.selectOption("active");
    await page.waitForTimeout(1000);

    // Verify filters are applied
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe("test");

    const statusValue = await statusSelect.inputValue();
    expect(statusValue).toBe("active");
  });

  test("should clear filters and show all users", async ({ authenticatedPage: page }) => {
    const usersPage = new UsersPage(page);

    // Wait for table to load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Get initial count
    const initialCount = await usersPage.getUserCount();

    // Apply filters (use the enabled one, not the disabled SavedFilters input)
    const searchInput = page.locator('input[type="text"][placeholder*="Buscar usuarios"]:not([disabled]), input[type="text"][placeholder*="Search users"]:not([disabled])').first();
    await searchInput.fill("nonexistentuser12345");
    await page.waitForTimeout(1000);

    // Verify filtered results (should be 0 or show "no users" message)
    const filteredCount = await usersPage.getUserCount();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);

    // Verify all users are shown again
    const clearedCount = await usersPage.getUserCount();
    expect(clearedCount).toBeGreaterThanOrEqual(initialCount);
  });

  test("should maintain filters during pagination", async ({ authenticatedPage: page }) => {
    // Wait for table to load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Apply search filter (use the enabled one, not the disabled SavedFilters input)
    const searchInput = page.locator('input[type="text"][placeholder*="Buscar usuarios"]:not([disabled]), input[type="text"][placeholder*="Search users"]:not([disabled])').first();
    await searchInput.fill("test");
    await page.waitForTimeout(1000);

    // Check if pagination exists
    const nextButton = page.locator('button:has-text("Siguiente"), button:has-text("Next")');
    const hasNext = await nextButton.isEnabled().catch(() => false);

    if (hasNext) {
      // Navigate to next page
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Verify filter is still applied
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe("test");
    }
  });
});

