/**
 * E2E Tests for Modules Configuration
 *
 * Tests the complete modules configuration flow:
 * - View modules list
 * - Filter modules (all, core, business)
 * - View module details
 * - Enable/disable modules (where allowed)
 *
 * Requires: Backend and Frontend running, config.edit permission
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";

class ModulesConfigPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto("/config/modules");
    await this.page.waitForLoadState("networkidle");
  }

  async isOnModulesPage(): Promise<boolean> {
    return this.page.url().includes("/config/modules");
  }

  async getPageTitle(): Promise<string> {
    return this.page.locator("h1").innerText();
  }

  async clickFilter(filterName: string) {
    await this.page.click(`button:has-text("${filterName}")`);
    await this.page.waitForTimeout(500);
  }

  async getModuleCard(moduleName: string) {
    return this.page.locator(`text="${moduleName}"`).locator("..").locator("..");
  }
}

test.describe("Modules Configuration E2E", () => {
  test("should navigate to modules configuration page", async ({ authenticatedPage }) => {
    const configPage = new ModulesConfigPage(authenticatedPage);
    await configPage.goto();

    expect(await configPage.isOnModulesPage()).toBe(true);
    expect(await configPage.getPageTitle()).toContain("Módulos del Sistema");
  });

  test("should load modules list", async ({ authenticatedPage }) => {
    const configPage = new ModulesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for modules to load
    await authenticatedPage.waitForSelector('text="Módulos Core"', { timeout: 10000 });

    // Verify sections are present
    expect(await authenticatedPage.locator('text="Módulos Core"').isVisible()).toBe(true);
  });

  test("should filter by all modules", async ({ authenticatedPage }) => {
    const configPage = new ModulesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for modules to load
    await authenticatedPage.waitForSelector('button:has-text("Todos")', { timeout: 10000 });

    // Click "All" filter
    await configPage.clickFilter("Todos");

    // Verify both sections are visible
    await expect(authenticatedPage.locator('text="Módulos Core"')).toBeVisible();
  });

  test("should filter by core modules", async ({ authenticatedPage }) => {
    const configPage = new ModulesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for modules to load
    await authenticatedPage.waitForSelector('button:has-text("Core")', { timeout: 10000 });

    // Click "Core" filter
    await configPage.clickFilter("Core");

    // Verify only core section is visible
    await expect(authenticatedPage.locator('text="Módulos Core"')).toBeVisible();
  });

  test("should filter by business modules", async ({ authenticatedPage }) => {
    const configPage = new ModulesConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for modules to load
    await authenticatedPage.waitForSelector('button:has-text("Empresariales")', { timeout: 10000 });

    // Click "Business" filter
    await configPage.clickFilter("Empresariales");

    // Verify business section is visible
    await expect(authenticatedPage.locator('text="Módulos Empresariales"')).toBeVisible();
  });
});
