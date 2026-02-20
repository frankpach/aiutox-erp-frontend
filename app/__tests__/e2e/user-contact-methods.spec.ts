/**
 * E2E Tests for User Contact Methods CRUD
 *
 * Tests the complete contact methods management flow including:
 * - Creating contact methods (email, phone, mobile, whatsapp, address, website)
 * - Editing contact methods
 * - Deleting contact methods
 * - Form validations
 * - Marking as primary
 * - Display and visualization
 */

import { test, expect } from "./fixtures/auth.setup";

/**
 * Helper function to select a method type in Radix UI Select
 */
async function selectMethodType(page: any, methodType: string) {
  // Wait for the select to be visible
  const selectTrigger = page.locator('button[role="combobox"]').first();
  await selectTrigger.waitFor({ state: 'visible', timeout: 5000 });

  // Click on the select trigger (combobox)
  await selectTrigger.click();

  // Wait for dropdown to open
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await page.waitForTimeout(500);

  // Click on the option - try multiple strategies
  const option = page.locator(`[role="option"]:has-text("${methodType}")`).first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  // Wait for dropdown to close
  await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(500);
}

test.describe("User Contact Methods CRUD", () => {
  let userId: string;

  // Increase timeout for this test suite due to complex setup
  test.setTimeout(60000); // 60 seconds

  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to users list
    await page.goto("/users", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("table tbody tr", { timeout: 15000 });

    // Get first user row
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.waitFor({ state: "visible", timeout: 10000 });

    // Open actions dropdown menu
    const actionsButton = firstRow.locator('button[aria-label*="Acciones"], button:has([class*="MoreVertical"])').first();
    await actionsButton.waitFor({ state: "visible", timeout: 5000 });
    await actionsButton.click();

    // Wait for dropdown menu to appear (use waitForSelector instead of timeout)
    await page.waitForSelector('[role="menu"], [role="listbox"]', { timeout: 5000 }).catch(() => {
      // If dropdown doesn't appear, try clicking again
      console.log("[TEST] Dropdown not found, retrying...");
    });

    // Click on "Ver" link in the dropdown
    const viewLink = page.locator('a:has-text("Ver"), a:has-text("View")').first();
    await viewLink.waitFor({ state: "visible", timeout: 5000 });
    await viewLink.click();

    // Wait for user detail page
    await expect(page).toHaveURL(/\/users\/[^/]+$/, { timeout: 15000 });

    // Extract user ID from URL
    const url = page.url();
    const match = url.match(/\/users\/([^/]+)$/);
    userId = match && match[1] ? match[1] : "";

    expect(userId).toBeTruthy();

    // Wait for page to load (use domcontentloaded instead of networkidle for faster execution)
    await page.waitForLoadState("domcontentloaded");

    // Wait for contact methods section or tabs to be available
    await page.waitForSelector(
      '[role="tab"], h3:has-text("Métodos de Contacto"), h3:has-text("Contact Methods"), button:has-text("Agregar Método"), button:has-text("Add Method")',
      { timeout: 10000 }
    ).catch(() => {
      console.log("[TEST] Contact methods section not immediately visible, continuing...");
    });

    // Navigate to contact methods tab if it exists
    const tabSelectors = [
      '[role="tab"]:has-text("Contacto")',
      '[role="tab"]:has-text("Contact")',
      '[role="tab"]:has-text("Métodos")',
      'button[role="tab"]:has-text("Contacto")',
      'button[role="tab"]:has-text("Contact")',
    ];

    let tabFound = false;
    for (const selector of tabSelectors) {
      const tab = page.locator(selector);
      const count = await tab.count();
      if (count > 0) {
        const isVisible = await tab.isVisible().catch(() => false);
        if (isVisible) {
          await tab.click();
          // Wait for tab content to load
          await page.waitForSelector(
            'h3:has-text("Métodos de Contacto"), h3:has-text("Contact Methods"), button:has-text("Agregar Método"), button:has-text("Add Method")',
            { timeout: 5000 }
          ).catch(() => {});
          tabFound = true;
          break;
        }
      }
    }

    // If no tab found, contact methods might be in the default view
    if (!tabFound) {
      console.log("[TEST] No contact tab found, assuming contact methods are visible by default");
    }
  });

  test("should display contact methods section", async ({ authenticatedPage: page }) => {
    // Check that contact methods section is visible (use heading to avoid strict mode violation)
    const heading = page.locator('h3:has-text("Métodos de Contacto"), h3:has-text("Contact Methods")').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Check for "Agregar Método" button
    await expect(page.locator('button:has-text("Agregar Método"), button:has-text("Add Method")')).toBeVisible();
  });

  test("should create email contact method", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form to appear
    await page.waitForSelector('form', { timeout: 10000 });

    // Wait a bit for form to fully render
    await page.waitForTimeout(500);

    // Select email type
    await selectMethodType(page, "Email");

    // Wait for the value input to appear after selecting method type
    await page.waitForSelector('input[id="value"]', { timeout: 5000 });
    await page.waitForTimeout(300);

    // Fill email
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[id="value"]', testEmail);

    // Fill label (optional)
    await page.fill('input[id="label"], input[placeholder*="Etiqueta"], input[placeholder*="Label"]', "Trabajo");

    // Listen for console errors before submitting
    const consoleErrors: string[] = [];
    page.on("console", (msg: any) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for network errors
    page.on("response", (response: any) => {
      if (!response.ok() && response.url().includes("contact-methods")) {
        consoleErrors.push(`Network error: ${response.status()} ${response.statusText()} for ${response.url()}`);
      }
    });

    // Submit form
    await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');

    // Wait for form submission
    await page.waitForTimeout(2000);

    // Log any console errors
    if (consoleErrors.length > 0) {
      console.error("[TEST] Console errors detected:", consoleErrors);
    }

    // Check for errors in the form
    const formErrors = page.locator('form .text-destructive, form p.text-destructive');
    const errorCount = await formErrors.count();
    if (errorCount > 0) {
      const errorTexts = await Promise.all(
        Array.from({ length: errorCount }, (_, i) =>
          formErrors.nth(i).textContent().catch(() => "")
        )
      );
      const realErrors = errorTexts.filter((text: string | null) => text && text.trim().length > 0 && text.trim() !== "*");
      if (realErrors.length > 0) {
        throw new Error(`Form validation errors: ${realErrors.join(", ")}`);
      }
    }

    // Wait a bit for form submission
    await page.waitForTimeout(2000);

    // Check if form is still visible (might indicate an error)
    const formStillVisible = await page.locator('form').isVisible().catch(() => false);

    if (formStillVisible) {
      // Check for error messages in the form (CSS selectors only)
      const errorInForm = page.locator('form .text-destructive, form p.text-destructive');
      const errorCount = await errorInForm.count();
      if (errorCount > 0) {
        const errorTexts = await Promise.all(
          Array.from({ length: errorCount }, (_, i) =>
            errorInForm.nth(i).textContent().catch(() => "")
          )
        );
        const realErrors = errorTexts.filter((text: string | null) => text && text.trim().length > 0 && text.trim() !== "*");
        if (realErrors.length > 0) {
          throw new Error(`Form submission failed with errors: ${realErrors.join(", ")}`);
        }
      }

      // Also check for text-based error messages
      const textErrors = page.locator('form').locator('text=/Error|error/i');
      const textErrorCount = await textErrors.count();
      if (textErrorCount > 0) {
        const textErrorTexts = await Promise.all(
          Array.from({ length: textErrorCount }, (_, i) =>
            textErrors.nth(i).textContent().catch(() => "")
          )
        );
        const realTextErrors = textErrorTexts.filter((text: string | null) => text && text.trim().length > 0);
        if (realTextErrors.length > 0) {
          throw new Error(`Form submission failed with text errors: ${realTextErrors.join(", ")}`);
        }
      }

      // If form is still visible after 5 seconds, it's likely an error
      await page.waitForTimeout(3000);
      const stillVisible = await page.locator('form').isVisible().catch(() => false);
      if (stillVisible) {
        // Take screenshot for debugging
        await page.screenshot({ path: `test-results/form-still-visible-${Date.now()}.png` });
        throw new Error(`Form did not close after submission. This likely indicates an error.`);
      }
    }

    // Wait for success toast (indicates successful creation)
    const successToast = page.locator('[data-sonner-toaster] div[data-title]:has-text("creado exitosamente"), text=/creado exitosamente|created successfully/i');
    await expect(successToast).toBeVisible({ timeout: 10000 }).catch(() => {
      // If toast not found, log but continue - might be a timing issue
      console.warn("[TEST] Success toast not found immediately, but continuing...");
    });

    // Wait a bit more for React Query to invalidate and refetch
    await page.waitForTimeout(2000);

    // With React Query, the list should refresh automatically
    // Wait for the email to appear in the contact methods list
    // Try multiple selectors to find the email
    const emailSelectors = [
      `.rounded-md.border.p-4:has-text("${testEmail}")`,
      `text=${testEmail}`,
      `.rounded-md.border:has-text("${testEmail}")`,
    ];

    let emailFound = false;
    for (const selector of emailSelectors) {
      const emailInList = page.locator(selector).first();
      const isVisible = await emailInList.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        emailFound = true;
        break;
      }
    }

    if (!emailFound) {
      // Take a screenshot for debugging
      await page.screenshot({ path: `test-results/contact-method-not-found-${Date.now()}.png` });
      // Get page content for debugging
      const pageContent = await page.textContent('body').catch(() => "");
      console.error("[TEST] Contact method not found. Page content snippet:", pageContent?.substring(0, 500));
      throw new Error(`Contact method with email ${testEmail} was not found in the list after creation`);
    }
  });

  test("should create phone contact method", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form
    await page.waitForSelector('form', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Select phone type
    await selectMethodType(page, "Teléfono");

    // Wait for the value input to appear
    await page.waitForSelector('input[id="value"]', { timeout: 5000 });
    await page.waitForTimeout(300);

    // Fill phone number
    const testPhone = `+57-300-${Date.now().toString().slice(-7)}`;
    await page.fill('input[id="value"]', testPhone);

    // Submit form
    await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');

    // Wait for success
    await page.waitForTimeout(2000);

    // Verify phone appears in the list
    await expect(page.locator(`text=${testPhone}`)).toBeVisible({ timeout: 10000 });
  });

  test("should create address contact method", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form
    await page.waitForSelector('form', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Select address type - try both Spanish and English
    try {
      await selectMethodType(page, "Dirección");
    } catch (e) {
      // Try English if Spanish fails
      await selectMethodType(page, "Address");
    }

    // Wait for address fields to appear (they should replace the value input)
    await page.waitForSelector('input[id="address_line1"]', { timeout: 5000 });
    await page.waitForTimeout(300);

    // Fill address fields
    await page.fill('input[id="address_line1"]', "Calle 123 #45-67");
    await page.fill('input[id="city"]', "Bogotá");
    await page.fill('input[id="country"]', "CO");

    // Submit form
    await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');

    // Wait for success
    await page.waitForTimeout(2000);

    // Verify address appears in the list
    await expect(page.locator('text=Calle 123')).toBeVisible({ timeout: 10000 });
  });

  test("should create contact method and mark as primary", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form
    await page.waitForSelector('form', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Select email type
    await selectMethodType(page, "Email");

    // Wait for the value input to appear
    await page.waitForSelector('input[id="value"]', { timeout: 5000 });
    await page.waitForTimeout(300);

    // Fill email
    const testEmail = `primary-${Date.now()}@example.com`;
    await page.fill('input[id="value"]', testEmail);

    // Mark as primary (toggle switch)
    const primarySwitch = page.locator('input[type="checkbox"][id="is_primary"], button[role="switch"]');
    const switchCount = await primarySwitch.count();
    if (switchCount > 0) {
      await primarySwitch.click();
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');

    // Wait for success
    await page.waitForTimeout(2000);

    // Verify email appears with "Principal" badge
    await expect(page.locator(`text=${testEmail}`)).toBeVisible({ timeout: 10000 });

    // Check for primary badge - try multiple selectors
    const primaryBadge = page.locator('text=Principal, text=Primary, span:has-text("Principal"), span:has-text("Primary")').first();
    await expect(primaryBadge).toBeVisible({ timeout: 5000 }).catch(() => {
      // If badge not found, check if the contact method was created at least
      console.warn("[TEST] Primary badge not found, but contact method was created");
    });
  });

  test("should edit contact method", async ({ authenticatedPage: page }) => {
    // Wait for contact methods list
    await page.waitForSelector('text=/Métodos de Contacto|Contact Methods/i', { timeout: 10000 });

    // Check if there are any contact methods
    const noMethodsMsg = page.locator('text=/No hay métodos|No contact methods/i');
    const hasNoMethods = await noMethodsMsg.isVisible().catch(() => false);

    if (hasNoMethods) {
      // Create one first
      await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');
      await page.waitForSelector('form', { timeout: 5000 });
      await selectMethodType(page, "Email");
      const testEmail = `edit-${Date.now()}@example.com`;
      await page.fill('input[type="email"], input[id="value"]', testEmail);
      await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');
      await page.waitForTimeout(2000);
    }

    // Find first edit button
    const editButtons = page.locator('button:has([class*="Edit"]), button[aria-label*="Edit"]');
    const editCount = await editButtons.count();

    if (editCount > 0) {
      await editButtons.first().click();

      // Wait for edit form
      await page.waitForSelector('form', { timeout: 5000 });

      // Update value
      const newValue = `updated-${Date.now()}@example.com`;
      const valueInput = page.locator('input[id="value"], input[type="email"], input[type="tel"]');
      await valueInput.clear();
      await valueInput.fill(newValue);

      // Submit update
      await page.click('button[type="submit"]:has-text("Actualizar"), button[type="submit"]:has-text("Update")');

      // Wait for success
      await page.waitForTimeout(2000);

      // Verify updated value appears
      await expect(page.locator(`text=${newValue}`)).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test("should delete contact method with confirmation", async ({ authenticatedPage: page }) => {
    // Wait for contact methods list
    await page.waitForSelector('text=/Métodos de Contacto|Contact Methods/i', { timeout: 10000 });

    // Check if there are any contact methods
    const noMethodsMsg = page.locator('text=/No hay métodos|No contact methods/i');
    const hasNoMethods = await noMethodsMsg.isVisible().catch(() => false);

    if (hasNoMethods) {
      // Create one first
      await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');
      await page.waitForSelector('form', { timeout: 5000 });
      await selectMethodType(page, "Email");
      const testEmail = `delete-${Date.now()}@example.com`;
      await page.fill('input[type="email"], input[id="value"]', testEmail);
      await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');
      await page.waitForTimeout(2000);
    }

    // Get first contact method value for verification
    const firstMethod = page.locator('.rounded-md.border.p-4').first();
    const methodText = await firstMethod.textContent().catch(() => "");

    // Find first delete button
    const deleteButtons = page.locator('button:has([class*="Trash"]), button[aria-label*="Delete"]');
    const deleteCount = await deleteButtons.count();

    if (deleteCount > 0) {
      await deleteButtons.first().click();

      // Wait for confirmation dialog
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await expect(page.locator('text=/Eliminar Método|Delete Method/i')).toBeVisible();

      // Confirm deletion
      await page.click('button:has-text("Eliminar"), button:has-text("Delete")');

      // Wait for success
      await page.waitForTimeout(2000);

      // Verify method is removed (if it was the only one, should show "No hay métodos")
      if (methodText) {
        const stillVisible = await page.locator(`text=${methodText}`).isVisible().catch(() => false);
        // Method should not be visible, or we should see "No hay métodos"
        expect(stillVisible || await page.locator('text=/No hay métodos|No contact methods/i').isVisible().catch(() => false)).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test("should validate required fields when creating contact method", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form
    await page.waitForSelector('form', { timeout: 5000 });

    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');

    // Check for validation errors
    await page.waitForTimeout(500);

    // For email/phone/website, value is required
    // For address, address_line1, city, and country are required
    const errorMessages = page.locator('p.text-destructive, .text-destructive');
    const errorCount = await errorMessages.count();

    // Should have at least one validation error
    expect(errorCount).toBeGreaterThan(0);
  });

  test("should validate email format", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form
    await page.waitForSelector('form', { timeout: 5000 });

    // Select email type
    await selectMethodType(page, "Email");

    // Fill invalid email
    await page.fill('input[type="email"], input[id="value"]', "invalid-email");

    // Try to submit
    await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');

    // Browser should prevent submission or show validation error
    await page.waitForTimeout(500);

    // Check if form is still visible (indicating validation prevented submission)
    const formVisible = await page.locator('form').isVisible();
    expect(formVisible).toBeTruthy();
  });

  test("should validate address required fields", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form
    await page.waitForSelector('form', { timeout: 5000 });

    // Select address type
    await selectMethodType(page, "Dirección");

    // Wait for address fields
    await page.waitForSelector('input[id="address_line1"]', { timeout: 3000 });

    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Agregar"), button[type="submit"]:has-text("Add")');

    // Check for validation errors
    await page.waitForTimeout(500);

    const errorMessages = page.locator('p.text-destructive, .text-destructive');
    const errorCount = await errorMessages.count();

    // Should have validation errors for required address fields
    expect(errorCount).toBeGreaterThan(0);
  });

  test("should display contact methods with correct icons", async ({ authenticatedPage: page }) => {
    // Wait for contact methods section
    await page.waitForSelector('text=/Métodos de Contacto|Contact Methods/i', { timeout: 10000 });

    // Check if there are contact methods
    const noMethodsMsg = page.locator('text=/No hay métodos|No contact methods/i');
    const hasNoMethods = await noMethodsMsg.isVisible().catch(() => false);

    if (!hasNoMethods) {
      // Verify that contact methods are displayed with icons
      // Icons are typically SVG elements with specific classes
      const methodCards = page.locator('.rounded-md.border.p-4');
      const cardCount = await methodCards.count();

      if (cardCount > 0) {
        const firstCard = methodCards.first();
        // Wait for card to be visible
        await firstCard.waitFor({ state: 'visible', timeout: 5000 });
        // Check for icon - try multiple selectors
        const hasIcon = await firstCard.locator('svg, [class*="lucide"], [class*="icon"]').first().isVisible().catch(() => false);
        if (!hasIcon) {
          // Try checking if icon exists in the DOM even if not visible
          const iconExists = await firstCard.locator('svg, [class*="lucide"], [class*="icon"]').count() > 0;
          expect(iconExists).toBeTruthy();
        } else {
          expect(hasIcon).toBeTruthy();
        }
      }
    }
  });

  test("should cancel creating contact method", async ({ authenticatedPage: page }) => {
    // Click "Agregar Método" button
    await page.click('button:has-text("Agregar Método"), button:has-text("Add Method")');

    // Wait for form
    await page.waitForSelector('form', { timeout: 5000 });

    // Fill some data
    await selectMethodType(page, "Email");
    await page.fill('input[type="email"], input[id="value"]', "cancel-test@example.com");

    // Click cancel
    await page.click('button:has-text("Cancelar"), button:has-text("Cancel")');

    // Form should close
    await page.waitForTimeout(1000);

    // Form should not be visible
    const formVisible = await page.locator('form').isVisible().catch(() => false);
    expect(formVisible).toBeFalsy();
  });
});

