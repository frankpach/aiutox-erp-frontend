/**
 * E2E Test: Config Sidebar Navigation
 *
 * Verifica que todos los enlaces de configuración aparezcan correctamente en el sidebar
 * después del login.
 *
 * Tests:
 * 1. Login exitoso
 * 2. Sidebar visible
 * 3. Categoría "Configuración" presente
 * 4. Todos los subitems de configuración visibles:
 *    - Usuarios
 *    - Tema y Apariencia
 *    - Módulos del Sistema
 *    - Roles y Permisos
 *    - Notificaciones
 *    - Integraciones
 *    - Importar / Exportar
 *    - Auditoría
 */

import { test, expect } from "@playwright/test";

// Configuración del test
test.use({
  browserName: "chromium",
  headless: false, // Run in headed mode to see the browser
});

// Credenciales de prueba
const ADMIN_EMAIL = "admin@aiutox.com";
const ADMIN_PASSWORD = "password";

// ✅ Usar variable de entorno o valor por defecto (igual que playwright.config.ts)
// IMPORTANTE: Este debe ser http://127.0.0.1:3000 (puerto 3000, NO 3002)
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || process.env.FRONTEND_URL || "http://127.0.0.1:3000";

// Log para debugging
console.log(`🔧 FRONTEND_URL configurado: ${FRONTEND_URL}`);

// Helper para logs con timestamp
function logStep(step: string) {
  const isoString = new Date().toISOString();
  const timePart = isoString.split("T")[1];
  const timestamp = timePart ? timePart.split(".")[0] : new Date().toTimeString().split(" ")[0];
  console.log(`[${timestamp}] 🔍 ${step}`);
}

test.describe("Config Sidebar Navigation", () => {
  test("Verificar que todos los enlaces de configuración aparecen en el sidebar", async ({ page }) => {
    logStep("Iniciando test de navegación del sidebar de configuración...");

    // 1. Navegar a la página de login
    logStep(`Navegando a la página de login... (${FRONTEND_URL})`);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState("networkidle");

    // 2. Verificar que estamos en login
    logStep("Verificando que estamos en la página de login...");
    const loginUrl = page.url();
    expect(loginUrl).toContain("/login");

    // 3. Hacer login
    logStep(`Haciendo login con ${ADMIN_EMAIL}...`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);

    // Click en el botón de login
    await page.click('button[type="submit"]');

    // Esperar a que la navegación termine (debería ir al dashboard)
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Esperar a que el sidebar cargue

    // 4. Verificar que el login fue exitoso (debería estar en el dashboard)
    logStep("Verificando que el login fue exitoso...");
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/login");
    logStep(`✅ Login exitoso. URL actual: ${currentUrl}`);

    // 5. Verificar que el sidebar es visible
    logStep("Verificando que el sidebar es visible...");
    const sidebar = page.locator('aside[role="navigation"]');
    await expect(sidebar).toBeVisible({ timeout: 5000 });
    logStep("✅ Sidebar visible");

    // 6. Buscar la categoría "Configuración"
    logStep('Buscando categoría "Configuración"...');

    // Esperar a que aparezca algún texto "Configuración" en el sidebar
    const configCategory = page.locator('aside[role="navigation"]').getByText("Configuración", { exact: false });
    await expect(configCategory).toBeVisible({ timeout: 5000 });
    logStep('✅ Categoría "Configuración" encontrada');

    // 7. Expandir la categoría de Configuración si está colapsada
    logStep("Expandiendo categoría de Configuración...");
    await configCategory.click();
    await page.waitForTimeout(500); // Esperar animación

    // 8. Verificar que todos los subitems de configuración estén presentes
    logStep("Verificando todos los enlaces de configuración...");

    const expectedLinks = [
      { text: "Usuarios", href: "/users" },
      { text: "Tema y Apariencia", href: "/config/theme" },
      { text: "Módulos del Sistema", href: "/config/modules" },
      { text: "Roles y Permisos", href: "/config/roles" },
      { text: "Notificaciones", href: "/config/notifications" },
      { text: "Integraciones", href: "/config/integrations" },
      { text: "Importar / Exportar", href: "/config/import-export" },
      { text: "Auditoría", href: "/config/audit" },
    ];

    let foundLinksCount = 0;
    let missingLinks: string[] = [];

    for (const { text, href } of expectedLinks) {
      logStep(`  Buscando enlace: "${text}" (${href})...`);

      try {
        // Buscar el enlace por texto dentro del sidebar
        const link = page.locator('aside[role="navigation"]').getByRole("link", { name: text });

        // Verificar que sea visible
        await expect(link).toBeVisible({ timeout: 3000 });

        // Verificar que tenga el href correcto
        const actualHref = await link.getAttribute("href");
        expect(actualHref).toBe(href);

        logStep(`    ✅ "${text}" encontrado y correcto`);
        foundLinksCount++;
      } catch (error) {
        logStep(`    ❌ "${text}" NO encontrado o incorrecto`);
        missingLinks.push(text);
      }
    }

    // 9. Resumen final
    logStep("\n========================================");
    logStep("RESUMEN DE VERIFICACIÓN");
    logStep("========================================");
    logStep(`Total de enlaces esperados: ${expectedLinks.length}`);
    logStep(`Enlaces encontrados: ${foundLinksCount}`);
    logStep(`Enlaces faltantes: ${missingLinks.length}`);

    if (missingLinks.length > 0) {
      logStep("\n❌ Enlaces faltantes:");
      missingLinks.forEach(link => logStep(`  - ${link}`));
    } else {
      logStep("\n✅ TODOS los enlaces de configuración están presentes!");
    }

    // 10. Tomar screenshot final
    await page.screenshot({ path: "test-results/config-sidebar-verification.png", fullPage: true });
    logStep("📸 Screenshot guardado en test-results/config-sidebar-verification.png");

    // 11. Esperar un poco para inspección visual
    logStep("\nEsperando 5 segundos para inspección visual...");
    await page.waitForTimeout(5000);

    // 12. Assertion final: todos los enlaces deben estar presentes
    expect(foundLinksCount).toBe(expectedLinks.length);
    expect(missingLinks.length).toBe(0);

    logStep("\n🎉 TEST COMPLETADO EXITOSAMENTE!");
  });

  test("Verificar navegación funcional de los enlaces de configuración", async ({ page }) => {
    logStep("\nIniciando test de navegación funcional...");

    // 1. Login
    logStep("Haciendo login...");
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    logStep("✅ Login completado");

    // 2. Expandir configuración
    logStep('Expandiendo categoría "Configuración"...');
    const configCategory = page.locator('aside[role="navigation"]').getByText("Configuración", { exact: false });
    await configCategory.click();
    await page.waitForTimeout(500);

    // 3. Probar navegación a cada página
    const linksToTest = [
      { text: "Tema y Apariencia", href: "/config/theme" },
      { text: "Módulos del Sistema", href: "/config/modules" },
      { text: "Roles y Permisos", href: "/config/roles" },
    ];

    for (const { text, href } of linksToTest) {
      logStep(`\nProbando navegación a "${text}"...`);

      // Click en el enlace
      const link = page.locator('aside[role="navigation"]').getByRole("link", { name: text });
      await link.click();

      // Esperar a que la navegación termine
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      // Verificar que la URL cambió correctamente
      const currentUrl = page.url();
      expect(currentUrl).toContain(href);

      logStep(`  ✅ Navegación exitosa a ${href}`);
      logStep(`  URL actual: ${currentUrl}`);
    }

    logStep("\n✅ Todas las navegaciones funcionan correctamente!");
  });
});

