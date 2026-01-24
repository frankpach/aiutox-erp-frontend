/**
 * E2E Tests for Tasks-Calendar Sync
 * Tests automatic calendar synchronization when creating/updating tasks
 */

import { test, expect } from "@playwright/test";

test.describe("Tasks-Calendar Sync E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should auto-sync task to calendar when created with due date", async ({ page }) => {
    await page.goto("/tasks-create");

    await page.fill('input[id="title"]', "Tarea con Fecha de Vencimiento");
    await page.fill('textarea[id="description"]', "Esta tarea debe sincronizarse con el calendario");
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0] || "";
    
    await page.fill('input[type="date"]', dateString);
    
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Tarea creada exitosamente")).toBeVisible();

    await page.goto("/calendar");
    await expect(page.locator("text=Tarea con Fecha de Vencimiento")).toBeVisible();
  });

  test("should sync task updates to calendar event", async ({ page }) => {
    await page.goto("/tasks");

    await page.locator("text=Tarea con Fecha de Vencimiento").first().click();
    
    await page.click('button:has-text("Editar")');
    
    await page.fill('input[id="title"]', "Tarea Actualizada");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Tarea actualizada exitosamente")).toBeVisible();

    await page.goto("/calendar");
    await expect(page.locator("text=Tarea Actualizada")).toBeVisible();
  });

  test("should enable/disable auto-sync in user preferences", async ({ page }) => {
    await page.goto("/settings/calendar");

    const autoSyncToggle = page.locator('button[role="switch"]:near(text="Auto-sincronizar tareas")');
    await autoSyncToggle.click();

    await expect(page.locator("text=Preferencias actualizadas")).toBeVisible();
  });

  test("should not sync task without due date", async ({ page }) => {
    await page.goto("/tasks-create");

    await page.fill('input[id="title"]', "Tarea Sin Fecha");
    await page.fill('textarea[id="description"]', "Esta tarea no debe sincronizarse");
    
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Tarea creada exitosamente")).toBeVisible();

    await page.goto("/calendar");
    await expect(page.locator("text=Tarea Sin Fecha")).not.toBeVisible();
  });
});
