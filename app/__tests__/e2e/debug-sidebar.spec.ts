/**
 * E2E Test Simple: Ver qué hay en el sidebar
 *
 * Test de debugging para ver exactamente qué contiene el sidebar después del login
 */

import { test, expect } from "@playwright/test";

test.use({
  browserName: "chromium",
  headless: false,
});

const ADMIN_EMAIL = "admin@aiutox.com";
const ADMIN_PASSWORD = "password";
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

test("Debug: Ver contenido del sidebar", async ({ page }) => {
  console.log(`🔧 Navegando a: ${FRONTEND_URL}/login`);

  // 1. Login
  await page.goto(`${FRONTEND_URL}/login`);
  await page.waitForLoadState("networkidle");

  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000); // Esperar a que cargue completamente

  console.log(`✅ Login completado. URL: ${page.url()}`);

  // 2. Ver si el sidebar existe
  const sidebar = page.locator('aside[role="navigation"]');
  const sidebarExists = await sidebar.count();
  console.log(`Sidebar encontrado: ${sidebarExists > 0 ? 'SÍ' : 'NO'}`);

  if (sidebarExists > 0) {
    // 3. Obtener TODO el texto del sidebar
    const sidebarText = await sidebar.innerText();
    console.log("\n==================== CONTENIDO DEL SIDEBAR ====================");
    console.log(sidebarText);
    console.log("===============================================================\n");

    // 4. Buscar elementos clickeables (botones y links)
    const buttons = await sidebar.locator('button').all();
    const links = await sidebar.locator('a').all();

    console.log(`\nBotones encontrados: ${buttons.length}`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].innerText();
      console.log(`  Button ${i + 1}: "${text}"`);
    }

    console.log(`\nEnlaces encontrados: ${links.length}`);
    for (let i = 0; i < Math.min(links.length, 15); i++) {
      const text = await links[i].innerText();
      const href = await links[i].getAttribute('href');
      console.log(`  Link ${i + 1}: "${text}" -> ${href}`);
    }
  }

  // 5. Screenshot
  await page.screenshot({ path: "test-results/sidebar-debug.png", fullPage: true });
  console.log("\n📸 Screenshot guardado en: test-results/sidebar-debug.png");

  // 6. Esperar para inspección visual
  console.log("\n⏸️  Esperando 10 segundos para inspección visual...");
  await page.waitForTimeout(10000);

  console.log("\n✅ Test de debug completado!");
});

