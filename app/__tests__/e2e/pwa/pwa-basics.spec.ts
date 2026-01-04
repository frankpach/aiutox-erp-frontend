/**
 * E2E Tests for PWA Basic Functionality
 * Tests Service Worker registration, manifest, and installability
 *
 * Run with: npx playwright test pwa-basics --project=pwa --headed
 */
import { test, expect } from '@playwright/test';

test.describe('PWA - Basics', () => {
  test.beforeEach(async ({ page }) => {
    // Enable verbose logging
    page.on('console', (msg) => {
      if (msg.type() === 'log' && msg.text().includes('[SW]')) {
        console.log(`🔧 ${msg.text()}`);
      }
    });
  });

  test('should register service worker', async ({ page, context }) => {
    await page.goto('/');

    // Wait for SW registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        return !!registration;
      }
      return false;
    });

    expect(swRegistered).toBe(true);
    console.log('✅ Service Worker registered');
  });

  test('should have valid web manifest', async ({ page }) => {
    await page.goto('/');

    // Check manifest link exists
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest');

    // Fetch and validate manifest
    const manifestUrl = await manifestLink.getAttribute('href');
    const response = await page.goto(manifestUrl!);
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest).toBeDefined();
    expect(manifest.name).toBe('AiutoX ERP');
    expect(manifest.short_name).toBe('AiutoX');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);

    console.log('✅ Manifest is valid');
  });

  test('should have PWA meta tags', async ({ page }) => {
    await page.goto('/');

    // Check theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#3C3A47');

    // Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    const viewportContent = await viewport.getAttribute('content');
    expect(viewportContent).toContain('width=device-width');

    // Check apple mobile web app tags
    const appleCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleCapable).toHaveAttribute('content', 'yes');

    console.log('✅ PWA meta tags present');
  });

  test('should have required icons', async ({ page }) => {
    await page.goto('/');

    // Check apple touch icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    const iconHref = await appleTouchIcon.getAttribute('href');
    expect(iconHref).toBeTruthy();

    // Verify icon is accessible (if exists)
    if (iconHref) {
      const iconResponse = await page.goto(iconHref).catch(() => null);
      if (iconResponse) {
        expect(iconResponse.status()).toBe(200);
        expect(iconResponse.headers()['content-type']).toContain('image');
      }
    }

    console.log('✅ Icons configuration present');
  });

  test('should be installable', async ({ page }) => {
    await page.goto('/');

    // Check if PWA criteria are met
    const isPWAReady = await page.evaluate(() => {
      return new Promise((resolve) => {
        const criteria = {
          hasManifest: !!document.querySelector('link[rel="manifest"]'),
          hasServiceWorker: 'serviceWorker' in navigator,
          hasIcons: !!document.querySelector('link[rel="apple-touch-icon"]'),
          isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        };

        resolve(criteria);
      });
    });

    expect(isPWAReady).toMatchObject({
      hasManifest: true,
      hasServiceWorker: true,
      hasIcons: true,
      isHTTPS: true,
    });

    console.log('✅ PWA installability criteria met');
  });
});

















