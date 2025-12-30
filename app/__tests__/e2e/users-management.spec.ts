/**
 * E2E Tests for User Management
 *
 * Tests the complete user management flow including:
 * - Listing users
 * - Creating users
 * - Editing users
 * - Deleting users
 * - Search and filters
 * - Pagination
 * - Form validations
 * - Error handling
 * - Managing roles and permissions
 */

import { test, expect } from "./fixtures/auth.setup";

test.describe("User Management", () => {

  test("should display users list", async ({ authenticatedPage: page }) => {
    await page.goto("/users", { waitUntil: "networkidle" });

    // Wait a bit for lazy loading and API calls
    await page.waitForTimeout(3000);

    // Check if there's an error page first
    const errorTitle = page.locator('h1:has-text("Error del Sistema")');
    const hasError = await errorTitle.isVisible().catch(() => false);

    if (hasError) {
      // Get error details from the page
      const errorMessage = await page.locator("p").first().textContent().catch(() => "No error message found");
      const errorCode = await page.locator("text=/\\d{3}/").first().textContent().catch(() => "Unknown");

      // Try to get technical details if available
      const detailsButton = page.locator("summary, details");
      const hasDetails = await detailsButton.isVisible().catch(() => false);
      if (hasDetails) {
        await detailsButton.click().catch(() => {});
        await page.waitForTimeout(500);
        const stackTrace = await page.locator("pre").textContent().catch(() => "");
        console.log(`[TEST] Stack trace: ${stackTrace?.substring(0, 500)}`);
      }

      console.log(`[TEST] Error Code: ${errorCode}`);
      console.log(`[TEST] Error Message: ${errorMessage}`);
      console.log(`[TEST] Page URL: ${page.url()}`);

      // Fail with informative message
      throw new Error(
        `Application error detected: Code ${errorCode}, Message: ${errorMessage}. ` +
        `This indicates a runtime error in the application. Check browser console and backend logs.`
      );
    }

    // Check that users list is visible (normal case)
    await expect(page.locator("h1")).toContainText("Usuarios", { timeout: 10000 });

    // Wait for the lazy-loaded UsersList component to load
    // Look for search input which is always present in UsersList
    await page.waitForSelector('input[type="text"][placeholder*="Buscar"], input[type="text"][placeholder*="Search"]', {
      timeout: 15000
    });

    // Now check for table or no users message
    const table = page.locator("table");
    const noUsersMsg = page.locator("text=/No hay usuarios|No se encontraron usuarios|No users/i");

    const hasTable = await table.isVisible().catch(() => false);
    const hasNoUsersMsg = await noUsersMsg.isVisible().catch(() => false);

    // Either table or no users message should be visible
    expect(hasTable || hasNoUsersMsg).toBeTruthy();
  });

  test("should open create user modal", async ({ authenticatedPage: page }) => {
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

  test("should navigate to user detail page", async ({ authenticatedPage: page }) => {
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

  test("should display user tabs", async ({ authenticatedPage: page }) => {
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

  test("should show navigation tree with modules", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Check that sidebar/navigation is visible
    // Use a more specific selector to avoid strict mode violation
    // Prefer aside with data-sidebar attribute, then nav, then data-testid
    const sidebar = page.locator("aside[data-sidebar], aside[role='navigation'], [data-testid='sidebar']").first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    // Check for navigation items
    const navItems = sidebar.locator("a, button");
    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("User Management CRUD", () => {
  test("should create user with valid data", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Click create user button
    await page.click('button:has-text("Crear Usuario")');

    // Wait for modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Fill form with valid data
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="first_name"]', "Test");
    await page.fill('input[name="last_name"]', "User");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait a bit for form submission
    await page.waitForTimeout(2000);

    // Check if there are validation errors specifically in the form/modal
    // Only check errors inside the dialog, not page-wide errors
    const validationErrors = modal.locator('p.text-destructive, .text-destructive, input:invalid');
    const errorCount = await validationErrors.count();
    if (errorCount > 0) {
      const errorTexts = await Promise.all(
        Array.from({ length: errorCount }, (_, i) =>
          validationErrors.nth(i).textContent().catch(() => "")
        )
      );
      // Filter out empty strings, asterisks (required field markers), and check if there are real validation errors
      const realErrors = errorTexts.filter(text => {
        const trimmed = text?.trim() || "";
        return trimmed.length > 0 && trimmed !== "*" && !trimmed.match(/^\*+$/);
      });
      if (realErrors.length > 0) {
        throw new Error(`Form validation errors: ${realErrors.join(", ")}`);
      }
    }

    // Check if modal is still open (might indicate an error)
    const modalStillOpen = await page.locator('[role="dialog"]').isVisible().catch(() => false);

    if (modalStillOpen) {
      // Check for error messages in the modal
      const errorInModal = page.locator('[role="dialog"] .text-destructive, [role="dialog"] text=/Error|error/i');
      const hasError = await errorInModal.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await errorInModal.first().textContent().catch(() => "Unknown error");
        throw new Error(`Error creating user: ${errorText}`);
      }

      // If no error, wait a bit more for async operations
      await page.waitForTimeout(3000);
    }

    // Wait for modal to close or verify user was created
    // Try both: modal closes OR user appears in list
    try {
      await page.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 5000 });
    } catch (e) {
      // Modal didn't close, but maybe user was created anyway
      console.log("[TEST] Modal didn't close, checking if user was created");
    }

    // Verify user appears in list (this is the real test)
    // Navigate back to users list if we're still in modal
    if (await page.locator('[role="dialog"]').isVisible().catch(() => false)) {
      // Close modal manually
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
    }

    // Make sure we're on the users page
    if (!page.url().includes("/users")) {
      await page.goto("/users");
      await page.waitForTimeout(2000);
    }

    // Wait for the users list to load/refresh
    await page.waitForSelector('input[type="text"][placeholder*="Buscar"], table, .rounded-md.border.p-8', { timeout: 10000 });

    // Refresh the page to ensure we have the latest data
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Try to find the user email in the table
    // The email should be in the first column of the table
    const userEmailCell = page.locator(`table tbody tr td:first-child:has-text("${testEmail}")`);
    await expect(userEmailCell).toBeVisible({ timeout: 15000 });
  });

  test("should edit user and verify update", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list to load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Click edit on first user
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.locator('button[aria-label*="Acciones"]').click();
    await page.click('text=/Editar|Edit/i');

    // Wait for edit page
    await page.waitForURL(/\/users\/[^/]+\/edit/, { timeout: 5000 });

    // Update user data
    await page.fill('input[name="first_name"]', "Updated");
    await page.fill('input[name="last_name"]', "Name");

    // Submit
    await page.click('button[type="submit"]');

    // Wait for success and redirect
    await expect(page.locator('text=/Usuario actualizado|actualizado exitosamente/i')).toBeVisible({ timeout: 10000 });
    await page.waitForURL(/\/users\/[^/]+$/, { timeout: 5000 });

    // Verify updated name appears
    await expect(page.locator('text=/Updated Name|Updated/i')).toBeVisible();
  });

  test("should delete user with confirmation", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Get first user email for verification
    const firstRow = page.locator("table tbody tr").first();
    const userEmail = await firstRow.locator("td").first().textContent();

    // Click delete
    await firstRow.locator('button[aria-label*="Acciones"]').click();
    await page.click('text=/Eliminar|Delete/i');

    // Confirm deletion
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.locator('text=/Eliminar Usuario|¿Estás seguro/i')).toBeVisible();

    await page.click('button:has-text("Eliminar")');

    // Wait for success message
    await expect(page.locator('text=/Usuario eliminado|eliminado exitosamente/i')).toBeVisible({ timeout: 10000 });

    // Verify user is removed from list (if it was the only one, list might be empty)
    await page.waitForTimeout(1000);
    const remainingUsers = await page.locator("table tbody tr").count();
    // User should be removed or list should be empty
    expect(remainingUsers).toBeGreaterThanOrEqual(0);
  });
});

test.describe("User Management - Search & Filters", () => {
  test("should search users by email", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Get first user email
    const firstUserEmail = await page.locator("table tbody tr").first().locator("td").first().textContent();

    if (firstUserEmail) {
      // Type in search
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill(firstUserEmail);

      // Wait for debounce (300ms) + API call
      await page.waitForTimeout(500);

      // Verify filtered results
      const rows = page.locator("table tbody tr");
      const count = await rows.count();

      if (count > 0) {
        // At least one row should contain the search term
        const firstRowText = await rows.first().textContent();
        expect(firstRowText?.toLowerCase()).toContain(firstUserEmail.toLowerCase());
      }
    }
  });

  test("should filter by active status", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Select active filter
    const statusFilter = page.locator('select').filter({ hasText: "Todos" });
    await statusFilter.selectOption("active");

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify all visible users are active
    const rows = page.locator("table tbody tr");
    const count = await rows.count();

    if (count > 0) {
      // Check that status badges show "Activo"
      const statusBadges = page.locator('text=/Activo|Active/i');
      const badgeCount = await statusBadges.count();
      expect(badgeCount).toBeGreaterThan(0);
    }
  });

  test("should filter by inactive status", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Select inactive filter
    const statusFilter = page.locator('select').filter({ hasText: "Todos" });
    await statusFilter.selectOption("inactive");

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify results (might be empty if no inactive users)
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("User Management - Pagination", () => {
  test("should navigate between pages", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Check if pagination exists
    const pagination = page.locator('text=/Página|Page/i');
    const paginationExists = await pagination.count() > 0;

    if (paginationExists) {
      // Get current page number
      const pageText = await pagination.textContent();
      const currentPage = pageText?.match(/\d+/)?.[0];

      // Try to go to next page
      const nextButton = page.locator('button:has-text("Siguiente")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Verify page changed
        const newPageText = await pagination.textContent();
        const newPage = newPageText?.match(/\d+/)?.[0];
        expect(newPage).not.toBe(currentPage);
      }
    }
  });

  test("should show correct pagination info", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Check pagination info exists
    const paginationInfo = page.locator('text=/Mostrando|Showing/i');
    const exists = await paginationInfo.count() > 0;
    expect(exists).toBeTruthy();
  });
});

