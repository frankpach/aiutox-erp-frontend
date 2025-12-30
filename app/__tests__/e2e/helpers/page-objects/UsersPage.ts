/**
 * UsersPage - Page Object Model for Users Management Page
 */

import { Page, Locator } from "@playwright/test";

export class UsersPage {
  readonly page: Page;
  readonly createUserButton: Locator;
  readonly searchInput: Locator;
  readonly usersTable: Locator;
  readonly filterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createUserButton = page.locator('button:has-text("Crear Usuario")');
    this.searchInput = page.locator('input[placeholder*="Buscar"]');
    this.usersTable = page.locator("table");
    this.filterButton = page.locator('button:has-text("Filtros")');
  }

  async goto() {
    await this.page.goto("/users");
    await this.page.waitForLoadState("networkidle");
    // Wait for table to load
    await this.usersTable.waitFor({ timeout: 10000 });
  }

  async clickCreateUser() {
    await this.createUserButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async searchUser(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForLoadState("networkidle");
  }

  async getUserRowByEmail(email: string): Promise<Locator> {
    return this.page.locator(`table tr:has-text("${email}")`);
  }

  async clickUserByEmail(email: string) {
    const row = await this.getUserRowByEmail(email);
    await row.click();
    await this.page.waitForURL(/\/users\/[^/]+$/, { timeout: 5000 });
  }

  async getUserCount(): Promise<number> {
    const rows = await this.page.locator("table tbody tr").count();
    return rows;
  }

  async waitForUserToAppear(email: string, timeout = 10000) {
    await this.page.waitForSelector(`text=${email}`, { timeout });
  }

  async waitForUserToDisappear(email: string, timeout = 10000) {
    await this.page.waitForSelector(`text=${email}`, { state: "hidden", timeout });
  }
}















