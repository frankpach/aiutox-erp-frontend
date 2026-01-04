/**
 * LoginPage - Page Object Model for Login Page
 */

import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]').or(page.locator('.error'));
  }

  async goto() {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    // Wait for navigation or error
    await this.page.waitForLoadState("networkidle");
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForURL(/\/users|\/dashboard/, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async hasError(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}





















