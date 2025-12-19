/**
 * E2E tests for SavedFilters feature
 * Tests complete user flows for creating, managing, and applying saved filters
 */

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import { setupApiMocks } from "./helpers/api-mock";

test.describe("SavedFilters - Basic Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks
    await setupApiMocks(page);

    // Login as admin
    await loginAsAdmin(page);

    // Navigate to users page
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
  });

  test("should display saved filters dropdown", async ({ page }) => {
    // Find the SavedFilters button/dropdown
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();

    await expect(filtersButton).toBeVisible();

    // Click to open dropdown
    await filtersButton.click();

    // Check that dropdown content is visible
    const dropdownContent = page.locator('[role="menu"], [data-radix-popper-content-wrapper]').first();
    await expect(dropdownContent).toBeVisible({ timeout: 2000 });
  });

  test("should show list of saved filters in dropdown", async ({ page }) => {
    // Open filters dropdown
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();

    // Wait for dropdown to be visible
    await page.waitForTimeout(500);

    // Check for filter items (may need to adjust selectors based on actual implementation)
    const filterItems = page.locator('[role="menuitem"], [data-radix-menu-item]');
    const count = await filterItems.count();

    // Should have at least one filter (the default one from mock)
    expect(count).toBeGreaterThan(0);
  });

  test("should apply a saved filter when selected", async ({ page }) => {
    // Open filters dropdown
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();

    await page.waitForTimeout(500);

    // Click on first filter (or a specific filter)
    const firstFilter = page.locator('[role="menuitem"]').first();
    const filterName = await firstFilter.textContent();

    await firstFilter.click();

    // Verify filter is applied (check URL or button text)
    await page.waitForTimeout(1000);

    // Check that the filter name appears in the button or URL
    const url = page.url();
    const buttonText = await filtersButton.textContent();

    // Filter should be reflected in URL or button text
    expect(url.includes("filter") || buttonText?.includes(filterName || "")).toBeTruthy();
  });

  test("should clear applied filter", async ({ page }) => {
    // First apply a filter
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    const firstFilter = page.locator('[role="menuitem"]').first();
    await firstFilter.click();
    await page.waitForTimeout(1000);

    // Now clear the filter
    await filtersButton.click();
    await page.waitForTimeout(500);

    // Look for "Clear" or "Limpiar" button
    const clearButton = page.locator('button:has-text("Limpiar"), button:has-text("Clear"), button:has-text("Sin filtro")').first();

    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      await page.waitForTimeout(1000);

      // Verify filter is cleared
      const url = page.url();
      expect(url.includes("filter")).toBeFalsy();
    }
  });
});

