/**
 * E2E Tests for Tasks Webhooks
 * Tests webhook configuration, creation, and management
 */

import { test, expect } from "@playwright/test";

test.describe("Tasks Webhooks E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should navigate to webhooks settings", async ({ page }) => {
    await page.goto("/tasks/webhooks");
    await expect(page.locator("h2")).toContainText("Webhooks de Tareas");
  });

  test("should create a new webhook", async ({ page }) => {
    await page.goto("/tasks/webhooks");

    await page.click('button:has-text("Nuevo Webhook")');
    
    await page.fill('input[id="name"]', "Test Webhook");
    await page.fill('input[id="url"]', "https://webhook.site/test");
    await page.click('button[id="event_type"]');
    await page.click('text=Tarea Creada');

    await page.click('button:has-text("Crear")');

    await expect(page.locator("text=Webhook creado exitosamente")).toBeVisible();
    await expect(page.locator("text=Test Webhook")).toBeVisible();
  });

  test("should test a webhook", async ({ page }) => {
    await page.goto("/tasks/webhooks");

    const testButton = page.locator('button:has-text("Probar")').first();
    await testButton.click();

    await expect(
      page.locator("text=Webhook probado exitosamente")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should toggle webhook status", async ({ page }) => {
    await page.goto("/tasks/webhooks");

    const toggle = page.locator('button[role="switch"]').first();
    const initialState = await toggle.getAttribute("aria-checked");

    await toggle.click();

    const newState = await toggle.getAttribute("aria-checked");
    expect(newState).not.toBe(initialState);
  });

  test("should edit a webhook", async ({ page }) => {
    await page.goto("/tasks/webhooks");

    await page.locator('button[aria-label="Edit"]').first().click();

    await page.fill('input[id="name"]', "Updated Webhook");
    await page.click('button:has-text("Actualizar")');

    await expect(page.locator("text=Webhook actualizado exitosamente")).toBeVisible();
    await expect(page.locator("text=Updated Webhook")).toBeVisible();
  });

  test("should delete a webhook", async ({ page }) => {
    await page.goto("/tasks/webhooks");

    page.on("dialog", (dialog) => dialog.accept());
    
    await page.locator('button[aria-label="Delete"]').first().click();

    await expect(page.locator("text=Webhook eliminado exitosamente")).toBeVisible();
  });

  test("should display available events", async ({ page }) => {
    await page.goto("/tasks/webhooks");

    await expect(page.locator("text=Eventos Disponibles")).toBeVisible();
    await expect(page.locator("text=task.created")).toBeVisible();
    await expect(page.locator("text=task.assigned")).toBeVisible();
    await expect(page.locator("text=task.completed")).toBeVisible();
  });
});