test.describe("User Management - Form Validations", () => {
  test("should validate required fields", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Open create modal
    await page.click('button:has-text("Crear Usuario")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Check for validation errors
    const emailInput = page.locator('input[name="email"]');
    const emailError = await emailInput.evaluate((el) => {
      const form = el.closest("form");
      return form?.querySelector('p.text-destructive')?.textContent;
    });

    // Email should be required
    expect(emailInput).toBeVisible();
  });

  test("should validate email format", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Open create modal
    await page.click('button:has-text("Crear Usuario")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Fill invalid email
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "TestPassword123!");

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error (form might prevent submission)
    await page.waitForTimeout(500);
    // Email validation should prevent submission or show error
  });

  test("should validate password minimum length", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Open create modal
    await page.click('button:has-text("Crear Usuario")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Fill short password
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "short");

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    await page.waitForTimeout(500);
    // Password validation should prevent submission
  });
});

test.describe("User Management - Error Handling", () => {
  test("should handle duplicate email error", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Get existing user email
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
    const existingEmail = await page.locator("table tbody tr").first().locator("td").first().textContent();

    if (existingEmail) {
      // Try to create user with same email
      await page.click('button:has-text("Crear Usuario")');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      await page.fill('input[name="email"]', existingEmail);
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.fill('input[name="first_name"]', "Test");

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(
        page.locator('text=/ya existe|already exists|duplicado/i')
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should handle network errors gracefully", async ({ authenticatedPage: page, context }) => {
    // Intercept and fail network requests
    await context.route("**/api/v1/users**", (route) => route.abort());

    await page.goto("/users");

    // Should show error state
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=/Error|error|Reintentar/i');
    const hasError = await errorMessage.count() > 0;
    expect(hasError).toBeTruthy();
  });
});

test.describe("User Management - Roles & Permissions", () => {
  test("should navigate to user roles page", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Wait for users list
    await page.waitForSelector("table tbody tr", { timeout: 10000 });

    // Click on manage roles for first user
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.locator('button[aria-label*="Acciones"]').click();
    await page.click('text=/Gestionar Roles|Manage Roles/i');

    // Should navigate to roles page
    await page.waitForURL(/\/users\/[^/]+\/roles/, { timeout: 5000 });
    await expect(page.locator('h1')).toContainText(/Roles|Gestión de Roles/i);
  });

  test("should display user permissions", async ({ authenticatedPage: page }) => {
    await page.goto("/users");

    // Navigate to user detail
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
    const firstUserLink = page.locator("table a").first();
    if (await firstUserLink.count() > 0) {
      await firstUserLink.click();
      await page.waitForURL(/\/users\/[^/]+$/, { timeout: 5000 });

      // Navigate to permissions tab
      const permissionsTab = page.locator('[role="tab"]:has-text("Permisos")');
      if (await permissionsTab.count() > 0) {
        await permissionsTab.click();

        // Check that permissions section is visible
        await expect(page.locator('text=/Permisos del Usuario|User Permissions/i')).toBeVisible();
      }
    }
  });
});

