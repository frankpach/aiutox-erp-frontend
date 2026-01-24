/**
 * E2E Tests for Tasks Templates
 * Tests template creation, selection, and task creation from templates
 */

import { test, expect } from "@playwright/test";

test.describe("Tasks Templates E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should display template selector", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has-text("Desde Template")');
    
    await expect(page.locator("text=Selecciona un Template")).toBeVisible();
  });

  test("should create task from template", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has-text("Desde Template")');
    
    await page.locator("text=Usar Template").first().click();

    await page.fill('input[id="title"]', "Tarea desde Template Test");
    await page.click('button:has-text("Crear Tarea")');

    await expect(page.locator("text=Tarea creada desde plantilla correctamente")).toBeVisible();
    await expect(page.locator("text=Tarea desde Template Test")).toBeVisible();
  });

  test("should show template checklist items", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has-text("Desde Template")');
    
    const templateCard = page.locator(".cursor-pointer").first();
    await expect(templateCard.locator("text=pasos")).toBeVisible();
  });

  test("should filter templates by category", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has-text("Desde Template")');

    const categoryBadges = page.locator('[data-testid="template-category"]');
    await expect(categoryBadges.first()).toBeVisible();
  });

  test("should show template usage count", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has-text("Desde Template")');

    await expect(page.locator("text=Usado").first()).toBeVisible();
  });

  test("should cancel template selection", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has-text("Desde Template")');
    await page.click('button:has-text("Cancelar")');

    await expect(page.locator("text=Selecciona un Template")).not.toBeVisible();
  });
});
