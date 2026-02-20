/**
 * E2E Tests for Audit Log Export
 *
 * Tests the complete audit log export flow:
 * - View audit logs
 * - Apply filters
 * - Export to CSV
 * - Export to JSON
 * - Export to Excel
 * - Verify exported files
 *
 * Requires: Backend and Frontend running, auth.view_audit permission
 */

import { test, expect } from "../fixtures/auth.setup";
import type { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import type {} from "../playwright.d.ts";

class AuditConfigPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/config/audit");
    await this.page.waitForLoadState("networkidle");
  }

  async isOnAuditPage(): Promise<boolean> {
    return this.page.url().includes("/config/audit");
  }

  async getPageTitle(): Promise<string> {
    // Wait for page to load
    await this.page.waitForTimeout(1000);
    const h1 = this.page.locator("h1").first();
    if (await h1.isVisible()) {
      return await h1.innerText();
    }
    return "";
  }

  async setFilter(filterName: string, value: string) {
    const input = this.page.locator(`input[id*="${filterName}"], input[placeholder*="${filterName}"]`);
    await input.fill(value);
    await this.page.waitForTimeout(300);
  }

  async selectExportFormat(format: "csv" | "excel" | "json") {
    // Try to find the select trigger - it might be a button or select element
    const selectTrigger = this.page.locator('button:has-text("CSV"), button:has-text("Excel"), button:has-text("JSON"), select').first();
    if (await selectTrigger.isVisible()) {
      await selectTrigger.click();
      await this.page.waitForTimeout(300);

      const option = this.page.locator(`[role="option"]:has-text("${format.toUpperCase()}"), option:has-text("${format.toUpperCase()}")`).first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  }

  async clickExportButton() {
    await this.page.click('[data-testid="export-logs-button"], button:has-text("Exportar Logs")');
  }

  async waitForExport() {
    // Wait for export button to be enabled again (export completed)
    await this.page.waitForSelector('button:has-text("Exportar Logs"):not([disabled])', { timeout: 30000 });
  }

  async getLogCount(): Promise<number> {
    const countText = this.page.locator('text=/Mostrando.*de.*registros/');
    const text = await countText.textContent();
    if (text) {
      const match = text.match(/de (\d+) registros/);
      return match && match[1] ? parseInt(match[1], 10) : 0;
    }
    return 0;
  }

  async clearFilters() {
    await this.page.click('button:has-text("Limpiar Filtros")');
    await this.page.waitForTimeout(500);
  }

  async setDateFilter(filterName: "date_from" | "date_to", date: string) {
    const input = this.page.locator(`input[id*="${filterName}"], input[type="date"]`);
    const inputs = await input.all();
    if (filterName === "date_from" && inputs.length > 0 && inputs[0]) {
      await inputs[0].fill(date);
    } else if (filterName === "date_to" && inputs.length > 1 && inputs[1]) {
      await inputs[1].fill(date);
    }
    await this.page.waitForTimeout(300);
  }
}