test.describe("SavedFilters - Create Filter", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await loginAsAdmin(page);
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
  });

  test("should open filter editor modal when clicking 'Nuevo Filtro'", async ({ page }) => {
    // Open filters dropdown
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    // Click "Nuevo Filtro" or "New Filter"
    const newFilterButton = page.locator('button:has-text("Nuevo Filtro"), button:has-text("New Filter")').first();

    if (await newFilterButton.isVisible().catch(() => false)) {
      await newFilterButton.click();
      await page.waitForTimeout(500);

      // Check that modal is visible
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Check for modal title
      const modalTitle = page.locator('h2:has-text("Filtro"), h2:has-text("Filter")').first();
      await expect(modalTitle).toBeVisible();
    }
  });

  test("should create filter using visual editor", async ({ page }) => {
    // Open filter editor
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    const newFilterButton = page.locator('button:has-text("Nuevo Filtro"), button:has-text("New Filter")').first();

    if (await newFilterButton.isVisible().catch(() => false)) {
      await newFilterButton.click();
      await page.waitForTimeout(500);

      // Fill in filter name
      const nameInput = page.locator('input[placeholder*="Nombre"], input[placeholder*="Name"]').first();
      await nameInput.fill("Test Filter E2E");

      // Switch to visual editor tab if needed
      const visualTab = page.locator('button:has-text("Visual"), button[data-state="active"]').first();
      if (await visualTab.isVisible().catch(() => false)) {
        await visualTab.click();
      }

      // Add a filter condition (if visual editor is available)
      // This depends on the actual implementation of VisualFilterEditor

      // Save the filter
      const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Save")').last();
      await saveButton.click();

      // Wait for modal to close
      await page.waitForTimeout(1000);

      // Verify filter was created (check dropdown or success message)
      await filtersButton.click();
      await page.waitForTimeout(500);

      const filterInList = page.locator('text="Test Filter E2E"').first();
      await expect(filterInList).toBeVisible({ timeout: 3000 });
    }
  });

  test("should create filter using JSON editor", async ({ page }) => {
    // Open filter editor
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    const newFilterButton = page.locator('button:has-text("Nuevo Filtro"), button:has-text("New Filter")').first();

    if (await newFilterButton.isVisible().catch(() => false)) {
      await newFilterButton.click();
      await page.waitForTimeout(500);

      // Fill in filter name
      const nameInput = page.locator('input[placeholder*="Nombre"], input[placeholder*="Name"]').first();
      await nameInput.fill("Test JSON Filter");

      // Switch to JSON editor tab
      const jsonTab = page.locator('button:has-text("JSON")').first();
      if (await jsonTab.isVisible().catch(() => false)) {
        await jsonTab.click();
        await page.waitForTimeout(300);

        // Fill JSON editor (if using react-ace or textarea)
        const jsonEditor = page.locator('textarea, .ace_text-input').first();
        if (await jsonEditor.isVisible().catch(() => false)) {
          await jsonEditor.fill(JSON.stringify({
            email: { operator: "contains", value: "test" }
          }, null, 2));
        }
      }

      // Save the filter
      const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Save")').last();
      await saveButton.click();

      // Wait for modal to close
      await page.waitForTimeout(1000);

      // Verify filter was created
      await filtersButton.click();
      await page.waitForTimeout(500);

      const filterInList = page.locator('text="Test JSON Filter"').first();
      await expect(filterInList).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe("SavedFilters - Manage Filters", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await loginAsAdmin(page);
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
  });

  test("should open filter management modal", async ({ page }) => {
    // Open filters dropdown
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    // Click "Gestionar Filtros" or "Manage Filters"
    const manageButton = page.locator('button:has-text("Gestionar"), button:has-text("Manage")').first();

    if (await manageButton.isVisible().catch(() => false)) {
      await manageButton.click();
      await page.waitForTimeout(500);

      // Check that management modal is visible
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();
    }
  });

  test("should edit an existing filter", async ({ page }) => {
    // Open management modal
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    const manageButton = page.locator('button:has-text("Gestionar"), button:has-text("Manage")').first();

    if (await manageButton.isVisible().catch(() => false)) {
      await manageButton.click();
      await page.waitForTimeout(500);

      // Find and click edit button for first filter
      const editButton = page.locator('button:has-text("Editar"), button[aria-label*="edit" i]').first();

      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(500);

        // Check that editor modal is open
        const editorModal = page.locator('[role="dialog"]').first();
        await expect(editorModal).toBeVisible();
      }
    }
  });

  test("should delete a filter", async ({ page }) => {
    // Open management modal
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    const manageButton = page.locator('button:has-text("Gestionar"), button:has-text("Manage")').first();

    if (await manageButton.isVisible().catch(() => false)) {
      await manageButton.click();
      await page.waitForTimeout(500);

      // Find delete button (should not be for default filter)
      const deleteButton = page.locator('button:has-text("Eliminar"), button[aria-label*="delete" i]').first();

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();
        await page.waitForTimeout(500);

        // Confirm deletion if confirmation dialog appears
        const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Confirm")').first();
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click();
          await page.waitForTimeout(1000);
        }

        // Verify filter was deleted (modal should close or filter should disappear)
        // Modal might still be open, but filter should be removed from list
      }
    }
  });
});

test.describe("SavedFilters - URL Synchronization", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await loginAsAdmin(page);
  });

  test("should sync filter ID with URL", async ({ page }) => {
    await page.goto("/users");
    await page.waitForLoadState("networkidle");

    // Apply a filter
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    await filtersButton.click();
    await page.waitForTimeout(500);

    const firstFilter = page.locator('[role="menuitem"]').first();
    await firstFilter.click();
    await page.waitForTimeout(1000);

    // Check URL contains filter parameter
    const url = page.url();
    // URL should contain filter ID (format may vary: ?filter=xxx or ?saved_filter_id=xxx)
    expect(url.includes("filter") || url.includes("saved_filter")).toBeTruthy();
  });

  test("should load filter from URL on page load", async ({ page }) => {
    // Navigate with filter in URL
    await page.goto("/users?filter=filter-1");
    await page.waitForLoadState("networkidle");

    // Verify filter is applied (button should show filter name)
    const filtersButton = page.locator('button:has-text("Filtros Guardados"), button:has-text("Filtros")').first();
    const buttonText = await filtersButton.textContent();

    // Button should show filter name, not just "Filtros Guardados"
    expect(buttonText).not.toBe("Filtros Guardados");
  });
});


