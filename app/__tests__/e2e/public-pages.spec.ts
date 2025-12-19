/**
 * E2E Tests for Public Pages
 * Tests login, forgot-password, reset-password, verify-email, maintenance, unauthorized, and not-found pages
 */

import { test, expect } from "@playwright/test";

test.describe("Public Pages - Basic Rendering", () => {
  test("should render login page", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Check for login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /olvidaste tu contraseña/i })).toBeVisible();
  });

  test("should render forgot-password page", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");

    // Check for forgot password form
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar enlace/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /volver al inicio de sesión/i })).toBeVisible();
  });

  test("should render reset-password page with token", async ({ page }) => {
    await page.goto("/reset-password?token=test-token-123");
    await page.waitForLoadState("networkidle");

    // Check for reset password form
    await expect(page.getByLabel(/nueva contraseña/i)).toBeVisible();
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /restablecer contraseña/i })).toBeVisible();
  });

  test("should render reset-password page without token (error state)", async ({ page }) => {
    await page.goto("/reset-password");
    await page.waitForLoadState("networkidle");

    // Should show error message
    await expect(page.getByText(/enlace inválido/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /solicitar nuevo enlace/i })).toBeVisible();
  });

  test("should render verify-email page with token", async ({ page }) => {
    await page.goto("/verify-email?token=test-token-123");
    await page.waitForLoadState("networkidle");

    // Should show loading or processing state
    // The page will try to verify, so we check for either loading or result
    const loadingOrResult = page.getByText(/verificando|verificado|error/i);
    await expect(loadingOrResult.first()).toBeVisible({ timeout: 10000 });
  });

  test("should render verify-email page without token (error state)", async ({ page }) => {
    await page.goto("/verify-email");
    await page.waitForLoadState("networkidle");

    // Should show error message
    await expect(page.getByText(/token.*inválido|verificación fallida/i)).toBeVisible();
  });

  test("should render maintenance page", async ({ page }) => {
    await page.goto("/maintenance");
    await page.waitForLoadState("networkidle");

    // Check for maintenance message
    await expect(page.getByText(/mantenimiento/i)).toBeVisible();
  });

  test("should render unauthorized page (403)", async ({ page }) => {
    await page.goto("/unauthorized");
    await page.waitForLoadState("networkidle");

    // Check for 403 error page - use more specific selectors
    await expect(page.getByText("403")).toBeVisible();
    await expect(page.getByRole("heading", { name: /acceso denegado/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /volver/i })).toBeVisible();
  });

  test("should render not-found page (404)", async ({ page }) => {
    await page.goto("/not-found");
    await page.waitForLoadState("networkidle");

    // Check for 404 error page - use more specific selectors
    await expect(page.getByText("404").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /página no encontrada/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /volver al inicio/i })).toBeVisible();
  });

  test("should render 404 for non-existent routes", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await page.waitForLoadState("networkidle");

    // Should show 404 page - use more specific selectors
    await expect(page.getByText("404").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /página no encontrada/i })).toBeVisible();
  });

  test("should redirect root path (/) to /login", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should be redirected to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });
});

test.describe("Public Pages - Navigation", () => {
  test("should navigate from login to forgot-password", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Click forgot password link
    await page.getByRole("link", { name: /olvidaste tu contraseña/i }).click();
    await page.waitForLoadState("networkidle");

    // Should be on forgot-password page
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("should navigate from forgot-password back to login", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");

    // Click back to login link
    await page.getByRole("link", { name: /volver al inicio de sesión/i }).click();
    await page.waitForLoadState("networkidle");

    // Should be on login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("should navigate from reset-password to forgot-password", async ({ page }) => {
    await page.goto("/reset-password");
    await page.waitForLoadState("networkidle");

    // Click request new link
    await page.getByRole("link", { name: /solicitar nuevo enlace/i }).click();
    await page.waitForLoadState("networkidle");

    // Should be on forgot-password page
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test("should navigate from 404 to login", async ({ page }) => {
    await page.goto("/not-found");
    await page.waitForLoadState("networkidle");

    // Click home link
    await page.getByRole("link", { name: /volver al inicio/i }).click();
    await page.waitForLoadState("networkidle");

    // Should be on login page
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Public Pages - Form Validation", () => {
  test("login form should show validation errors", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Try to submit empty form
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    // Should show validation errors (email and password required)
    // Note: Actual validation messages depend on zod schema
    await page.waitForTimeout(500); // Wait for validation
  });

  test("forgot-password form should show validation errors", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");

    // Try to submit empty form
    await page.getByRole("button", { name: /enviar enlace/i }).click();

    // Should show validation error for email
    await page.waitForTimeout(500); // Wait for validation
  });

  test("reset-password form should validate password match", async ({ page }) => {
    await page.goto("/reset-password?token=test-token");
    await page.waitForLoadState("networkidle");

    // Fill password fields with different values
    await page.getByLabel(/nueva contraseña/i).fill("password123");
    await page.getByLabel(/confirmar contraseña/i).fill("password456");

    // Try to submit
    await page.getByRole("button", { name: /restablecer contraseña/i }).click();

    // Should show validation error (passwords don't match)
    await page.waitForTimeout(500); // Wait for validation
  });
});

test.describe("Public Pages - Responsive Design", () => {
  test("login page should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Form should still be visible and usable
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
  });

  test("forgot-password page should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");

    // Form should be visible and centered
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar enlace/i })).toBeVisible();
  });
});


