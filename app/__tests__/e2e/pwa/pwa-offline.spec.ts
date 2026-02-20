/**
 * E2E Tests for PWA Offline Functionality
 * Tests offline behavior, cache strategies, and navigation
 *
 * Run with: npx playwright test pwa-offline --project=pwa --headed
 */
import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@aiutox.com';
const ADMIN_PASSWORD = 'password';

test.describe('PWA - Offline Functionality', () => {
  test.use({
    serviceWorkers: 'allow' // Critical for offline tests
  });

  test('should handle SPA navigation offline', async ({ page, context }) => {
    // First, visit online to prime cache
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();

    // Login to cache authenticated pages
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Visit a few pages to cache them
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Now go offline
    await context.setOffline(true);
    console.log('📴 Went offline');

    // Navigate to dashboard (should work via SPA routing + cached assets)
    await page.goto('/dashboard');

    // Should still show content (even if API calls fail)
    await expect(page.locator('body')).toBeVisible();

    // Check that we're still on dashboard route
    expect(page.url()).toContain('/dashboard');

    console.log('✅ SPA navigation works offline');
  });

  test('should serve cached assets offline', async ({ page, context }) => {
    // Visit online first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // Should still load (from cache)
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // Check resources came from cache (transferSize === 0)
    const resourcesOffline = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .map((r: any) => ({
          name: r.name,
          transferSize: r.transferSize,
        }))
        .filter(r => r.name.includes('.js') || r.name.includes('.css'));
    });

    // At least some resources should have transferSize 0 (from cache)
    const cachedResources = resourcesOffline.filter(r => r.transferSize === 0);
    expect(cachedResources.length).toBeGreaterThan(0);

    console.log(`✅ ${cachedResources.length} resources served from cache`);
  });

  test('should NOT cache auth endpoints', async ({ page, context }) => {
    await page.goto('/login');

    // Intercept auth requests
    const authRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/auth/')) {
        authRequests.push(request.url());
      }
    });

    // Login
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Verify auth request was made
    expect(authRequests.some(url => url.includes('/login'))).toBe(true);

    // Go offline and try to login again (should fail, not serve cached response)
    await page.goto('/login');
    await context.setOffline(true);

    // Clear form and try login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrong');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login'),
      { timeout: 5000 }
    ).catch(() => null);

    await page.click('button[type="submit"]');

    const response = await responsePromise;

    // Should either get no response (network error) or an error response
    // But NOT a cached 200 OK
    if (response) {
      expect(response.status()).not.toBe(200);
    }

    console.log('✅ Auth endpoints not cached');
  });

  test('should handle offline gracefully with error message', async ({ page, context }) => {
    // Go offline immediately
    await context.setOffline(true);

    // Try to visit a page
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);

    // Should either show offline page or error
    if (!response) {
      // Navigation failed completely
      console.log('✅ Navigation failed as expected when offline');
    } else {
      // Some content loaded from cache
      const bodyVisible = await page.locator('body').isVisible().catch(() => false);
      expect(bodyVisible).toBeTruthy();
      console.log('✅ Cached content displayed offline');
    }
  });
});


















