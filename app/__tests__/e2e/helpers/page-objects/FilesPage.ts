/**
 * Page Object for Files Page
 * Provides helper methods for interacting with the Files page in E2E tests
 */

import type { Page } from "@playwright/test";

export class FilesPage {
  constructor(public readonly page: Page) {}

  /**
   * Navigate to files page
   */
  async goto() {
    await this.page.goto("/files", { waitUntil: "domcontentloaded", timeout: 30000 });
    // Wait for either the page content or an error, but don't wait indefinitely
    try {
      await Promise.race([
        this.page.waitForSelector("h1, h2, table, [data-testid='files-list'], text=No hay archivos", { timeout: 10000 }),
        this.page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {}),
      ]);
    } catch {
      // If neither condition is met, continue anyway - the page might still be usable
    }
  }

  /**
   * Get file count from the list
   */
  async getFileCount(): Promise<number> {
    const rows = await this.page.locator("table tbody tr").count();
    return rows;
  }

  /**
   * Click on upload tab
   */
  async clickUploadTab() {
    const uploadTab = this.page.locator('[role="tab"]:has-text("Subir"), button:has-text("Subir Archivo")').first();
    if (await uploadTab.isVisible()) {
      await uploadTab.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click on list tab
   */
  async clickListTab() {
    const listTab = this.page.locator('[role="tab"]:has-text("Archivos")').first();
    if (await listTab.isVisible()) {
      await listTab.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Upload a file via UI (robusto con múltiples estrategias)
   * @param fileName - Nombre del archivo
   * @param fileContent - Contenido del archivo como string
   * @returns Objeto con success y fileName
   */
  async uploadFileViaUI(
    fileName: string,
    fileContent: string
  ): Promise<{ success: boolean; fileName?: string }> {
    // Asegurarse de estar en la pestaña de subida
    await this.clickUploadTab();
    await this.page.waitForTimeout(1000);

    // Estrategia 1: Buscar input directamente (puede estar oculto)
    let fileInput = this.page.locator('input[type="file"]').first();

    // Estrategia 2: Si no existe, hacer click en botón para activarlo
    if (await fileInput.count() === 0) {
      const selectButton = this.page.locator(
        'button:has-text("Seleccionar"), button:has-text("Select")'
      ).first();
      if (await selectButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await selectButton.click();
        await this.page.waitForTimeout(500);
        fileInput = this.page.locator('input[type="file"]').first();
      }
    }

    // Estrategia 3: Verificar que el componente FileUpload está renderizado
    const uploadComponent = this.page.locator(
      'text=Arrastra archivos, text=Drag and drop'
    ).first();
    const hasUploadComponent = await uploadComponent.isVisible({ timeout: 5000 }).catch(() => false);

    if (await fileInput.count() === 0 && !hasUploadComponent) {
      return { success: false, fileName };
    }

    // Si aún no hay input, esperar un poco más para que se renderice
    if (await fileInput.count() === 0) {
      await this.page.waitForTimeout(2000);
      fileInput = this.page.locator('input[type="file"]').first();
    }

    // Subir archivo usando setInputFiles (funciona incluso si el input está oculto)
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: fileName,
        mimeType: "text/plain",
        buffer: Buffer.from(fileContent),
      });

      // Esperar a que la subida se complete
      await this.waitForUploadComplete();

      // Verificar éxito
      return await this.verifyUploadSuccess(fileName);
    }

    return { success: false, fileName };
  }

  /**
   * Upload a file using file path (legacy method, mantiene compatibilidad)
   */
  async uploadFile(filePath: string) {
    await this.clickUploadTab();
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Wait for upload to complete (robusto con múltiples indicadores)
   */
  private async waitForUploadComplete(): Promise<void> {
    // Esperar a que aparezca el indicador de progreso
    try {
      await this.page.waitForSelector('[role="progressbar"]', { timeout: 5000 });
      // Esperar a que desaparezca (significa que terminó)
      await this.page.waitForSelector('[role="progressbar"]', {
        state: 'hidden',
        timeout: 20000
      });
    } catch {
      // Si no hay progreso visible, esperar tiempo fijo
      await this.page.waitForTimeout(3000);
    }

    // Esperar tiempo adicional para que la subida se complete completamente
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify upload success (múltiples métodos de verificación)
   */
  private async verifyUploadSuccess(fileName: string): Promise<{ success: boolean; fileName: string }> {
    // Método 1: Buscar mensaje de éxito o toast
    const successSelectors = [
      'text=/Archivo subido exitosamente/i',
      'text=/uploaded successfully/i',
      '[role="status"]',
      '[data-testid="toast"]',
    ];

    for (const selector of successSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent().catch(() => "");
        if (text && (/subido|uploaded|success/i.test(text))) {
          return { success: true, fileName };
        }
      }
    }

    // Método 2: Verificar en lista (más confiable)
    await this.clickListTab();
    await this.page.waitForTimeout(2000);

    // Esperar a que la lista se actualice
    await this.page.waitForSelector("table tbody", { timeout: 5000 }).catch(() => {});
    await this.page.waitForTimeout(1000);

    const fileInList = await this.page
      .locator(`table tbody tr:has-text("${fileName}")`)
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    return { success: fileInList, fileName };
  }

  /**
   * Search for files
   */
  async searchFiles(searchTerm: string) {
    const searchInput = this.page.locator('input[placeholder*="Buscar"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(searchTerm);
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click on a file by name
   */
  async clickFileByName(fileName: string) {
    const fileRow = this.page.locator(`table tbody tr:has-text("${fileName}")`).first();
    if (await fileRow.isVisible()) {
      const viewButton = fileRow.locator('button:has-text("Ver")').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();
      } else {
        await fileRow.click();
      }
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Download a file by name
   */
  async downloadFile(fileName: string) {
    const fileRow = this.page.locator(`table tbody tr:has-text("${fileName}")`).first();
    if (await fileRow.isVisible()) {
      const downloadButton = fileRow.locator('button:has-text("Descargar")').first();
      if (await downloadButton.isVisible()) {
        const downloadPromise = this.page.waitForEvent("download", { timeout: 10000 });
        await downloadButton.click();
        return await downloadPromise;
      }
    }
    return null;
  }

  /**
   * Delete a file by name
   */
  async deleteFile(fileName: string, confirm: boolean = true) {
    const fileRow = this.page.locator(`table tbody tr:has-text("${fileName}")`).first();
    if (await fileRow.isVisible()) {
      const deleteButton = fileRow.locator('button:has-text("Eliminar")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await this.page.waitForTimeout(500);

        if (confirm) {
          const confirmButton = this.page.locator('button:has-text("Confirmar")').first();
          if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click();
            await this.page.waitForTimeout(2000);
          }
        }
      }
    }
  }

  /**
   * Wait for file to appear in list
   */
  async waitForFileToAppear(fileName: string, timeout: number = 10000) {
    await this.page.waitForSelector(`table tbody tr:has-text("${fileName}")`, { timeout });
  }

  /**
   * Wait for file to disappear from list
   */
  async waitForFileToDisappear(fileName: string, timeout: number = 10000) {
    await this.page.waitForSelector(`table tbody tr:has-text("${fileName}")`, { state: "hidden", timeout });
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.page.locator("text=No hay archivos").isVisible().catch(() => false);
  }

  /**
   * Get all file names from the list
   */
  async getFileNames(): Promise<string[]> {
    const rows = this.page.locator("table tbody tr");
    const count = await rows.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const name = await rows.nth(i).locator("td").first().textContent();
      if (name) {
        names.push(name.trim());
      }
    }

    return names;
  }
}


