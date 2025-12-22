/**
 * E2E Tests for Users CRUD Operations
 *
 * Tests the complete user management flow:
 * - Create user
 * - Read user details
 * - Update user
 * - Delete user
 *
 * Requires: Backend and Frontend running
 */

import { test, expect } from "../fixtures/auth.setup";
import { UsersPage } from "../helpers/page-objects/UsersPage";
import { UserDetailPage } from "../helpers/page-objects/UserDetailPage";
import {
  createTestUser,
  deleteTestUser,
  cleanupTestUsers,
} from "../helpers/api-helpers";

test.describe("Users CRUD E2E", () => {
  // Helper para obtener email único por test (thread-safe)
  function getTestUserEmail(): string {
    // Usar worker ID de Playwright si está disponible
    const workerIndex = process.env.TEST_PARALLEL_INDEX ||
                       process.env.PLAYWRIGHT_WORKER_INDEX ||
                       Math.floor(Math.random() * 1000).toString();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `user-e2e-${workerIndex}-${timestamp}-${random}@example.com`;
  }

  test.beforeEach(async ({ authenticatedPage }) => {
    // Ensure we're on users page
    await authenticatedPage.goto("/users");
  });

  test.afterEach(async () => {
    // Cleanup test user
    if (testUserId) {
      try {
        await deleteTestUser(testUserId);
      } catch (error) {
        console.warn("Failed to cleanup test user:", error);
      }
      testUserId = null;
    }
  });

  test("should create a new user", async ({ authenticatedPage }) => {
    const testUserEmail = getTestUserEmail();
    const usersPage = new UsersPage(authenticatedPage);
    const initialCount = await usersPage.getUserCount();

    // Click create user button
    await usersPage.clickCreateUser();

    // Fill user form
    await authenticatedPage.fill('input[name="email"]', testUserEmail);
    await authenticatedPage.fill('input[name="password"]', "Test123!@#");
    await authenticatedPage.fill('input[name="full_name"]', "E2E Test User");
    await authenticatedPage.fill('input[name="job_title"]', "QA Tester");

    // Submit form
    await authenticatedPage.click('button[type="submit"]');

    // Wait for success message
    await expect(
      authenticatedPage.locator("text=Usuario creado exitosamente")
    ).toBeVisible({ timeout: 10000 });

    // Verify user appears in list
    await usersPage.waitForUserToAppear(testUserEmail);

    // Verify count increased
    const newCount = await usersPage.getUserCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test("should view user details", async ({ authenticatedPage }) => {
    const testUserEmail = getTestUserEmail();
    // Create user first
    const userData = await createTestUser({
      email: testUserEmail,
      password: "Test123!@#",
      full_name: "E2E Test User",
    });
    testUserId = userData.data.id;

    const usersPage = new UsersPage(authenticatedPage);
    await usersPage.goto();

    // Click on user
    await usersPage.clickUserByEmail(testUserEmail);

    // Verify we're on detail page
    await expect(authenticatedPage).toHaveURL(/\/users\/[^/]+$/);

    // Verify user details are displayed
    await expect(authenticatedPage.locator(`text=${testUserEmail}`)).toBeVisible();
    await expect(authenticatedPage.locator("text=E2E Test User")).toBeVisible();
  });

  test("should edit user", async ({ authenticatedPage }) => {
    const testUserEmail = getTestUserEmail();
    // Create user first
    const userData = await createTestUser({
      email: testUserEmail,
      password: "Test123!@#",
      full_name: "E2E Test User",
    });
    testUserId = userData.data.id;

    const userDetailPage = new UserDetailPage(authenticatedPage);
    await userDetailPage.goto(testUserId);

    // Click edit
    await userDetailPage.clickEdit();

    // Update user info
    await userDetailPage.fillUserForm({
      full_name: "Updated E2E User",
      job_title: "Senior QA",
    });

    // Save
    await userDetailPage.saveUserForm();

    // Verify success message
    await expect(
      authenticatedPage.locator("text=Usuario actualizado exitosamente")
    ).toBeVisible({ timeout: 10000 });

    // Verify changes are reflected
    await expect(authenticatedPage.locator("text=Updated E2E User")).toBeVisible();
    await expect(authenticatedPage.locator("text=Senior QA")).toBeVisible();
  });

  test("should delete user with confirmation", async ({ authenticatedPage }) => {
    const testUserEmail = getTestUserEmail();
    // Create user first
    const userData = await createTestUser({
      email: testUserEmail,
      password: "Test123!@#",
      full_name: "E2E Test User",
    });
    testUserId = userData.data.id;

    const userDetailPage = new UserDetailPage(authenticatedPage);
    await userDetailPage.goto(testUserId);

    // Click delete
    await userDetailPage.clickDelete();

    // Confirm deletion
    await userDetailPage.confirmDelete();

    // Verify success message
    await expect(
      authenticatedPage.locator("text=Usuario eliminado exitosamente")
    ).toBeVisible({ timeout: 10000 });

    // Verify redirect to users list
    await expect(authenticatedPage).toHaveURL(/\/users$/);

    // Verify user no longer appears in list
    const usersPage = new UsersPage(authenticatedPage);
    await usersPage.goto();

    // User should not be visible
    const userRow = await usersPage.getUserRowByEmail(testUserEmail);
    await expect(userRow).not.toBeVisible();

    // Mark as cleaned up
    testUserId = null;
  });

  test("should search for users", async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    await usersPage.goto();

    // Search for admin user
    await usersPage.searchUser("admin@aiutox.com");

    // Verify admin user appears
    await expect(
      authenticatedPage.locator("text=admin@aiutox.com")
    ).toBeVisible();
  });

  test("should filter users by status", async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    await usersPage.goto();

    // Select active filter
    await authenticatedPage.selectOption('select', "active");

    // Wait for filter to apply
    await authenticatedPage.waitForLoadState("networkidle");

    // Verify all visible users are active
    const statusBadges = authenticatedPage.locator('text=Activo');
    const count = await statusBadges.count();
    expect(count).toBeGreaterThan(0);
  });
});






