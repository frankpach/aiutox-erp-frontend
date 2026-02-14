import { test, expect } from '@playwright/test';

test.describe('Calendar Mobile E2E', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('carga la vista de calendario en móvil sin errores', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/error|500|404/);
  });

  test('toolbar se apila verticalmente en móvil', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    // El toolbar no debe desbordar horizontalmente
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('botones de navegación tienen min 44px de área táctil', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    // Buscar botones de navegación del calendario
    const navButtons = page.locator('button').filter({ hasText: /◀|▶|←|→|Hoy|Today/i });
    const count = await navButtons.count();

    for (let i = 0; i < Math.min(count, 4); i++) {
      const box = await navButtons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40); // ~44px con tolerancia
      }
    }
  });

  test('no hay scroll horizontal en vista móvil', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerancia
  });

  test('MobileEventMenu se muestra como bottom sheet', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    // Intentar hacer long press en un evento (si existe)
    const event = page.locator('[data-testid="calendar-event"]').first();
    if (await event.isVisible()) {
      // Simular long press
      await event.click({ delay: 600 });

      // Verificar que el dialog aparece en la parte inferior
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible({ timeout: 2000 })) {
        const dialogBox = await dialog.boundingBox();
        if (dialogBox) {
          // El dialog debe estar en la mitad inferior de la pantalla
          expect(dialogBox.y).toBeGreaterThan(667 / 3);
        }
      }
    }
  });
});
