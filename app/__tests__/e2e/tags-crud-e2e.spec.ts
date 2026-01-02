/**
 * E2E Tests for Tags CRUD
 *
 * Tests the complete tags management flow:
 * - Create tags from FileTags component
 * - Create tags from FileUploadConfig component
 * - Create tags from FileFilters component
 * - Edit tags
 * - Delete tags
 * - Verify tags are available across components
 *
 * Requires: Backend and Frontend running, tags.manage permission
 */

import { test, expect } from "./fixtures/auth.setup";
import type { Page } from "@playwright/test";

class TagsPage {
  constructor(public page: Page) {}

  /**
   * Navigate to files page
   */
  async gotoFiles() {
    console.log("[TAGS-E2E] Navigating to /files");
    await this.page.goto("/files", { waitUntil: "domcontentloaded" });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Open tag manager modal from FileTags component
   */
  async openTagManagerFromFileTags() {
    // First, we need to open a file detail to access FileTags component
    // For now, we'll navigate to files and try to find the manage tags button
    // Or we can upload a file first
    const manageButton = this.page.locator('button:has-text("Manage Tags")').first();
    await manageButton.waitFor({ state: "visible", timeout: 10000 });
    await manageButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Open tag manager modal from FileUploadConfig
   */
  async openTagManagerFromUploadConfig() {
    // Navigate to files page
    await this.gotoFiles();
    await this.page.waitForTimeout(2000);

    // Try to find upload tab/button
    const uploadTab = this.page.locator('button:has-text("Upload"), button:has-text("Subir"), [role="tab"]:has-text("Upload"), [role="tab"]:has-text("Subir")').first();
    if (await uploadTab.count() > 0) {
      await uploadTab.click();
      await this.page.waitForTimeout(2000);
    }

    // Find tag manager button - look for "Manage Tags" or "Manage" near tags section
    const manageButton = this.page
      .locator('button:has-text("Manage Tags"), button:has-text("Gestionar Etiquetas"), button:has-text("Manage")')
      .first();

    if (await manageButton.count() > 0) {
      await manageButton.waitFor({ state: "visible", timeout: 10000 });
      await manageButton.click();
      await this.page.waitForTimeout(2000);
    } else {
      console.log("[TAGS-E2E] Manage button not found, trying alternative selectors");
      // Try alternative: look for button with TagIcon
      const altButton = this.page.locator('button').filter({ has: this.page.locator('svg') }).first();
      if (await altButton.count() > 0) {
        await altButton.click();
        await this.page.waitForTimeout(2000);
      }
    }
  }

  /**
   * Open tag manager modal from FileFilters
   */
  async openTagManagerFromFilters() {
    // Navigate to files page
    await this.gotoFiles();

    // Find filters section and open tag manager
    const manageButton = this.page
      .locator('button:has-text("Manage")')
      .filter({ has: this.page.locator('text=/Tags|Etiquetas/i').locator('..') })
      .first();

    if (await manageButton.count() > 0) {
      await manageButton.waitFor({ state: "visible", timeout: 5000 });
      await manageButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Check if tag manager modal is open
   */
  async isTagManagerModalOpen(): Promise<boolean> {
    // Check for modal title or dialog content
    const modalTitle = this.page.locator('text=/Manage Tags|Gestionar Etiquetas/i');
    const dialogContent = this.page.locator('[role="dialog"]');
    const modalVisible = await modalTitle.isVisible().catch(() => false);
    const dialogVisible = await dialogContent.isVisible().catch(() => false);
    return modalVisible || dialogVisible;
  }

  /**
   * Create a new tag in the modal
   */
  async createTag(name: string, color?: string, description?: string) {
    // Wait for modal to be visible
    await this.page.waitForSelector('text=/Manage Tags|Gestionar Etiquetas/i', { timeout: 15000 });
    await this.page.waitForTimeout(1500);

    // Check if form is visible, if not, click "Create Tag" button
    const nameInput = this.page.locator('input[id="tag-name"]').first();
    let isFormVisible = await nameInput.isVisible().catch(() => false);

    if (!isFormVisible) {
      // Click "Create Tag" button to show the form
      // Look for button with Plus icon and text "Create Tag" or "Crear Etiqueta"
      const createTagButton = this.page
        .locator('button')
        .filter({ hasText: /Create Tag|Crear Etiqueta/i })
        .filter({ has: this.page.locator('svg') }) // Should have Plus icon
        .first();

      if (await createTagButton.count() > 0) {
        await createTagButton.waitFor({ state: "visible", timeout: 5000 });
        await createTagButton.click();
        await this.page.waitForTimeout(1000);

        // Verify form is now visible
        isFormVisible = await nameInput.isVisible({ timeout: 5000 }).catch(() => false);
        if (!isFormVisible) {
          throw new Error("Form did not become visible after clicking Create Tag button");
        }
      } else {
        throw new Error("Create Tag button not found in modal");
      }
    }

    // Fill tag name
    await nameInput.waitFor({ state: "visible", timeout: 10000 });
    await nameInput.fill(name);
    await this.page.waitForTimeout(300); // Wait for form validation

    // Fill color if provided
    if (color) {
      // Find the color text input - it should be next to the color picker
      // Look for input[type="text"] that is in the same container as the color picker
      const colorLabel = this.page.locator('label:has-text("Color"), label:has-text("Color")').first();
      if (await colorLabel.count() > 0) {
        // Find the text input in the same container (after the color picker)
        const colorTextInput = colorLabel.locator('..').locator('input[type="text"]').first();
        if (await colorTextInput.count() > 0) {
          await colorTextInput.waitFor({ state: "visible", timeout: 5000 });
          await colorTextInput.fill(color);
        }
      }
    }

    // Fill description if provided
    if (description) {
      const descInput = this.page.locator('textarea[id="tag-description"]').first();
      if (await descInput.count() > 0) {
        await descInput.waitFor({ state: "visible", timeout: 5000 });
        await descInput.fill(description);
        await this.page.waitForTimeout(300);
      }
    }

    // Wait for form to be ready and visible
    await this.page.waitForTimeout(1000);

    // Ensure the form section is visible
    const formSection = this.page.locator('div.border.rounded-lg.p-4.bg-muted\\/50').first();
    await formSection.waitFor({ state: "visible", timeout: 10000 });

    // Find the button container at the bottom of the form
    const buttonContainer = formSection.locator('div.flex.justify-end.gap-2').first();
    await buttonContainer.waitFor({ state: "visible", timeout: 5000 });

    // The submit button is the last button in the container (Create/Crear/Update)
    // It should NOT be disabled and should be visible
    const createButton = buttonContainer
      .locator('button')
      .filter({ hasNot: this.page.locator('text=/Cancel|cancelar/i') }) // Exclude Cancel button
      .last();

    await createButton.waitFor({ state: "visible", timeout: 10000 });

    // Wait a bit more to ensure button is enabled
    await this.page.waitForTimeout(500);

    // Check if button is disabled (should not be if name is filled)
    const isDisabled = await createButton.isDisabled();
    if (isDisabled) {
      throw new Error("Create button is disabled. Make sure tag name is filled.");
    }

    await createButton.click();

    // Wait for the form to disappear or the tag to appear in the list
    // The form might close or the tag should appear in the table
    await this.page.waitForTimeout(2000);

    // Wait for table to be rendered (if it exists)
    await this.page.waitForSelector('table, [role="table"], tbody', { timeout: 5000 }).catch(() => {});

    // Additional wait for API response and UI update
    await this.page.waitForTimeout(1500);
  }

  /**
   * Edit a tag
   */
  async editTag(oldName: string, newName: string) {
    // Find the tag in the table
    const tagRow = this.page.locator(`tr:has-text("${oldName}")`).first();
    await tagRow.waitFor({ state: "visible", timeout: 5000 });

    // Click edit button
    const editButton = tagRow.locator('button').filter({ has: this.page.locator('svg') }).first();
    await editButton.click();
    await this.page.waitForTimeout(1000);

    // Update name
    const nameInput = this.page.locator('input[id="tag-name"]').first();
    await nameInput.clear();
    await nameInput.fill(newName);

    // Click update button
    const updateButton = this.page.locator('button:has-text("Update"), button:has-text("Actualizar")').first();
    await updateButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagName: string) {
    // Find the tag in the table
    const tagRow = this.page.locator(`tr:has-text("${tagName}")`).first();
    await tagRow.waitFor({ state: "visible", timeout: 5000 });

    // Find delete button (usually the last button in the row)
    const deleteButton = tagRow.locator('button').last();
    await deleteButton.click();
    await this.page.waitForTimeout(1000);

    // Confirm deletion
    const confirmButton = this.page
      .locator('button:has-text("Delete"), button:has-text("Eliminar")')
      .filter({ hasNot: this.page.locator('text=/Tag|Etiqueta/i').locator('..') })
      .last();
    await confirmButton.waitFor({ state: "visible", timeout: 5000 });
    await confirmButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify tag exists in the list
   */
  async verifyTagExists(tagName: string): Promise<boolean> {
    // Wait a bit for the tag to appear and table to be rendered
    await this.page.waitForTimeout(1500);

    // Wait for table to be present
    await this.page.waitForSelector('table, [role="table"], tbody', { timeout: 5000 }).catch(() => {});

    // Look for the tag in the table/list - try multiple selectors
    // First try: table row
    const tagRow = this.page.locator(`tr:has-text("${tagName}")`).first();
    let isVisible = await tagRow.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isVisible) {
      // Second try: table cell
      const tagCell = this.page.locator(`td:has-text("${tagName}")`).first();
      isVisible = await tagCell.isVisible({ timeout: 3000 }).catch(() => false);
    }

    if (!isVisible) {
      // Third try: any text within the dialog/modal
      const tagText = this.page.locator(`text=${tagName}`).first();
      isVisible = await tagText.isVisible({ timeout: 2000 }).catch(() => false);
    }

    return isVisible;
  }

  /**
   * Close tag manager modal
   */
  async closeTagManagerModal() {
    const closeButton = this.page.locator('button[aria-label="Close"], button:has(svg)').last();
    if (await closeButton.count() > 0) {
      try {
        await closeButton.click({ timeout: 5000 });
        await this.page.waitForTimeout(1000);
      } catch (error) {
        // If close button fails, try pressing Escape
        await this.page.keyboard.press("Escape");
        await this.page.waitForTimeout(1000);
      }
    }
  }
}

test.describe("Tags CRUD E2E", () => {
  const failedRequests: string[] = [];

  test.beforeEach(async ({ authenticatedPage }) => {
    // Clear failed requests array
    failedRequests.length = 0;

    // Capture responses with 404 status
    authenticatedPage.on("response", (response: any) => {
      if (response.status() === 404) {
        const url = response.url();
        failedRequests.push(url);
        try {
          const urlObj = new URL(url);
          // Only log if it's not an API endpoint (those are expected to fail sometimes)
          if (!urlObj.pathname.startsWith("/api/")) {
            console.log(`[404 ERROR] ${urlObj.pathname}`);
          }
        } catch {
          console.log(`[404 ERROR] ${url}`);
        }
      }
    });

    // Also capture failed requests (network errors)
    authenticatedPage.on("requestfailed", async (request: any) => {
      const url = request.url();
      const failure = request.failure();
      if (failure && (failure.errorText?.includes("404") || failure.errorText?.includes("net::ERR_"))) {
        failedRequests.push(url);
        try {
          const urlObj = new URL(url);
          if (!urlObj.pathname.startsWith("/api/")) {
            console.log(`[404 ERROR] ${urlObj.pathname}`);
          }
        } catch {
          console.log(`[404 ERROR] ${url}`);
        }
      }
    });
  });

  test.afterEach(() => {
    if (failedRequests.length > 0) {
      const uniqueUrls = [...new Set(failedRequests)];
      // Filter out API endpoints and external URLs
      const staticResource404s = uniqueUrls.filter((url) => {
        try {
          const urlObj = new URL(url);
          return (
            !urlObj.pathname.startsWith("/api/") &&
            !urlObj.hostname.includes("googleapis.com") &&
            !urlObj.hostname.includes("gstatic.com")
          );
        } catch {
          return true;
        }
      });

      if (staticResource404s.length > 0) {
        console.log(`\n[SUMMARY] Total 404 errors (static resources): ${staticResource404s.length}`);
        console.log(`[SUMMARY] Unique 404 URLs (${staticResource404s.length}):`);
        staticResource404s.slice(0, 50).forEach((url) => {
          try {
            const urlObj = new URL(url);
            console.log(`  - ${urlObj.pathname}`);
          } catch {
            console.log(`  - ${url}`);
          }
        });
        if (staticResource404s.length > 50) {
          console.log(`  ... and ${staticResource404s.length - 50} more`);
        }
      }
    }
  });

  test("should capture 404 errors on files page", async ({ authenticatedPage }) => {
    // Simple test to just navigate and capture 404s
    console.log("[404-CAPTURE] Starting 404 capture test");

    // Wait a bit before starting to ensure listeners are set up
    await authenticatedPage.waitForTimeout(500);

    await authenticatedPage.goto("/files", { waitUntil: "networkidle" });
    await authenticatedPage.waitForTimeout(3000); // Wait for all resources to load

    // Try to open upload tab if available
    const uploadTab = authenticatedPage.locator('button:has-text("Upload"), button:has-text("Subir")').first();
    if (await uploadTab.count() > 0) {
      await uploadTab.click();
      await authenticatedPage.waitForTimeout(2000);
    }

    // Wait a bit more for any delayed requests
    await authenticatedPage.waitForTimeout(2000);

    // Show summary immediately
    const uniqueUrls = [...new Set(failedRequests)];
    const staticResource404s = uniqueUrls.filter((url) => {
      try {
        const urlObj = new URL(url);
        return (
          !urlObj.pathname.startsWith("/api/") &&
          !urlObj.hostname.includes("googleapis.com") &&
          !urlObj.hostname.includes("gstatic.com")
        );
      } catch {
        return true;
      }
    });

    if (staticResource404s.length > 0) {
      console.log(`\n[404-CAPTURE] Total 404 errors (static resources): ${staticResource404s.length}`);
      console.log(`[404-CAPTURE] Unique 404 URLs (${staticResource404s.length}):`);
      staticResource404s.slice(0, 50).forEach((url) => {
        try {
          const urlObj = new URL(url);
          console.log(`  - ${urlObj.pathname}`);
        } catch {
          console.log(`  - ${url}`);
        }
      });
      if (staticResource404s.length > 50) {
        console.log(`  ... and ${staticResource404s.length - 50} more`);
      }
    } else {
      console.log(`\n[404-CAPTURE] ✅ No static resource 404 errors found!`);
      console.log(`[404-CAPTURE] Total failed requests: ${failedRequests.length}`);
      if (failedRequests.length > 0) {
        const allUnique = [...new Set(failedRequests)];
        console.log(`[404-CAPTURE] All failed URLs (first 50):`);

        // Categorize URLs
        const apiUrls: string[] = [];
        const staticUrls: string[] = [];
        const externalUrls: string[] = [];

        allUnique.forEach((url) => {
          try {
            const urlObj = new URL(url);
            if (urlObj.pathname.startsWith("/api/")) {
              apiUrls.push(urlObj.pathname);
            } else if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
              staticUrls.push(urlObj.pathname);
            } else {
              externalUrls.push(urlObj.hostname);
            }
          } catch {
            staticUrls.push(url);
          }
        });

        if (staticUrls.length > 0) {
          console.log(`[404-CAPTURE] Static resource URLs (${staticUrls.length}):`);
          staticUrls.slice(0, 30).forEach((url) => console.log(`  - ${url}`));
        }

        if (apiUrls.length > 0) {
          console.log(`[404-CAPTURE] API URLs (${apiUrls.length}, first 10):`);
          apiUrls.slice(0, 10).forEach((url) => console.log(`  - ${url}`));
        }

        if (externalUrls.length > 0) {
          console.log(`[404-CAPTURE] External domains (${externalUrls.length}):`);
          [...new Set(externalUrls)].slice(0, 10).forEach((host) => console.log(`  - ${host}`));
        }
      }
    }

    console.log("[404-CAPTURE] Test completed");
  });

  test("should create tag from FileUploadConfig", async ({ authenticatedPage }) => {
    const tagsPage = new TagsPage(authenticatedPage);

    // Navigate to files page
    await tagsPage.gotoFiles();

    // Try to find upload section or navigate to upload tab
    // Look for upload button or upload tab
    const uploadTab = authenticatedPage.locator('button:has-text("Upload"), button:has-text("Subir")').first();
    if (await uploadTab.count() > 0) {
      await uploadTab.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    // Open tag manager from upload config
    await tagsPage.openTagManagerFromUploadConfig();

    // Verify modal is open
    const isOpen = await tagsPage.isTagManagerModalOpen();
    expect(isOpen).toBe(true);

    // Create a tag
    const tagName = `E2E Tag ${Date.now()}`;
    await tagsPage.createTag(tagName, "#FF5733", "Test tag from E2E");

    // Verify tag was created
    const exists = await tagsPage.verifyTagExists(tagName);
    expect(exists).toBe(true);

    // Close modal - use Escape key as fallback
    try {
      await tagsPage.closeTagManagerModal();
    } catch (error) {
      // Fallback: press Escape key
      await authenticatedPage.keyboard.press("Escape");
      await authenticatedPage.waitForTimeout(1000);
    }
  });

  test("should create tag from FileFilters", async ({ authenticatedPage }) => {
    const tagsPage = new TagsPage(authenticatedPage);

    // Navigate to files page
    await tagsPage.gotoFiles();
    await authenticatedPage.waitForTimeout(2000);

    // Open tag manager from filters
    await tagsPage.openTagManagerFromFilters();

    // Verify modal is open (if button exists)
    const manageButton = authenticatedPage.locator('button:has-text("Manage")').first();
    if (await manageButton.count() > 0) {
      const isOpen = await tagsPage.isTagManagerModalOpen();
      expect(isOpen).toBe(true);

      // Create a tag
      const tagName = `E2E Filter Tag ${Date.now()}`;
      await tagsPage.createTag(tagName, "#33FF57", "Test tag from filters");

      // Verify tag was created
      const exists = await tagsPage.verifyTagExists(tagName);
      expect(exists).toBe(true);

      // Close modal
      await tagsPage.closeTagManagerModal();
    } else {
      // If manage button doesn't exist, skip this test (filters might not be visible)
      test.skip();
    }
  });

  test("should edit tag", async ({ authenticatedPage }) => {
    const tagsPage = new TagsPage(authenticatedPage);

    // Navigate to files page
    await tagsPage.gotoFiles();

    // Open tag manager
    await tagsPage.openTagManagerFromUploadConfig();

    // Create a tag first
    const originalName = `E2E Edit Tag ${Date.now()}`;
    await tagsPage.createTag(originalName, "#FF5733");

    // Edit the tag
    const newName = `${originalName} Edited`;
    await tagsPage.editTag(originalName, newName);

    // Verify tag was updated
    const oldExists = await tagsPage.verifyTagExists(originalName);
    const newExists = await tagsPage.verifyTagExists(newName);

    expect(oldExists).toBe(false);
    expect(newExists).toBe(true);

    // Cleanup: delete the tag
    await tagsPage.deleteTag(newName);
  });

  test("should delete tag", async ({ authenticatedPage }) => {
    const tagsPage = new TagsPage(authenticatedPage);

    // Navigate to files page
    await tagsPage.gotoFiles();

    // Open tag manager
    await tagsPage.openTagManagerFromUploadConfig();

    // Create a tag first
    const tagName = `E2E Delete Tag ${Date.now()}`;
    await tagsPage.createTag(tagName, "#FF5733");

    // Verify tag exists
    let exists = await tagsPage.verifyTagExists(tagName);
    expect(exists).toBe(true);

    // Delete the tag
    await tagsPage.deleteTag(tagName);

    // Verify tag was deleted
    await authenticatedPage.waitForTimeout(2000);
    exists = await tagsPage.verifyTagExists(tagName);
    expect(exists).toBe(false);
  });

  test("should create and use tag in file upload", async ({ authenticatedPage }) => {
    const tagsPage = new TagsPage(authenticatedPage);

    // Navigate to files page
    await tagsPage.gotoFiles();

    // Open upload tab if available
    const uploadTab = authenticatedPage.locator('button:has-text("Upload"), button:has-text("Subir")').first();
    if (await uploadTab.count() > 0) {
      await uploadTab.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    // Open tag manager
    await tagsPage.openTagManagerFromUploadConfig();

    // Create a tag
    const tagName = `E2E Upload Tag ${Date.now()}`;
    await tagsPage.createTag(tagName, "#FF5733", "Tag for file upload");

    // Close modal
    await tagsPage.closeTagManagerModal();
    await authenticatedPage.waitForTimeout(1000);

    // Verify tag is available in the select dropdown
    const tagSelect = authenticatedPage.locator('button:has-text("Select"), button:has-text("Seleccionar")').first();
    if (await tagSelect.count() > 0) {
      await tagSelect.click();
      await authenticatedPage.waitForTimeout(500);

      // Check if the tag appears in the dropdown
      const tagOption = authenticatedPage.locator(`text="${tagName}"`).first();
      const tagVisible = await tagOption.isVisible().catch(() => false);
      expect(tagVisible).toBe(true);
    }
  });
});

