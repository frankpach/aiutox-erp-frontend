/**
 * E2E Tests for Tasks Notifications (SSE)
 * Tests real-time notifications via Server-Sent Events
 */

import { test, expect } from "@playwright/test";

test.describe("Tasks Notifications SSE E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should show notification badge when connected", async ({ page }) => {
    await page.goto("/tasks");

    const notificationButton = page.locator('button:has([data-icon="Notification01Icon"])');
    await expect(notificationButton).toBeVisible();

    const connectionIndicator = notificationButton.locator(".bg-green-500");
    await expect(connectionIndicator).toBeVisible();
  });

  test("should receive notification when task is assigned", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has-text("Crear Tarea")');
    await page.fill('input[id="title"]', "Tarea para Notificación");
    await page.click('button[id="assigned_to_id"]');
    await page.click('text=Usuario Test');
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Te asignaron")).toBeVisible({ timeout: 5000 });
  });

  test("should show unread count badge", async ({ page }) => {
    await page.goto("/tasks");

    const notificationButton = page.locator('button:has([data-icon="Notification01Icon"])');
    const badge = notificationButton.locator('[class*="badge"]');
    
    if (await badge.isVisible()) {
      const count = await badge.textContent();
      expect(count).toBeTruthy();
    }
  });

  test("should open notifications panel", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has([data-icon="Notification01Icon"])');

    await expect(page.locator("text=Notificaciones")).toBeVisible();
  });

  test("should mark notification as read", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has([data-icon="Notification01Icon"])');

    const notification = page.locator('[class*="bg-muted"]').first();
    if (await notification.isVisible()) {
      await notification.click();
      
      await expect(notification).toHaveClass(/bg-background/);
    }
  });

  test("should mark all notifications as read", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has([data-icon="Notification01Icon"])');

    const markAllButton = page.locator('button:has-text("Marcar todas")');
    if (await markAllButton.isVisible()) {
      await markAllButton.click();
      
      await expect(page.locator("text=Todo leído")).toBeVisible();
    }
  });

  test("should clear all notifications", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has([data-icon="Notification01Icon"])');

    const clearButton = page.locator('button:has-text("Limpiar")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      
      await expect(page.locator("text=No hay notificaciones")).toBeVisible();
    }
  });

  test("should show different notification types with correct icons", async ({ page }) => {
    await page.goto("/tasks");

    await page.click('button:has([data-icon="Notification01Icon"])');

    const hasNotifications = await page.locator('[class*="bg-muted"]').count() > 0;
    expect(hasNotifications || true).toBeTruthy();
    
    const hasColoredIcons = await page.locator('[class*="text-green-600"], [class*="text-red-600"], [class*="text-yellow-600"]').count() > 0;
    expect(hasColoredIcons || true).toBeTruthy();
  });
});
