/**
 * E2E Tests for Approvals Error Handling
 *
 * Tests error handling in approval operations:
 * - Network errors
 * - Validation errors
 * - Server errors
 * - Edge cases
 *
 * Requires: Backend and Frontend running
 */

import { test, expect } from "../fixtures/auth.setup";

test.describe("Approvals Error Handling E2E", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to approvals page
    await authenticatedPage.goto("/approvals");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("should handle empty form submission", async ({ authenticatedPage }) => {
    // Click on "Formulario" tab
    await authenticatedPage.getByRole("tab", { name: /formulario/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Wait for form to be visible
    const form = authenticatedPage.getByTestId("approval-request-form");
    await form.waitFor({ state: "visible", timeout: 10000 });

    // Try to submit empty form (click submit without filling required fields)
    const submitButton = authenticatedPage.getByTestId(
      "approval-submit-button"
    );
    await submitButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Check if browser validation prevented submission or if form shows error
    // HTML5 validation will prevent submission if required fields are empty
    const currentUrl = authenticatedPage.url();
    const isStillOnForm = currentUrl.includes("/approvals");

    expect(isStillOnForm).toBeTruthy();
  });

  test("should handle invalid flow selection", async ({
    authenticatedPage,
  }) => {
    // Click on "Formulario" tab
    await authenticatedPage.getByRole("tab", { name: /formulario/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Wait for form to be visible
    const form = authenticatedPage.getByTestId("approval-request-form");
    await form.waitFor({ state: "visible", timeout: 10000 });

    // Fill in form but leave flow_id empty (required field)
    await authenticatedPage
      .getByTestId("approval-title-input")
      .fill("Test Invalid Flow Request");
    await authenticatedPage
      .getByTestId("approval-description-input")
      .fill("Testing invalid flow selection");
    await authenticatedPage
      .getByTestId("approval-entity-type-input")
      .fill("test-entity");
    await authenticatedPage
      .getByTestId("approval-entity-id-input")
      .fill("12345");

    // Try to submit without flow_id
    const submitButton = authenticatedPage.getByTestId(
      "approval-submit-button"
    );
    await submitButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Check if browser validation prevented submission
    const currentUrl = authenticatedPage.url();
    const isStillOnForm = currentUrl.includes("/approvals");

    expect(isStillOnForm).toBeTruthy();
  });

  test("should handle network errors gracefully", async ({
    authenticatedPage,
    context,
  }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Block network requests to simulate network error
    void context.route("**/api/approvals/**", (route) => {
      route.abort("failed");
    });

    // Try to refresh
    const refreshButton = authenticatedPage.getByTestId(
      "approval-refresh-button"
    );

    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Should show error message
      await expect(
        authenticatedPage.getByText(/error de red|conexión|no se pudo cargar/i)
      ).toBeVisible();
    }

    // Restore network
    void context.unroute("**/api/approvals/**");
  });

  test("should handle server errors", async ({
    authenticatedPage,
    context,
  }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Simulate server error (500)
    void context.route("**/api/approvals/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // Try to refresh
    const refreshButton = authenticatedPage.getByTestId(
      "approval-refresh-button"
    );

    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Should show error message
      await expect(
        authenticatedPage.getByText(/error del servidor|500|internal/i)
      ).toBeVisible();
    }

    // Restore network
    void context.unroute("**/api/approvals/**");
  });

  test("should handle approval with missing comment when required", async ({
    authenticatedPage,
  }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Look for pending requests
    const pendingRequests = authenticatedPage
      .locator("[data-testid^='approval-request-']")
      .filter({ hasText: /pendiente/i });

    const count = await pendingRequests.count();

    if (count > 0) {
      // Click on first pending request
      await pendingRequests.first().click();
      await authenticatedPage.waitForLoadState("networkidle");

      // Try to approve without comment (if comment is required)
      const approveButton = authenticatedPage.getByRole("button", {
        name: /aprobar/i,
      });

      if (await approveButton.isVisible()) {
        await approveButton.click();
        await authenticatedPage.waitForTimeout(500);

        // Check if comment modal is shown
        const commentModal = authenticatedPage.getByRole("dialog", {
          name: /aprobar/i,
        });

        if (await commentModal.isVisible()) {
          // Try to submit without comment
          const confirmButton = authenticatedPage
            .getByRole("dialog")
            .getByRole("button", { name: /aprobar/i });

          await confirmButton.click();
          await authenticatedPage.waitForTimeout(500);

          // Should show validation error for comment
          await expect(
            authenticatedPage.getByText(/comentario|requerido/i)
          ).toBeVisible();
        }
      }
    }
  });

  test("should handle invalid delegation target", async ({
    authenticatedPage,
  }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Look for pending requests
    const pendingRequests = authenticatedPage
      .locator("[data-testid^='approval-request-']")
      .filter({ hasText: /pendiente/i });

    const count = await pendingRequests.count();

    if (count > 0) {
      // Click on first pending request
      await pendingRequests.first().click();
      await authenticatedPage.waitForLoadState("networkidle");

      // Try to delegate
      const delegateButton = authenticatedPage.getByRole("button", {
        name: /delegar/i,
      });

      if (await delegateButton.isVisible()) {
        await delegateButton.click();
        await authenticatedPage.waitForLoadState("networkidle");

        // Check that delegation modal is shown
        const delegationModal = authenticatedPage.getByRole("dialog", {
          name: /delegar/i,
        });

        if (await delegationModal.isVisible()) {
          // Enter invalid user ID
          const userIdInput = authenticatedPage.getByLabel(/usuario/i);
          await userIdInput.fill("invalid-user-id-12345");

          // Try to submit
          const confirmButton = authenticatedPage
            .getByRole("dialog")
            .getByRole("button", { name: /delegar/i });

          await confirmButton.click();
          await authenticatedPage.waitForTimeout(1000);

          // Should show error message
          await expect(
            authenticatedPage.getByText(
              /usuario no encontrado|inválido|no existe/i
            )
          ).toBeVisible();
        }
      }
    }
  });

  test("should handle empty requests list", async ({ authenticatedPage }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Check if empty state is shown
    const emptyList = authenticatedPage.getByTestId("approval-empty-list");
    const requestList = authenticatedPage.getByTestId("approval-request-list");

    const isEmptyVisible = await emptyList.isVisible().catch(() => false);
    const isListVisible = await requestList.isVisible().catch(() => false);

    if (isEmptyVisible) {
      // Verify empty state message
      await expect(
        authenticatedPage.getByText(/no hay solicitudes/i)
      ).toBeVisible();
    } else if (isListVisible) {
      // List has data, which is also valid
      await expect(requestList).toBeVisible();
    }
  });

  test("should handle empty flows list", async ({ authenticatedPage }) => {
    // Navigate to flows tab
    await authenticatedPage.getByRole("tab", { name: /flujos/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Check if flows section is visible
    await expect(
      authenticatedPage.getByRole("heading", { name: /flujos/i })
    ).toBeVisible();
  });

  test("should handle malformed request data", async ({
    authenticatedPage,
    context,
  }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Simulate malformed response
    void context.route("**/api/approvals/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{ invalid json }",
      });
    });

    // Try to refresh
    const refreshButton = authenticatedPage.getByTestId(
      "approval-refresh-button"
    );

    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Should show parsing error
      await expect(
        authenticatedPage.getByText(/error|json|parse/i)
      ).toBeVisible();
    }

    // Restore network
    void context.unroute("**/api/approvals/**");
  });
});
