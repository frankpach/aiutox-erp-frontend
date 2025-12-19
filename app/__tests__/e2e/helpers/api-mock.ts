/**
 * API mocking helpers for E2E tests
 * These can be used to mock API responses when needed
 */

import type { Page } from "@playwright/test";

/**
 * Mock API responses using route interception
 */
export async function setupApiMocks(page: Page) {
  // Mock saved filters API
  await page.route("**/api/v1/views/filters**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === "GET" && !url.includes("/api/v1/views/filters/")) {
      // List filters
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "filter-1",
              tenant_id: "tenant-1",
              name: "Usuarios Activos",
              description: "Filtro para usuarios activos",
              module: "users",
              filters: { is_active: { operator: "eq", value: true } },
              is_default: true,
              is_shared: false,
              created_by: "admin-user-id",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "filter-2",
              tenant_id: "tenant-1",
              name: "Mi Filtro",
              description: null,
              module: "users",
              filters: { email: { operator: "contains", value: "@example.com" } },
              is_default: false,
              is_shared: false,
              created_by: "admin-user-id",
              created_at: "2025-01-02T00:00:00Z",
              updated_at: "2025-01-02T00:00:00Z",
            },
          ],
          meta: {
            total: 2,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        }),
      });
    } else if (method === "POST") {
      // Create filter
      const requestBody = await route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: `filter-${Date.now()}`,
            tenant_id: "tenant-1",
            name: requestBody.name,
            description: requestBody.description || null,
            module: requestBody.module,
            filters: requestBody.filters,
            is_default: requestBody.is_default || false,
            is_shared: requestBody.is_shared || false,
            created_by: "admin-user-id",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          meta: null,
          error: null,
        }),
      });
    } else {
      // Continue with actual request
      await route.continue();
    }
  });

  // Mock users API
  await page.route("**/api/v1/users**", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "user-1",
              email: "user1@example.com",
              full_name: "User One",
              is_active: true,
              created_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "user-2",
              email: "user2@example.com",
              full_name: "User Two",
              is_active: false,
              created_at: "2025-01-02T00:00:00Z",
            },
          ],
          meta: {
            total: 2,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        }),
      });
    } else {
      await route.continue();
    }
  });
}


