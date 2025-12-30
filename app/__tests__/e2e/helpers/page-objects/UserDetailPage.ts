/**
 * UserDetailPage - Page Object Model for User Detail Page
 */

import { Page, Locator } from "@playwright/test";

export class UserDetailPage {
  readonly page: Page;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly backButton: Locator;
  readonly tabs: {
    general: Locator;
    organizations: Locator;
    contactMethods: Locator;
    roles: Locator;
    permissions: Locator;
  };

  constructor(page: Page) {
    this.page = page;
    this.editButton = page.locator('button:has-text("Editar")');
    this.deleteButton = page.locator('button:has-text("Eliminar")');
    this.backButton = page.locator('button:has-text("Volver")');

    this.tabs = {
      general: page.locator('[role="tab"]:has-text("General")'),
      organizations: page.locator('[role="tab"]:has-text("Organizaciones")'),
      contactMethods: page.locator('[role="tab"]:has-text("Métodos de Contacto")'),
      roles: page.locator('[role="tab"]:has-text("Roles")'),
      permissions: page.locator('[role="tab"]:has-text("Permisos")'),
    };
  }

  async goto(userId: string) {
    await this.page.goto(`/users/${userId}`);
    // Wait for page to load, but with a reasonable timeout
    await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    // Wait a bit for React to hydrate
    await this.page.waitForTimeout(1000);
  }

  async clickEdit() {
    await this.editButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async clickDelete() {
    await this.deleteButton.click();
  }

  async confirmDelete() {
    // Wait for confirmation dialog
    await this.page.waitForSelector('text=¿Estás seguro', { timeout: 5000 });
    // Click confirm button in dialog
    await this.page.click('button:has-text("Eliminar"):not(:has-text("Eliminar Usuario"))');
    await this.page.waitForLoadState("networkidle");
  }

  async fillUserForm(data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string; // Para compatibilidad, dividir en first_name y last_name
    job_title?: string;
    department?: string;
  }) {
    // Wait for form to be visible
    await this.page.waitForSelector('form', { timeout: 10000 });
    await this.page.waitForTimeout(500);

    if (data.email) {
      await this.page.fill('input[name="email"]', data.email);
    }

    // Si se proporciona full_name, dividirlo en first_name y last_name
    if (data.full_name) {
      const parts = data.full_name.split(' ');
      if (parts.length > 0) {
        await this.page.fill('input[name="first_name"]', parts[0]);
      }
      if (parts.length > 1) {
        await this.page.fill('input[name="last_name"]', parts.slice(1).join(' '));
      }
    } else {
      if (data.first_name) {
        await this.page.fill('input[name="first_name"]', data.first_name);
      }
      if (data.last_name) {
        await this.page.fill('input[name="last_name"]', data.last_name);
      }
    }

    if (data.job_title) {
      await this.page.fill('input[name="job_title"]', data.job_title).catch(() => {
        // job_title puede no estar presente
        console.log("[UserDetailPage] job_title field not found");
      });
    }
    if (data.department) {
      await this.page.fill('input[name="department"]', data.department).catch(() => {
        // department puede no estar presente
        console.log("[UserDetailPage] department field not found");
      });
    }
  }

  async saveUserForm() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState("networkidle");
  }

  async switchTab(tabName: "general" | "organizations" | "contactMethods" | "roles" | "permissions") {
    await this.tabs[tabName].click();
    await this.page.waitForLoadState("networkidle");
  }

  async getUserEmail(): Promise<string | null> {
    const emailElement = await this.page.locator('text=/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/').first();
    return await emailElement.textContent();
  }
}







