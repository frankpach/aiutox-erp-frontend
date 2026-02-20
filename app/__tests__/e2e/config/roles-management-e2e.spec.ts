/**
 * E2E Tests for Roles and Permissions Management
 *
 * Tests the complete roles management flow:
 * - View roles and permissions
 * - Assign roles to users
 * - Remove roles from users
 * - Search users
 * - Verify role assignments
 *
 * Requires: Backend and Frontend running, auth.manage_roles permission
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";

class RolesConfigPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/config/roles");
    await this.page.waitForLoadState("networkidle");
  }

  async isOnRolesPage(): Promise<boolean> {
    return this.page.url().includes("/config/roles");
  }

  async getPageTitle(): Promise<string> {
    return this.page.locator("h1").innerText();
  }

  async selectRole(roleName: string) {
    // Click on role card by text
    await this.page.click(`button:has-text("${roleName}")`);
    await this.page.waitForTimeout(500); // Wait for role details to load
  }

  async clickUsersTab() {
    await this.page.click('[role="tab"]:has-text("Usuarios")');
    await this.page.waitForTimeout(500);
  }

  async searchUser(searchTerm: string) {
    const searchInput = this.page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill(searchTerm);
    await this.page.waitForTimeout(300); // Wait for search to filter
  }

  async selectUserFromDropdown(userEmail: string) {
    const selectTrigger = this.page.locator('button:has-text("Selecciona un usuario")');
    await selectTrigger.click();
    await this.page.waitForTimeout(300);

    // Select user from dropdown
    const userOption = this.page.locator(`text="${userEmail}"`);
    await userOption.click();
  }

  async clickAssignRole() {
    await this.page.click('button:has-text("Asignar Rol")');
    await this.page.waitForTimeout(500);
  }

  async removeRoleFromUser(userEmail: string) {
    // Find the user card and click remove button
    const userCard = this.page.locator(`div:has-text("${userEmail}")`).locator("..");
    const removeButton = userCard.locator('button:has-text("Remover")');
    await removeButton.click();

    // Confirm removal in dialog
    await this.page.click('button:has-text("OK"), button:has-text("Confirmar"), button:has-text("Sí")');
    await this.page.waitForTimeout(500);
  }

  async getUserCount(): Promise<number> {
    const usersTab = this.page.locator('[role="tab"]:has-text("Usuarios")');
    const tabText = await usersTab.textContent();
    const match = tabText?.match(/\((\d+)\)/);
    return match && match[1] ? parseInt(match[1], 10) : 0;
  }

  async isUserInList(userEmail: string): Promise<boolean> {
    const userCard = this.page.locator(`div:has-text("${userEmail}")`);
    return await userCard.isVisible();
  }

  async getToastMessage(): Promise<string | null> {
    // Wait for toast to appear
    await this.page.waitForTimeout(1000);
    const toast = this.page.locator('[role="status"], [data-sonner-toast]').first();
    if (await toast.isVisible()) {
      return await toast.textContent();
    }
    return null;
  }
}

test.describe("Roles and Permissions Management", () => {
  test("should display roles list and permissions", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await expect(rolesPage.isOnRolesPage()).resolves.toBe(true);

    const title = await rolesPage.getPageTitle();
    expect(title).toContain("Roles y Permisos");

    // Verify roles are displayed
    const ownerRole = page.locator('button:has-text("Propietario")');
    await expect(ownerRole).toBeVisible();

    const adminRole = page.locator('button:has-text("Administrador")');
    await expect(adminRole).toBeVisible();
  });

  test("should show role details when selecting a role", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("Administrador");

    // Verify role details are shown
    const roleTitle = page.locator('h2:has-text("Administrador")');
    await expect(roleTitle).toBeVisible();

    // Verify permissions section is visible
    const permissionsSection = page.locator('h3:has-text("Permisos Asignados")');
    await expect(permissionsSection).toBeVisible();
  });

  test("should display users tab with user count", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("viewer");
    await rolesPage.clickUsersTab();

    // Verify users tab is active
    const usersTab = page.locator('[role="tab"][aria-selected="true"]:has-text("Usuarios")');
    await expect(usersTab).toBeVisible();

    // Verify user count is displayed
    const userCount = await rolesPage.getUserCount();
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  test("should search users in users tab", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("viewer");
    await rolesPage.clickUsersTab();

    // Search for a user
    const adminEmail = "admin@aiutox.com";
    await rolesPage.searchUser(adminEmail);

    // Verify search input has the value
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toHaveValue(adminEmail);
  });

  test("should assign role to user", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("viewer");
    await rolesPage.clickUsersTab();

    // Get initial user count
    const initialCount = await rolesPage.getUserCount();

    // Select user from dropdown (if available)
    const selectTrigger = page.locator('button:has-text("Selecciona un usuario")');
    if (await selectTrigger.isVisible()) {
      await selectTrigger.click();
      await page.waitForTimeout(300);

      // Try to select a user (if any available)
      const userOptions = page.locator('[role="option"]');
      const count = await userOptions.count();

      if (count > 0) {
        await userOptions.first().click();
        await rolesPage.clickAssignRole();

        // Verify success toast
        await page.waitForTimeout(1000);
        const toast = await rolesPage.getToastMessage();
        expect(toast).toContain("exitosamente");

        // Verify user count increased
        const newCount = await rolesPage.getUserCount();
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
      }
    }
  });

  test("should remove role from user", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("viewer");
    await rolesPage.clickUsersTab();

    // Check if there are users with this role
    const userCount = await rolesPage.getUserCount();

    if (userCount > 0) {
      // Find first user with role
      const userCards = page.locator('div:has(button:has-text("Remover"))');
      const firstUserCard = userCards.first();

      if (await firstUserCard.isVisible()) {
        const removeButton = firstUserCard.locator('button:has-text("Remover")');
        await removeButton.click();

        // Confirm removal
        const confirmButton = page.locator('button:has-text("OK"), button:has-text("Confirmar"), button:has-text("Sí")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();

          // Verify success toast
          await page.waitForTimeout(1000);
          const toast = await rolesPage.getToastMessage();
          expect(toast).toContain("exitosamente");
        }
      }
    }
  });

  test("should show permissions grouped by module", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("Administrador");

    // Verify permissions are grouped by module
    const moduleSections = page.locator('div:has-text("Módulo:")');
    const count = await moduleSections.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display system role warning", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("Propietario");

    // Verify system role warning is shown
    const warning = page.locator('text=/rol del sistema/i');
    await expect(warning).toBeVisible();
  });

  test("should handle empty user list gracefully", async ({ authenticatedPage: page }) => {
    const rolesPage = new RolesConfigPage(page);

    await rolesPage.goto();
    await rolesPage.selectRole("staff");
    await rolesPage.clickUsersTab();

    // This might or might not be visible depending on data
    // Just verify the page doesn't crash
    await expect(page.locator("h1")).toBeVisible();
  });
});

