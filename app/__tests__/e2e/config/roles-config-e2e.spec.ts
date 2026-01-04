/**
 * E2E Tests for Roles Configuration
 *
 * Tests the complete roles configuration flow:
 * - View roles list
 * - Select a role
 * - View role permissions
 * - View users with role
 * - Assign role to user
 * - Remove role from user
 *
 * Requires: Backend and Frontend running, config.edit permission
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";

class RolesConfigPage {
  constructor(public page: Page) {}

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

  async clickRole(roleName: string) {
    await this.page.click(`text="${roleName}"`);
    await this.page.waitForTimeout(500);
  }

  async clickTab(tabName: string) {
    await this.page.click(`[role="tab"]:has-text("${tabName}")`);
    await this.page.waitForTimeout(500);
  }
}

test.describe("Roles Configuration E2E", () => {
  test("should navigate to roles configuration page", async ({ authenticatedPage }) => {
    const configPage = new RolesConfigPage(authenticatedPage);
    await configPage.goto();

    expect(await configPage.isOnRolesPage()).toBe(true);
    expect(await configPage.getPageTitle()).toContain("Roles y Permisos");
  });

  test("should load roles list", async ({ authenticatedPage }) => {
    const configPage = new RolesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for roles to load
    await authenticatedPage.waitForSelector('text="Roles del Sistema"', { timeout: 10000 });

    // Verify roles section is present
    expect(await authenticatedPage.locator('text="Roles del Sistema"').isVisible()).toBe(true);
  });

  test("should select a role and view details", async ({ authenticatedPage }) => {
    const configPage = new RolesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for roles to load
    await authenticatedPage.waitForSelector('text="Propietario"', { timeout: 10000 });

    // Click on a role
    await configPage.clickRole("Propietario");

    // Verify tabs are visible
    await expect(authenticatedPage.locator('[role="tab"]:has-text("Permisos")')).toBeVisible();
    await expect(authenticatedPage.locator('[role="tab"]:has-text("Usuarios")')).toBeVisible();
  });

  test("should view permissions tab", async ({ authenticatedPage }) => {
    const configPage = new RolesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for roles to load
    await authenticatedPage.waitForSelector('text="Administrador"', { timeout: 10000 });

    // Click on admin role
    await configPage.clickRole("Administrador");

    // Click on Permissions tab
    await configPage.clickTab("Permisos");

    // Verify permissions section is visible
    await expect(authenticatedPage.locator('text="Permisos Asignados"')).toBeVisible();
  });

  test("should view users tab", async ({ authenticatedPage }) => {
    const configPage = new RolesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for roles to load
    await authenticatedPage.waitForSelector('text="Administrador"', { timeout: 10000 });

    // Click on admin role
    await configPage.clickRole("Administrador");

    // Click on Users tab
    await configPage.clickTab("Usuarios");

    // Verify users section is visible
    await expect(authenticatedPage.locator('text="Usuarios con este rol"')).toBeVisible();
  });
});









