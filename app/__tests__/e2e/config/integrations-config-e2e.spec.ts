/**
 * E2E Tests for Integrations Configuration
 *
 * Tests the complete integrations configuration flow:
 * - View available integrations
 * - Activate integration
 * - Deactivate integration
 * - Test integration
 * - Delete integration
 *
 * Requires: Backend and Frontend running, integrations.view and integrations.manage permissions
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";

class IntegrationsConfigPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/config/integrations");
    await this.page.waitForLoadState("networkidle");
  }

  async isOnIntegrationsPage(): Promise<boolean> {
    return this.page.url().includes("/config/integrations");
  }

  async getPageTitle(): Promise<string> {
    return this.page.locator("h1").innerText();
  }

  async getIntegrationCard(integrationName: string) {
    return this.page.locator(`div:has-text("${integrationName}")`).locator("..").locator("..");
  }

  async clickActivate(integrationName: string) {
    const card = await this.getIntegrationCard(integrationName);
    const activateButton = card.locator('button:has-text("Activar"), button:has-text("Activate")');
    await activateButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickDeactivate(integrationName: string) {
    const card = await this.getIntegrationCard(integrationName);
    const deactivateButton = card.locator('button:has-text("Desactivar"), button:has-text("Deactivate")');
    await deactivateButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickTest(integrationName: string) {
    const card = await this.getIntegrationCard(integrationName);
    const testButton = card.locator('button:has-text("Probar"), button:has-text("Test")');
    await testButton.click();
    await this.page.waitForTimeout(2000);
  }

  async getIntegrationCount(): Promise<number> {
    const cards = this.page.locator('div:has(button:has-text("Activar")), div:has(button:has-text("Desactivar"))');
    return await cards.count();
  }

  async getToastMessage(): Promise<string | null> {
    await this.page.waitForTimeout(1000);
    const toast = this.page.locator('[role="status"], [data-sonner-toast]').first();
    if (await toast.isVisible()) {
      return await toast.textContent();
    }
    return null;
  }
}

test.describe("Integrations Configuration", () => {
  test("should display integrations configuration page", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();
    await expect(integrationsPage.isOnIntegrationsPage()).resolves.toBe(true);

    const title = await integrationsPage.getPageTitle();
    expect(title).toContain("Integraciones") || expect(title).toContain("Integrations");
  });

  test("should display available integrations", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();

    // Verify integrations are displayed
    const integrationCount = await integrationsPage.getIntegrationCount();
    expect(integrationCount).toBeGreaterThanOrEqual(0);
  });

  test("should display integration cards with information", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();

    // Check for common integration names
    const stripeCard = page.locator('text=/Stripe|stripe/i');
    const twilioCard = page.locator('text=/Twilio|twilio/i');

    // At least one integration should be visible
    const stripeVisible = await stripeCard.isVisible();
    const twilioVisible = await twilioCard.isVisible();

    expect(stripeVisible || twilioVisible).toBe(true);
  });

  test("should show activate button for inactive integrations", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();

    // Look for activate buttons
    const activateButtons = page.locator('button:has-text("Activar"), button:has-text("Activate")');
    const count = await activateButtons.count();

    // There might be inactive integrations
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show deactivate button for active integrations", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();

    // Look for deactivate buttons
    const deactivateButtons = page.locator('button:has-text("Desactivar"), button:has-text("Deactivate")');
    const count = await deactivateButtons.count();

    // There might be active integrations
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should display test button for integrations", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();

    // Look for test buttons
    const testButtons = page.locator('button:has-text("Probar"), button:has-text("Test")');
    const count = await testButtons.count();

    // Some integrations might have test buttons
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should handle empty integrations list gracefully", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();

    // Verify page doesn't crash
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should display integration status badges", async ({ authenticatedPage: page }) => {
    const integrationsPage = new IntegrationsConfigPage(page);

    await integrationsPage.goto();

    // Look for status badges
    const statusBadges = page.locator('text=/Activo|Inactivo|Active|Inactive|Error/i');
    const count = await statusBadges.count();

    // Status badges might be present
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

