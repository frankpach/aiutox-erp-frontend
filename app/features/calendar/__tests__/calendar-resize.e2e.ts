/**
 * E2E Tests for Calendar Event Resize Functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Calendar Event Resize", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to calendar page
    await page.goto("/calendar");
    
    // Wait for calendar to load
    await page.waitForSelector('[data-slot="month-view"]');
    
    // Create a test event for resize testing
    await page.click('[data-testid="create-event-button"]');
    await page.fill('[data-testid="event-title-input"]', "Test Resize Event");
    await page.fill('[data-testid="event-start-time"]', "10:00");
    await page.fill('[data-testid="event-end-time"]', "11:00");
    await page.click('[data-testid="save-event-button"]');
    
    // Wait for event to appear
    await page.waitForSelector('[data-calendar-event="true"]:has-text("Test Resize Event")');
  });

  test("should resize event by dragging right handle", async ({ page }) => {
    // Find the test event
    const event = page.locator('[data-calendar-event="true"]:has-text("Test Resize Event")');
    
    // Find the right resize handle
    const rightHandle = event.locator('[data-resize="right"]');
    
    // Drag the right handle to extend the event by 1 hour
    const targetTime = page.locator('[data-time="11:00"]');
    await rightHandle.dragTo(targetTime);
    
    // Verify the event was resized
    await expect(event).toHaveAttribute('data-end-time', '11:00');
    
    // Verify a success toast appears
    await expect(page.locator('[data-testid="toast"]')).toContainText('actualizado');
  });

  test("should resize event by dragging left handle", async ({ page }) => {
    // Find the test event
    const event = page.locator('[data-calendar-event="true"]:has-text("Test Resize Event")');
    
    // Find the left resize handle
    const leftHandle = event.locator('[data-resize="left"]');
    
    // Drag the left handle to start the event 30 minutes earlier
    const targetTime = page.locator('[data-time="09:30"]');
    await leftHandle.dragTo(targetTime);
    
    // Verify the event was resized
    await expect(event).toHaveAttribute('data-start-time', '09:30');
    
    // Verify a success toast appears
    await expect(page.locator('[data-testid="toast"]')).toContainText('actualizado');
  });

  test("should prevent invalid resize (end before start)", async ({ page }) => {
    // Find the test event
    const event = page.locator('[data-calendar-event="true"]:has-text("Test Resize Event")');
    
    // Find the left resize handle
    const leftHandle = event.locator('[data-resize="left"]');
    
    // Try to drag left handle past the end time (should fail)
    const targetTime = page.locator('[data-time="12:00"]'); // After current end time
    await leftHandle.dragTo(targetTime);
    
    // Verify error toast appears
    await expect(page.locator('[data-testid="toast"]')).toContainText('fecha de inicio debe ser menor');
    
    // Verify event was not changed
    await expect(event).toHaveAttribute('data-start-time', '10:00');
  });

  test("should show resize handles on hover", async ({ page }) => {
    // Find the test event
    const event = page.locator('[data-calendar-event="true"]:has-text("Test Resize Event")');
    
    // Initially, resize handles should not be visible
    const leftHandle = event.locator('[data-resize="left"]');
    const rightHandle = event.locator('[data-resize="right"]');
    
    await expect(leftHandle).toHaveCSS('opacity', '0');
    await expect(rightHandle).toHaveCSS('opacity', '0');
    
    // Hover over the event
    await event.hover();
    
    // Resize handles should become visible
    await expect(leftHandle).toHaveCSS('opacity', '1');
    await expect(rightHandle).toHaveCSS('opacity', '1');
    
    // Move mouse away
    await page.mouse.move(0, 0);
    
    // Resize handles should hide again
    await expect(leftHandle).toHaveCSS('opacity', '0');
    await expect(rightHandle).toHaveCSS('opacity', '0');
  });

  test("should not show resize handles for tasks", async ({ page }) => {
    // Create a test task
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[data-testid="task-title-input"]', "Test Task");
    await page.fill('[data-testid="task-due-date"]', "2024-01-01");
    await page.click('[data-testid="save-task-button"]');
    
    // Find the test task
    const task = page.locator('[data-calendar-event="true"]:has-text("Test Task")');
    
    // Task should not have resize handles
    const leftHandle = task.locator('[data-resize="left"]');
    const rightHandle = task.locator('[data-resize="right"]');
    
    await expect(leftHandle).toHaveCount(0);
    await expect(rightHandle).toHaveCount(0);
    
    // But task should still be draggable for moving
    await expect(task).toHaveAttribute('data-draggable', 'true');
  });

  test("should resize multi-day event correctly", async ({ page }) => {
    // Create a multi-day event
    await page.click('[data-testid="create-event-button"]');
    await page.fill('[data-testid="event-title-input"]', "Multi-Day Event");
    await page.fill('[data-testid="event-start-date"]', "2024-01-01");
    await page.fill('[data-testid="event-end-date"]', "2024-01-03");
    await page.click('[data-testid="save-event-button"]');
    
    // Find the multi-day event
    const event = page.locator('[data-calendar-event="true"]:has-text("Multi-Day Event")');
    
    // Should only show left handle on first day
    const firstDayEvent = event.first();
    const leftHandle = firstDayEvent.locator('[data-resize="left"]');
    const rightHandle = firstDayEvent.locator('[data-resize="right"]');
    
    await expect(leftHandle).toBeVisible();
    await expect(rightHandle).toHaveCount(0); // Should not have right handle on first day
    
    // Should only show right handle on last day
    const lastDayEvent = event.last();
    const leftHandleLast = lastDayEvent.locator('[data-resize="left"]');
    const rightHandleLast = lastDayEvent.locator('[data-resize="right"]');
    
    await expect(leftHandleLast).toHaveCount(0); // Should not have left handle on last day
    await expect(rightHandleLast).toBeVisible();
  });

  test("should preserve time when resizing across days", async ({ page }) => {
    // Create an event with specific time
    await page.click('[data-testid="create-event-button"]');
    await page.fill('[data-testid="event-title-input"]', "Time Preserve Test");
    await page.fill('[data-testid="event-start-time"]', "14:30");
    await page.fill('[data-testid="event-end-time"]', "15:30");
    await page.click('[data-testid="save-event-button"]');
    
    // Find the event
    const event = page.locator('[data-calendar-event="true"]:has-text("Time Preserve Test")');
    
    // Drag left handle to next day
    const leftHandle = event.locator('[data-resize="left"]');
    const nextDay = page.locator('[data-date="2024-01-02"]');
    await leftHandle.dragTo(nextDay);
    
    // Verify time is preserved (should be 14:30 on the new day)
    await expect(event).toHaveAttribute('data-start-time', '2024-01-02T14:30:00Z');
  });

  test("should work on mobile with touch gestures", async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Find the test event
    const event = page.locator('[data-calendar-event="true"]:has-text("Test Resize Event")');
    
    // Find the right resize handle
    const rightHandle = event.locator('[data-resize="right"]');
    
    // Perform touch drag using Playwright's touch API
    await rightHandle.dispatchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 }]
    });
    
    await rightHandle.dispatchEvent('touchmove', {
      touches: [{ clientX: 200, clientY: 100 }] // Move right by 100px
    });
    
    await rightHandle.dispatchEvent('touchend', {});
    
    // Verify the event was resized
    await expect(event).toHaveAttribute('data-end-time', '11:30');
  });

  test("should show appropriate cursor on resize handles", async ({ page }) => {
    // Find the test event
    const event = page.locator('[data-calendar-event="true"]:has-text("Test Resize Event")');
    
    // Find resize handles
    const leftHandle = event.locator('[data-resize="left"]');
    const rightHandle = event.locator('[data-resize="right"]');
    
    // Check cursor styles
    await expect(leftHandle).toHaveCSS('cursor', 'ew-resize');
    await expect(rightHandle).toHaveCSS('cursor', 'ew-resize');
  });
});

test.describe("Calendar Resize Performance", () => {
  test("should resize within performance limits", async ({ page }) => {
    // Navigate to calendar
    await page.goto("/calendar");
    
    // Create multiple test events
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="create-event-button"]');
      await page.fill('[data-testid="event-title-input"]', `Performance Test ${i}`);
      await page.fill('[data-testid="event-start-time"]', `${10 + i}:00`);
      await page.fill('[data-testid="event-end-time"]', `${11 + i}:00`);
      await page.click('[data-testid="save-event-button"]');
    }
    
    // Measure resize performance
    const startTime = Date.now();
    
    const event = page.locator('[data-calendar-event="true"]:has-text("Performance Test 2")');
    const rightHandle = event.locator('[data-resize="right"]');
    const targetTime = page.locator('[data-time="13:00"]');
    
    await rightHandle.dragTo(targetTime);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within 100ms
    expect(duration).toBeLessThan(100);
    
    // Verify success
    await expect(page.locator('[data-testid="toast"]')).toContainText('actualizado');
  });
});
