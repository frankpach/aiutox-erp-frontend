/**
 * E2E Tests for General Configuration
 *
 * Tests the complete general configuration flow:
 * - View general configuration
 * - Change timezone
 * - Change date format
 * - Change time format
 * - Change currency
 * - Change language
 * - Verify changes are saved
 *
 * Requires: Backend and Frontend running, config.edit permission
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";

class GeneralConfigPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto("/config/general");
    await this.page.waitForLoadState("networkidle");
  }

  async isOnGeneralPage(): Promise<boolean> {
    return this.page.url().includes("/config/general");
  }

  async getPageTitle(): Promise<string> {
    return this.page.locator("h1").innerText();
  }

  async selectValue(selectTestId: string, value: string) {
    // Click on select trigger
    const selectTrigger = this.page.locator(`[data-testid="${selectTestId}"]`);
    await selectTrigger.click();

    // Wait for select content to appear
    await this.page.waitForTimeout(500);

    // Click on the option
    const option = this.page.locator(`text="${value}"`).first();
    await option.click();

    // Wait for select to close
    await this.page.waitForTimeout(500);
  }

  async clickSaveButton() {
    await this.page.click('button:has-text("Guardar Cambios")');
  }

  async clickResetButton() {
    await this.page.click('button:has-text("Restablecer")');
  }

  async waitForSuccessMessage() {
    // Wait for save button to be enabled again
    const saveButton = this.page.locator('button:has-text("Guardar Cambios")');
    await saveButton.waitFor({ state: "visible", timeout: 15000 });

    // Wait for network requests to complete
    await this.page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {
      // If networkidle doesn't happen, wait a bit more
    });

    // Additional wait to ensure backend has processed
    await this.page.waitForTimeout(3000);
  }

  async getSelectValue(selectTestId: string): Promise<string> {
    const selectTrigger = this.page.locator(`[data-testid="${selectTestId}"]`);
    return await selectTrigger.textContent() || "";
  }
}

test.describe("General Configuration E2E", () => {
  test("should navigate to general configuration page", async ({ authenticatedPage }) => {
    const configPage = new GeneralConfigPage(authenticatedPage);
    await configPage.goto();

    expect(await configPage.isOnGeneralPage()).toBe(true);
    expect(await configPage.getPageTitle()).toContain("Preferencias Generales");
  });

  test("should load current configuration", async ({ authenticatedPage }) => {
    const configPage = new GeneralConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for form to load
    await authenticatedPage.waitForSelector('[data-testid="timezone-select"]', { timeout: 10000 });

    // Verify form fields are present
    expect(await authenticatedPage.locator('[data-testid="timezone-select"]').isVisible()).toBe(true);
    expect(await authenticatedPage.locator('[data-testid="date-format-select"]').isVisible()).toBe(true);
    expect(await authenticatedPage.locator('[data-testid="time-format-select"]').isVisible()).toBe(true);
    expect(await authenticatedPage.locator('[data-testid="currency-select"]').isVisible()).toBe(true);
    expect(await authenticatedPage.locator('[data-testid="language-select"]').isVisible()).toBe(true);
  });

  test("should change timezone and save", async ({ authenticatedPage }) => {
    const configPage = new GeneralConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for form to load
    await authenticatedPage.waitForSelector('[data-testid="timezone-select"]', { timeout: 10000 });

    // Get original value
    const originalValue = await configPage.getSelectValue("timezone-select");

    // Change timezone
    await configPage.selectValue("timezone-select", "America/New_York");

    // Save
    await configPage.clickSaveButton();
    await configPage.waitForSuccessMessage();

    // Verify change persisted
    await configPage.goto();
    await authenticatedPage.waitForSelector('[data-testid="timezone-select"]', { timeout: 10000 });
    const newValue = await configPage.getSelectValue("timezone-select");
    expect(newValue).toContain("America/New_York");

    // Restore original value
    if (originalValue) {
      await configPage.selectValue("timezone-select", originalValue.trim());
      await configPage.clickSaveButton();
      await configPage.waitForSuccessMessage();
    }
  });

  test("should change date format and save", async ({ authenticatedPage }) => {
    const configPage = new GeneralConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for form to load
    await authenticatedPage.waitForSelector('[data-testid="date-format-select"]', { timeout: 10000 });

    // Get original value
    const originalValue = await configPage.getSelectValue("date-format-select");

    // Change date format
    await configPage.selectValue("date-format-select", "YYYY-MM-DD (2025-12-31)");

    // Save
    await configPage.clickSaveButton();
    await configPage.waitForSuccessMessage();

    // Verify change persisted
    await configPage.goto();
    await authenticatedPage.waitForSelector('[data-testid="date-format-select"]', { timeout: 10000 });
    const newValue = await configPage.getSelectValue("date-format-select");
    expect(newValue).toContain("YYYY-MM-DD");

    // Restore original value
    if (originalValue) {
      await configPage.selectValue("date-format-select", originalValue.trim());
      await configPage.clickSaveButton();
      await configPage.waitForSuccessMessage();
    }
  });

  test("should change currency and save", async ({ authenticatedPage }) => {
    const configPage = new GeneralConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for form to load
    await authenticatedPage.waitForSelector('[data-testid="currency-select"]', { timeout: 10000 });

    // Get original value
    const originalValue = await configPage.getSelectValue("currency-select");

    // Change currency (select USD)
    await configPage.selectValue("currency-select", "USD");

    // Save
    await configPage.clickSaveButton();
    await configPage.waitForSuccessMessage();

    // Verify change persisted
    await configPage.goto();
    await authenticatedPage.waitForSelector('[data-testid="currency-select"]', { timeout: 10000 });
    const newValue = await configPage.getSelectValue("currency-select");
    expect(newValue).toContain("USD");

    // Restore original value
    if (originalValue) {
      await configPage.selectValue("currency-select", originalValue.trim());
      await configPage.clickSaveButton();
      await configPage.waitForSuccessMessage();
    }
  });

  test("should disable save button when no changes are made", async ({ authenticatedPage }) => {
    const configPage = new GeneralConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for form to load
    await authenticatedPage.waitForSelector('[data-testid="timezone-select"]', { timeout: 10000 });

    // Save button should be disabled initially
    const saveButton = authenticatedPage.locator('button:has-text("Guardar Cambios")');
    await expect(saveButton).toBeDisabled();
  });

  test("should enable save button when changes are made", async ({ authenticatedPage }) => {
    const configPage = new GeneralConfigPage(authenticatedPage);
    await configPage.goto();

    // Wait for form to load
    await authenticatedPage.waitForSelector('[data-testid="timezone-select"]', { timeout: 10000 });

    // Make a change
    await configPage.selectValue("timezone-select", "America/New_York");

    // Save button should be enabled
    const saveButton = authenticatedPage.locator('button:has-text("Guardar Cambios")');
    await expect(saveButton).toBeEnabled();

    // Reset to disable button again
    await configPage.clickResetButton();
    await authenticatedPage.waitForTimeout(1000);
    await expect(saveButton).toBeDisabled();
  });
});