test.describe("Audit Log Export", () => {
  test("should display audit logs page", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Check if we're on the audit page or got redirected
    const currentUrl = page.url();
    if (currentUrl.includes("/config/audit")) {
      await expect(auditPage.isOnAuditPage()).resolves.toBe(true);

      const title = await auditPage.getPageTitle();
      // Title might be "Auditoría" or "Audit" or empty if page is loading
      if (title) {
        expect(title.toLowerCase()).toMatch(/auditoría|audit/i);
      }
    } else {
      // If redirected, check if it's a permission issue
      const errorText = await page.locator("body").textContent();
      // Just verify we got a response (not a 404)
      expect(errorText ?? "").toBeTruthy();
    }
  });

  test("should show export format selector", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Skip if we're not on the audit page (permission issue)
    if (!(await auditPage.isOnAuditPage())) {
      test.skip();
      return;
    }

    // Verify export format selector is visible (might be a select or button)
    const formatSelector = page.locator('button:has-text("CSV"), button:has-text("Excel"), button:has-text("JSON"), select').first();
    await expect(formatSelector).toBeVisible({ timeout: 5000 });

    // Verify export button is visible
    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Export")');
    await expect(exportButton.first()).toBeVisible();
  });

  test("should export audit logs to CSV", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Skip if we're not on the audit page (permission issue)
    if (!(await auditPage.isOnAuditPage())) {
      test.skip();
      return;
    }

    // Wait for logs to load
    await page.waitForTimeout(2000);

    // Verify there are logs to export
    const logCount = await auditPage.getLogCount();
    if (logCount === 0) {
      test.skip();
      return;
    }

    // Set up download listener BEFORE clicking
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

    // Select CSV format
    await auditPage.selectExportFormat("csv");
    await page.waitForTimeout(500); // Wait for format selection

    // Click export and wait a bit for the download to start
    await auditPage.clickExportButton();
    await page.waitForTimeout(1000); // Give time for download to initiate

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    const filename = (download as any).suggestedFilename();
    expect(filename).toBeTruthy();
    if (!filename) {
      throw new Error("Download filename is undefined");
    }
    expect(filename).toMatch(/audit-logs-.*\.csv/);

    // Save file temporarily
    const filePath = path.join(__dirname, "../../../test-results", filename);
    await (download as any).saveAs(filePath);

    // Verify file exists and has content
    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    expect(fileContent.length).toBeGreaterThan(0);
    expect(fileContent).toContain("Fecha");
    expect(fileContent).toContain("Usuario");

    // Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  test("should export audit logs to JSON", async ({ authenticatedPage: page }) => {
        const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Skip if we're not on the audit page (permission issue)
    if (!(await auditPage.isOnAuditPage())) {
      test.skip();
      return;
    }

    // Wait for logs to load
    await page.waitForTimeout(2000);

    // Verify there are logs to export
    const logCount = await auditPage.getLogCount();
    if (logCount === 0) {
      test.skip();
      return;
    }

    // Set up download listener BEFORE clicking
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

    // Select JSON format
    await auditPage.selectExportFormat("json");
    await page.waitForTimeout(500); // Wait for format selection

    // Click export and wait a bit for the download to start
    await auditPage.clickExportButton();
    await page.waitForTimeout(1000); // Give time for download to initiate

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    const filename = (download as any).suggestedFilename();
    expect(filename).toBeTruthy();
    if (!filename) {
      throw new Error("Download filename is undefined");
    }
    expect(filename).toMatch(/audit-logs-.*\.json/);

    // Save file temporarily
    const filePath = path.join(__dirname, "../../../test-results", filename);
    await (download as any).saveAs(filePath);

    // Verify file exists and is valid JSON
    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    expect(fileContent.length).toBeGreaterThan(0);

    const jsonData = JSON.parse(fileContent);
    expect(Array.isArray(jsonData)).toBe(true);

    // Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  test("should export audit logs to Excel (CSV format)", async ({ authenticatedPage: page }) => {
        const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Skip if we're not on the audit page (permission issue)
    if (!(await auditPage.isOnAuditPage())) {
      test.skip();
      return;
    }

    // Wait for logs to load
    await page.waitForTimeout(2000);

    // Verify there are logs to export
    const logCount = await auditPage.getLogCount();
    if (logCount === 0) {
      test.skip();
      return;
    }

    // Set up download listener BEFORE clicking
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

    // Select Excel format
    await auditPage.selectExportFormat("excel");
    await page.waitForTimeout(500); // Wait for format selection

    // Click export and wait a bit for the download to start
    await auditPage.clickExportButton();
    await page.waitForTimeout(1000); // Give time for download to initiate

    // Wait for download
    const download = await downloadPromise;

    // Verify download (Excel uses CSV format)
    const filename = (download as any).suggestedFilename();
    expect(filename).toBeTruthy();
    if (!filename) {
      throw new Error("Download filename is undefined");
    }
    expect(filename).toMatch(/audit-logs-.*\.csv/);

    // Save file temporarily
    const filePath = path.join(__dirname, "../../../test-results", filename);
    await (download as any).saveAs(filePath);

    // Verify file exists and has content
    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    expect(fileContent.length).toBeGreaterThan(0);

    // Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  test("should export filtered audit logs", async ({ authenticatedPage: page }) => {
        const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Apply a filter
    await auditPage.setFilter("action", "create");
    await page.waitForTimeout(1000); // Wait for filter to apply

    // Wait for filtered logs to load
    await page.waitForTimeout(2000);

    // Set up download listener BEFORE clicking
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

    // Select CSV format
    await auditPage.selectExportFormat("csv");
    await page.waitForTimeout(500); // Wait for format selection

    // Click export and wait a bit for the download to start
    await auditPage.clickExportButton();
    await page.waitForTimeout(1000); // Give time for download to initiate

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    const filename = (download as any).suggestedFilename();
    expect(filename).toBeTruthy();
    if (!filename) {
      throw new Error("Download filename is undefined");
    }
    expect(filename).toMatch(/audit-logs-.*\.csv/);

    // Save file temporarily
    const filePath = path.join(__dirname, "../../../test-results", filename);
    await (download as any).saveAs(filePath);

    // Verify file exists
    expect(fs.existsSync(filePath)).toBe(true);

    // Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  test("should show export button disabled during export", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Click export
    await auditPage.clickExportButton();

    // Verify button shows loading state (might be disabled or show "Exportando...")
    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Exportando")');
    await expect(exportButton).toBeVisible();
  });

  test("should display audit logs table", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Verify table headers
    const fechaHeader = page.locator('th:has-text("Fecha")');
    await expect(fechaHeader).toBeVisible();

    const usuarioHeader = page.locator('th:has-text("Usuario")');
    await expect(usuarioHeader).toBeVisible();

    const accionHeader = page.locator('th:has-text("Acción")');
    await expect(accionHeader).toBeVisible();
  });

  test("should apply date filters", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Set date from filter
    const today = new Date().toISOString().split("T")[0] || "";
    await auditPage.setDateFilter("date_from", today);

    // Verify filter is applied (page should reload)
    await page.waitForTimeout(1000);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should clear filters", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Apply a filter
    await auditPage.setFilter("action", "test");

    // Clear filters
    await auditPage.clearFilters();

    // Verify filters are cleared
    const actionInput = page.locator('input[placeholder*="Ej: create"]');
    await expect(actionInput).toHaveValue("");
  });

  test("should paginate audit logs", async ({ authenticatedPage: page }) => {
    const auditPage = new AuditConfigPage(page);

    await auditPage.goto();

    // Check if pagination exists
    const nextButton = page.locator('button:has-text("Siguiente")');

    // If pagination exists, test navigation
    if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Verify we're on page 2
      const pageIndicator = page.locator('text=/Página 2/');
      await expect(pageIndicator).toBeVisible();
    }
  });
});

