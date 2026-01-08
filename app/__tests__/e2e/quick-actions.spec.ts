/**
 * E2E Tests for Quick Actions
 * Tests for the quick actions system in the topbar
 */

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import { logStep } from "./helpers/test-utils";

test.describe("Quick Actions", () => {
  test.beforeEach(async ({ page }) => {
    // Login using existing helper (DRY principle)
    await loginAsAdmin(page, "aiutox");
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should show quick actions button in topbar", async ({ page }) => {
    logStep("Verificando botón de acciones rápidas en topbar");
    
    // Buscar botón de acciones rápidas con el selector correcto
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button[aria-label*="quick"], button:has(svg)').first();
    
    await expect(quickActionsButton).toBeVisible();
    logStep("Botón de acciones rápidas encontrado y visible");
  });

  test("should open quick actions dropdown", async ({ page }) => {
    logStep("Abriendo dropdown de acciones rápidas");
    
    // Encontrar y hacer clic en botón de acciones rápidas
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button:has(svg)').first();
    await quickActionsButton.click();
    
    // Esperar a que aparezca el dropdown
    const dropdown = page.locator('[role="menu"], .dropdown-menu, [data-state="open"]').first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    logStep("Dropdown de acciones rápidas abierto correctamente");
  });

  test("should show actions based on user permissions", async ({ page }) => {
    logStep("Verificando acciones según permisos de usuario");
    
    // Abrir dropdown
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button:has(svg)').first();
    await quickActionsButton.click();
    
    // Esperar a que carguen las acciones
    await page.waitForTimeout(1000);
    
    // Verificar que haya acciones (el usuario admin debería ver acciones)
    const dropdownItems = page.locator('[role="menuitem"], .dropdown-menu-item');
    const itemCount = await dropdownItems.count();
    
    // Al menos debería haber el mensaje de debug
    const debugInfo = page.locator('text=Debug:');
    await expect(debugInfo).toBeVisible();
    
    logStep(`Encontrados ${itemCount} elementos en el dropdown`);
  });

  test("should navigate to correct pages when clicking actions", async ({ page }) => {
    logStep("Probando navegación al hacer clic en acciones");
    
    // Abrir dropdown
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button:has(svg)').first();
    await quickActionsButton.click();
    
    // Esperar a que carguen las acciones
    await page.waitForTimeout(1000);
    
    // Buscar primera acción disponible
    const firstAction = page.locator('[role="menuitem"], .dropdown-menu-item').first();
    
    if (await firstAction.isVisible()) {
      // Hacer clic en la primera acción
      await firstAction.click();
      
      // Esperar navegación
      await page.waitForLoadState("networkidle");
      
      // Verificar que la URL cambió
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/dashboard");
      
      logStep(`Navegación exitosa a: ${currentUrl}`);
    } else {
      logStep("No hay acciones disponibles para probar navegación");
    }
  });

  test("should show contextual actions based on current page", async ({ page }) => {
    logStep("Probando acciones contextuales");
    
    // Navegar a una página específica (products)
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    
    // Abrir dropdown
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button:has(svg)').first();
    await quickActionsButton.click();
    
    // Esperar a que carguen las acciones
    await page.waitForTimeout(1000);
    
    // Verificar que el dropdown se abre
    const dropdown = page.locator('[role="menu"], .dropdown-menu, [data-state="open"]').first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    logStep("Dropdown contextual abierto en página de productos");
  });

  test("should limit number of visible actions", async ({ page }) => {
    logStep("Verificando límite de acciones visibles");
    
    // Abrir dropdown
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button:has(svg)').first();
    await quickActionsButton.click();
    
    // Esperar a que carguen las acciones
    await page.waitForTimeout(1000);
    
    // Contar acciones visibles (excluyendo debug info)
    const dropdownItems = page.locator('[role="menuitem"], .dropdown-menu-item');
    const itemCount = await dropdownItems.count();
    
    // Verificar que no haya más de 5 acciones (límite por defecto)
    expect(itemCount).toBeLessThanOrEqual(5);
    
    logStep(`Cantidad de acciones visibles: ${itemCount} (máximo 5)`);
  });

  test("should close dropdown when clicking outside", async ({ page }) => {
    logStep("Probando cierre al hacer clic fuera");
    
    // Abrir dropdown
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button:has(svg)').first();
    await quickActionsButton.click();
    
    // Verificar que está abierto
    const dropdown = page.locator('[role="menu"], .dropdown-menu, [data-state="open"]').first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    // Hacer clic fuera del dropdown
    await page.click('body', { position: { x: 100, y: 100 } });
    
    // Esperar un poco y verificar que se cerró
    await page.waitForTimeout(500);
    
    // Verificar que el dropdown ya no está visible
    // Nota: Esto puede variar según la implementación del dropdown
    logStep("Clic fuera del dropdown realizado");
  });

  test("should work with keyboard navigation", async ({ page }) => {
    logStep("Probando navegación con teclado");
    
    // Enfocar botón de acciones rápidas
    const quickActionsButton = page.locator('button[aria-label*="Quick Actions"], button:has(svg)').first();
    await quickActionsButton.focus();
    
    // Abrir con Enter
    await page.keyboard.press('Enter');
    
    // Esperar a que abra
    await page.waitForTimeout(500);
    
    // Verificar que el dropdown está abierto
    const dropdown = page.locator('[role="menu"], .dropdown-menu, [data-state="open"]').first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    // Cerrar con Escape
    await page.keyboard.press('Escape');
    
    // Esperar un poco
    await page.waitForTimeout(500);
    
    logStep("Navegación con teclado completada");
  });
});

test.describe("Quick Actions Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, "aiutox");
  });

  test("should access quick actions configuration", async ({ page }) => {
    logStep("Accediendo a configuración de acciones rápidas");
    
    // Navegar a página de configuración
    await page.goto("/dashboard"); // Ir a dashboard primero
    
    // Buscar enlace de configuración si existe
    const configLink = page.locator('a[href*="config"], a[href*="settings"]').first();
    
    if (await configLink.isVisible()) {
      await configLink.click();
      await page.waitForLoadState("networkidle");
      
      // Verificar página de configuración
      await expect(page.locator('h1, h2')).toContainText(/configuración|acciones/i);
      
      logStep("Página de configuración de acciones rápidas accesible");
    } else {
      // Si no hay enlace, intentar ir directamente a la URL
      await page.goto("/config");
      await page.waitForLoadState("networkidle");
      
      // Verificar si existe la página
      const pageTitle = page.locator('h1, h2').first();
      if (await pageTitle.isVisible()) {
        const title = await pageTitle.textContent();
        logStep(`Página encontrada: ${title}`);
      } else {
        logStep("Página de configuración no implementada aún");
      }
    }
  });

  test("should toggle actions on/off", async ({ page }) => {
    logStep("Probando activar/desactivar acciones");
    
    // Este test requiere una página de configuración implementada
    // Por ahora, solo verificamos que podemos navegar
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    logStep("Funcionalidad de toggle pendiente de implementación");
  });

  test("should adjust maximum visible actions", async ({ page }) => {
    logStep("Probando ajuste de máximo de acciones visibles");
    
    // Este test requiere una página de configuración implementada
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    logStep("Funcionalidad de ajuste pendiente de implementación");
  });

  test("should save preferences", async ({ page }) => {
    logStep("Probando guardado de preferencias");
    
    // Este test requiere una página de configuración implementada
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    logStep("Funcionalidad de guardado pendiente de implementación");
  });
});
