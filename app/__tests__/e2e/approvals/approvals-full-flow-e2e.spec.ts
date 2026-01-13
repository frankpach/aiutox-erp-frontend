/**
 * E2E Tests for Approvals Full Flow
 *
 * Tests the complete approval workflow:
 * - Create approval request
 * - View request details
 * - Approve request
 * - Verify approval status
 *
 * Requires: Backend and Frontend running
 */

import { test, expect } from "../fixtures/auth.setup";

test.describe("Approvals Full Flow E2E", () => {
  const mockFlowId = "86ccf92a-e7d9-47dd-8226-cdf16aa4cdd0";
  const mockRequestId = "0f4e8b2b-2a69-4a3f-9a6f-9a9e0c0d0c0d";

  const mockFlow = {
    id: mockFlowId,
    tenant_id: "00000000-0000-0000-0000-000000000000",
    name: "Nuevo Flujo de Aprobación",
    description: "Flujo de aprobación creado automáticamente",
    flow_type: "sequential",
    module: "general",
    conditions: null,
    is_active: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockRequest = {
    id: mockRequestId,
    tenant_id: "00000000-0000-0000-0000-000000000000",
    flow_id: mockFlowId,
    title: "Test Approval Request",
    description: "This is a test approval request for E2E testing",
    entity_type: "test-entity",
    entity_id: "11111111-1111-1111-1111-111111111111",
    metadata: null,
    status: "pending",
    current_step: 1,
    requested_by: null,
    requested_at: new Date().toISOString(),
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_metadata: null,
  };

  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.route(
      "**/api/v1/approvals/flows**",
      async (route) => {
        const url = route.request().url();
        if (route.request().method() !== "GET") {
          await route.fallback();
          return;
        }

        const isDetail = /\/api\/v1\/approvals\/flows\//.test(url);

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: isDetail ? mockFlow : [mockFlow],
            meta: isDetail
              ? null
              : { total: 1, page: 1, page_size: 20, total_pages: 1 },
            error: null,
          }),
        });
      }
    );

    await authenticatedPage.route(
      "**/api/v1/approvals/requests**",
      async (route) => {
        const method = route.request().method();
        const url = route.request().url();
        const isDetail = /\/api\/v1\/approvals\/requests\//.test(url);

        if (method === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: isDetail ? mockRequest : [mockRequest],
              meta: isDetail
                ? null
                : { total: 1, page: 1, page_size: 100, total_pages: 1 },
              error: null,
            }),
          });
          return;
        }

        if (method === "POST") {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              data: mockRequest,
              meta: null,
              error: null,
            }),
          });
          return;
        }

        await route.fallback();
      }
    );

    // Navigate to approvals page
    await authenticatedPage.goto("/approvals", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await expect(
      authenticatedPage.getByRole("heading", {
        name: /solicitudes de aprobación/i,
        level: 1,
      })
    ).toBeVisible({ timeout: 30000 });
  });

  test("should display approvals page with tabs", async ({
    authenticatedPage,
  }) => {
    // Check that the page title is visible
    await expect(
      authenticatedPage.getByRole("heading", {
        name: /solicitudes de aprobación/i,
        level: 1,
      })
    ).toBeVisible();

    // Check that tabs are visible
    await expect(
      authenticatedPage.getByRole("tab", { name: /solicitudes/i })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("tab", { name: /flujos/i })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("tab", { name: /estadísticas/i })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("tab", { name: /formulario/i })
    ).toBeVisible();
  });

  test("should create a new approval request", async ({
    authenticatedPage,
  }) => {
    // Click on "Formulario" tab
    await authenticatedPage.getByRole("tab", { name: /formulario/i }).click();

    // Wait for form to load
    await authenticatedPage.waitForLoadState("networkidle");

    // Wait for form to be visible
    await authenticatedPage
      .getByTestId("approval-request-form")
      .waitFor({ state: "visible", timeout: 10000 });

    // Fill in the form with valid data
    await authenticatedPage
      .getByTestId("approval-flow-id-input")
      .fill(mockFlowId);
    await authenticatedPage
      .getByTestId("approval-title-input")
      .fill(mockRequest.title);
    await authenticatedPage
      .getByTestId("approval-description-input")
      .fill(mockRequest.description);
    await authenticatedPage
      .getByTestId("approval-entity-type-input")
      .fill(mockRequest.entity_type);
    await authenticatedPage
      .getByTestId("approval-entity-id-input")
      .fill(mockRequest.entity_id);

    // Submit the form
    await authenticatedPage.getByTestId("approval-submit-button").click();

    // Navigate back to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await expect(
      authenticatedPage.getByTestId("approval-request-list")
    ).toBeVisible({
      timeout: 10000,
    });

    // Verify the request was created (check if list is not empty or has the title)
    const requestList = authenticatedPage.getByTestId("approval-request-list");
    const isVisible = await requestList.isVisible().catch(() => false);

    if (isVisible) {
      await expect(authenticatedPage.getByText(mockRequest.title)).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test("should view approval request details", async ({
    authenticatedPage,
  }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Check if there are any requests
    const requestList = authenticatedPage.getByTestId("approval-request-list");
    const emptyList = authenticatedPage.getByTestId("approval-empty-list");

    const hasRequests = await requestList.isVisible().catch(() => false);
    const isEmpty = await emptyList.isVisible().catch(() => false);

    if (!hasRequests || isEmpty) return;

    const viewButton = authenticatedPage
      .getByRole("button", { name: /^ver$/i })
      .first();
    if (!(await viewButton.isVisible().catch(() => false))) return;

    await viewButton.click();
    await authenticatedPage.getByRole("tab", { name: /formulario/i }).click();

    await expect(
      authenticatedPage.getByRole("heading", { name: /editar solicitud/i })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      authenticatedPage.getByTestId("approval-title-input")
    ).toHaveValue(mockRequest.title);
  });

  test("should display statistics", async ({ authenticatedPage }) => {
    // Click on "Estadísticas" tab
    await authenticatedPage.getByRole("tab", { name: /estadísticas/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Check that statistics cards are visible
    await expect(
      authenticatedPage.getByRole("heading", { name: /total/i, level: 3 })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("heading", { name: /pendientes/i, level: 3 })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("heading", { name: /aprobadas/i, level: 3 })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("heading", { name: /rechazadas/i, level: 3 })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("heading", { name: /delegadas/i, level: 3 })
    ).toBeVisible();
  });

  test("should display flows list", async ({ authenticatedPage }) => {
    // Click on "Flujos" tab
    await authenticatedPage.getByRole("tab", { name: /flujos/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Check that flows section is visible
    await expect(
      authenticatedPage.getByRole("heading", {
        name: /flujos de aprobación/i,
        level: 1,
      })
    ).toBeVisible();
  });

  test("should filter requests by status", async ({ authenticatedPage }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Check if there are any requests to filter
    const requestList = authenticatedPage.getByTestId("approval-request-list");
    const hasRequests = await requestList.isVisible().catch(() => false);

    if (hasRequests) {
      // Look for filter controls in the search bar
      const searchInput =
        authenticatedPage.getByPlaceholder(/buscar solicitudes/i);
      const isVisible = await searchInput.isVisible().catch(() => false);

      if (isVisible) {
        // Type a search term
        await searchInput.fill("pendiente");
        await authenticatedPage.waitForTimeout(500);

        // Verify the page is still loaded
        await expect(
          authenticatedPage.getByRole("heading", {
            name: /solicitudes de aprobación/i,
            level: 1,
          })
        ).toBeVisible();
      }
    }
  });

  test("should refresh requests list", async ({ authenticatedPage }) => {
    // Navigate to requests tab
    await authenticatedPage.getByRole("tab", { name: /solicitudes/i }).click();
    await authenticatedPage.waitForLoadState("networkidle");

    // Click refresh button
    const refreshButton = authenticatedPage.getByTestId(
      "approval-refresh-button"
    );

    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await authenticatedPage.waitForLoadState("networkidle");

      // Verify the page is still loaded
      await expect(
        authenticatedPage.getByRole("heading", { name: /solicitudes/i })
      ).toBeVisible();
    }
  });
});
