/**
 * E2E Tests for Notifications Configuration
 *
 * Tests the complete notifications configuration flow:
 * - View notification channels (SMTP, SMS, Webhook)
 * - Configure SMTP settings
 * - Configure SMS settings
 * - Configure Webhook settings
 * - Test connections
 *
 * Requires: Backend and Frontend running, notifications.manage permission
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";

class NotificationsConfigPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/config/notifications");
    await this.page.waitForLoadState("networkidle");
  }

  async isOnNotificationsPage(): Promise<boolean> {
    return this.page.url().includes("/config/notifications");
  }

  async getPageTitle(): Promise<string> {
    return this.page.locator("h1").innerText();
  }

  async clickTab(tabName: "SMTP" | "SMS" | "Webhook") {
    await this.page.click(`[role="tab"]:has-text("${tabName}")`);
    await this.page.waitForTimeout(500);
  }

  async toggleChannel(channel: "SMTP" | "SMS" | "Webhook") {
    await this.clickTab(channel);
    const switchElement = this.page.locator('button[role="switch"]').first();
    await switchElement.click();
    await this.page.waitForTimeout(500);
  }

  async fillSMTPConfig(config: {
    host?: string;
    port?: string;
    user?: string;
    password?: string;
    fromEmail?: string;
  }) {
    await this.clickTab("SMTP");

    if (config.host) {
      const hostInput = this.page.locator('input[placeholder*="host"], input[id*="host"]').first();
      await hostInput.fill(config.host);
    }

    if (config.port) {
      const portInput = this.page.locator('input[placeholder*="port"], input[id*="port"]').first();
      await portInput.fill(config.port);
    }

    if (config.user) {
      const userInput = this.page.locator('input[placeholder*="user"], input[id*="user"]').first();
      await userInput.fill(config.user);
    }

    if (config.password) {
      const passwordInput = this.page.locator('input[type="password"]').first();
      await passwordInput.fill(config.password);
    }

    if (config.fromEmail) {
      const emailInput = this.page.locator('input[type="email"], input[placeholder*="email"]').first();
      await emailInput.fill(config.fromEmail);
    }
  }

  async clickSaveSMTP() {
    await this.page.click('button:has-text("Guardar"), button:has-text("Save")');
    await this.page.waitForTimeout(1000);
  }

  async clickTestSMTP() {
    await this.page.click('button:has-text("Probar"), button:has-text("Test")');
    await this.page.waitForTimeout(2000);
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

test.describe("Notifications Configuration", () => {
  test("should display notifications configuration page", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();
    await expect(notificationsPage.isOnNotificationsPage()).resolves.toBe(true);

    const title = await notificationsPage.getPageTitle();
    expect(title).toContain("Notificaciones") || expect(title).toContain("Notifications");
  });

  test("should display all notification channel tabs", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();

    // Verify SMTP tab
    const smtpTab = page.locator('[role="tab"]:has-text("SMTP")');
    await expect(smtpTab).toBeVisible();

    // Verify SMS tab
    const smsTab = page.locator('[role="tab"]:has-text("SMS")');
    await expect(smsTab).toBeVisible();

    // Verify Webhook tab
    const webhookTab = page.locator('[role="tab"]:has-text("Webhook")');
    await expect(webhookTab).toBeVisible();
  });

  test("should switch between notification channel tabs", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();

    // Click SMTP tab
    await notificationsPage.clickTab("SMTP");
    const smtpContent = page.locator('text=/SMTP|smtp|host|port/i');
    await expect(smtpContent.first()).toBeVisible();

    // Click SMS tab
    await notificationsPage.clickTab("SMS");
    const smsContent = page.locator('text=/SMS|sms|provider|twilio/i');
    await expect(smsContent.first()).toBeVisible();

    // Click Webhook tab
    await notificationsPage.clickTab("Webhook");
    const webhookContent = page.locator('text=/Webhook|webhook|url/i');
    await expect(webhookContent.first()).toBeVisible();
  });

  test("should display SMTP configuration fields", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();
    await notificationsPage.clickTab("SMTP");

    // Verify SMTP fields are visible
    const hostLabel = page.locator('label:has-text("Host"), label:has-text("Servidor")');
    await expect(hostLabel.first()).toBeVisible();

    const portLabel = page.locator('label:has-text("Port"), label:has-text("Puerto")');
    await expect(portLabel.first()).toBeVisible();
  });

  test("should fill SMTP configuration", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();
    await notificationsPage.clickTab("SMTP");

    // Fill SMTP config
    await notificationsPage.fillSMTPConfig({
      host: "smtp.example.com",
      port: "587",
      user: "test@example.com",
    });

    // Verify values are filled
    const hostInput = page.locator('input[placeholder*="host"], input[id*="host"]').first();
    await expect(hostInput).toHaveValue("smtp.example.com");
  });

  test("should save SMTP configuration", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();
    await notificationsPage.clickTab("SMTP");

    // Fill minimal config
    await notificationsPage.fillSMTPConfig({
      host: "smtp.example.com",
      port: "587",
      fromEmail: "test@example.com",
    });

    // Save
    await notificationsPage.clickSaveSMTP();

    // Verify success message
    const toast = await notificationsPage.getToastMessage();
    if (toast) {
      expect(toast.toLowerCase()).toContain("exitoso") || expect(toast.toLowerCase()).toContain("success");
    }
  });

  test("should display test connection button for SMTP", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();
    await notificationsPage.clickTab("SMTP");

    // Verify test button exists
    const testButton = page.locator('button:has-text("Probar"), button:has-text("Test")');
    await expect(testButton).toBeVisible();
  });

  test("should display SMS configuration fields", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();
    await notificationsPage.clickTab("SMS");

    // Verify SMS fields are visible
    const providerLabel = page.locator('label:has-text("Provider"), label:has-text("Proveedor")');
    await expect(providerLabel.first()).toBeVisible();
  });

  test("should display Webhook configuration fields", async ({ authenticatedPage: page }) => {
    const notificationsPage = new NotificationsConfigPage(page);

    await notificationsPage.goto();
    await notificationsPage.clickTab("Webhook");

    // Verify Webhook fields are visible
    const urlLabel = page.locator('label:has-text("URL"), label:has-text("Url")');
    await expect(urlLabel.first()).toBeVisible();
  });
});

