/**
 * E2E Tests para PageLayout
 *
 * Verifica que PageLayout funciona correctamente en el navegador
 */

import { test, expect } from "@playwright/test";

test.describe("PageLayout E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a una página que use PageLayout (ej: dashboard)
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("debe mostrar título de la página", async ({ page }) => {
    // Verificar que el título está visible
    const title = page.locator("h1").first();
    await expect(title).toBeVisible();
  });

  test("debe mostrar breadcrumb cuando existe", async ({ page }) => {
    // Navegar a una página con breadcrumb
    await page.goto("/users/123");
    await page.waitForLoadState("networkidle");

    // Verificar que el breadcrumb está visible
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
  });

  test("debe mostrar estado de carga cuando loading es true", async ({ page }) => {
    // Simular carga lenta
    await page.route("**/api/**", (route) => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto("/dashboard");

    // Verificar que se muestran skeletons
    const skeletons = page.locator(".animate-pulse");
    await expect(skeletons.first()).toBeVisible({ timeout: 5000 });
  });

  test("debe mostrar estado de error cuando hay error", async ({ page }) => {
    // Simular error de API
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Verificar que se muestra mensaje de error
    const errorMessage = page.locator("text=/error/i");
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test("debe mostrar footer sticky cuando se proporciona", async ({ page }) => {
    // Navegar a una página de configuración que usa ConfigPageLayout
    await page.goto("/config/theme");
    await page.waitForLoadState("networkidle");

    // Verificar que el footer sticky está visible
    const footer = page.locator("footer, [class*='sticky']").last();
    await expect(footer).toBeVisible();
  });

  test("debe funcionar correctamente en dark mode", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Activar dark mode desde el header
    const darkModeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"]').first();
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      // Verificar que el layout sigue siendo visible
      const title = page.locator("h1").first();
      await expect(title).toBeVisible();
    }
  });

  test("debe ser responsive en móvil", async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Verificar que el layout sigue siendo funcional
    const title = page.locator("h1").first();
    await expect(title).toBeVisible();
  });
});




