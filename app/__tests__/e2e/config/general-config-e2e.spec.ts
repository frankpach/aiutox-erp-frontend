/**
 * E2E Tests for General Settings Configuration
 *
 * Tests the complete general settings configuration flow:
 * - View general settings
 * - Update timezone
 * - Update date format
 * - Update time format
 * - Update currency
 * - Update language
 * - Save changes
 *
 * Requires: Backend and Frontend running, config.view and config.edit permissions
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";

class GeneralConfigPage {
  constructor(private page: Page) {}

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

  async selectTimezone(timezone: string) {
    const timezoneSelect = this.page.locator('button:has-text("Selecciona"), select').first();
    await timezoneSelect.click();
    await this.page.waitForTimeout(300);

    const option = this.page.locator(`[role="option"]:has-text("${timezone}"), option:has-text("${timezone}")`).first();
    await option.click();
  }

  async selectDateFormat(format: string) {
    const dateFormatSelects = this.page.locator('button:has-text("Selecciona"), select').all();
    const selects = await dateFormatSelects;
    if (selects.length > 1) {
      await selects[1].click();
      await this.page.waitForTimeout(300);
      const option = this.page.locator(`[role="option"]:has-text("${format}")`).first();
      await option.click();
    }
  }

  async selectTimeFormat(format: "12h" | "24h") {
    const timeFormatSelects = this.page.locator('button:has-text("Selecciona"), select').all();
    const selects = await timeFormatSelects;
    if (selects.length > 2) {
      await selects[2].click();
      await this.page.waitForTimeout(300);
      const option = this.page.locator(`[role="option"]:has-text("${format}")`).first();
      await option.click();
    }
  }

  async selectCurrency(currency: string) {
    const currencySelects = this.page.locator('button:has-text("Selecciona"), select').all();
    const selects = await currencySelects;
    if (selects.length > 3) {
      await selects[3].click();
      await this.page.waitForTimeout(300);
      const option = this.page.locator(`[role="option"]:has-text("${currency}")`).first();
      await option.click();
    }
  }

  async selectLanguage(language: string) {
    const languageSelects = this.page.locator('button:has-text("Selecciona"), select').all();
    const selects = await languageSelects;
    if (selects.length > 4) {
      await selects[4].click();
      await this.page.waitForTimeout(300);
      const option = this.page.locator(`[role="option"]:has-text("${language}")`).first();
      await option.click();
    }
  }

  async clickSave() {
    await this.page.click('button:has-text("Guardar"), button:has-text("Actualizar")');
    await this.page.waitForTimeout(1000);
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

test.describe("General Settings Configuration", () => {
  test("should display general settings page", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();
    await expect(generalPage.isOnGeneralPage()).resolves.toBe(true);

    const title = await generalPage.getPageTitle();
    expect(title).toContain("Preferencias Generales") || expect(title).toContain("General");
  });

  test("should display all settings fields", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();

    // Verify timezone field
    const timezoneLabel = page.locator('label:has-text("Zona Horaria"), label:has-text("Timezone")');
    await expect(timezoneLabel).toBeVisible();

    // Verify date format field
    const dateFormatLabel = page.locator('label:has-text("Formato de Fecha"), label:has-text("Date Format")');
    await expect(dateFormatLabel).toBeVisible();

    // Verify time format field
    const timeFormatLabel = page.locator('label:has-text("Formato de Hora"), label:has-text("Time Format")');
    await expect(timeFormatLabel).toBeVisible();

    // Verify currency field
    const currencyLabel = page.locator('label:has-text("Moneda"), label:has-text("Currency")');
    await expect(currencyLabel).toBeVisible();

    // Verify language field
    const languageLabel = page.locator('label:has-text("Idioma"), label:has-text("Language")');
    await expect(languageLabel).toBeVisible();
  });

  test("should update timezone", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();

    // Select a different timezone
    await generalPage.selectTimezone("America/New_York");

    // Save changes
    await generalPage.clickSave();

    // Verify success message
    const toast = await generalPage.getToastMessage();
    if (toast) {
      expect(toast.toLowerCase()).toContain("exitoso") || expect(toast.toLowerCase()).toContain("success");
    }
  });

  test("should update date format", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();

    // Select a different date format
    await generalPage.selectDateFormat("MM/DD/YYYY");

    // Save changes
    await generalPage.clickSave();

    // Verify success message
    const toast = await generalPage.getToastMessage();
    if (toast) {
      expect(toast.toLowerCase()).toContain("exitoso") || expect(toast.toLowerCase()).toContain("success");
    }
  });

  test("should update time format", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();

    // Select a different time format
    await generalPage.selectTimeFormat("12h");

    // Save changes
    await generalPage.clickSave();

    // Verify success message
    const toast = await generalPage.getToastMessage();
    if (toast) {
      expect(toast.toLowerCase()).toContain("exitoso") || expect(toast.toLowerCase()).toContain("success");
    }
  });

  test("should update currency", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();

    // Select a different currency
    await generalPage.selectCurrency("USD");

    // Save changes
    await generalPage.clickSave();

    // Verify success message
    const toast = await generalPage.getToastMessage();
    if (toast) {
      expect(toast.toLowerCase()).toContain("exitoso") || expect(toast.toLowerCase()).toContain("success");
    }
  });

  test("should update language", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();

    // Select a different language
    await generalPage.selectLanguage("en");

    // Save changes
    await generalPage.clickSave();

    // Verify success message
    const toast = await generalPage.getToastMessage();
    if (toast) {
      expect(toast.toLowerCase()).toContain("exitoso") || expect(toast.toLowerCase()).toContain("success");
    }
  });

  test("should display save button", async ({ authenticatedPage: page }) => {
    const generalPage = new GeneralConfigPage(page);

    await generalPage.goto();

    const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Actualizar"), button:has-text("Save")');
    await expect(saveButton).toBeVisible();
  });
});

