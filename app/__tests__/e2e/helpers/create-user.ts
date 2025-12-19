/**
 * Helper to create a test user via API
 *
 * This helper creates a user in the backend for E2E testing.
 * Requires backend to be running and an admin user to exist.
 */

import type { Page } from "@playwright/test";

interface CreateUserOptions {
  email: string;
  password: string;
  fullName?: string;
  tenantId?: string;
}

/**
 * Create a user via API call
 * Requires admin authentication
 */
export async function createUserViaAPI(
  page: Page,
  options: CreateUserOptions
): Promise<{ success: boolean; error?: string }> {
  const { email, password, fullName = "Test User", tenantId } = options;

  try {
    // First, login as admin to get token
    const loginResponse = await page.request.post("http://localhost:8000/api/v1/auth/login", {
      data: {
        email: "admin@aiutox.com",
        password: "password",
      },
    });

    if (!loginResponse.ok()) {
      return {
        success: false,
        error: `Failed to login as admin: ${loginResponse.status()}`,
      };
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.data.access_token;

    // Create user
    const createUserResponse = await page.request.post(
      "http://localhost:8000/api/v1/users",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          email,
          password,
          full_name: fullName,
          tenant_id: tenantId,
        },
      }
    );

    if (!createUserResponse.ok()) {
      const errorData = await createUserResponse.json().catch(() => ({}));
      return {
        success: false,
        error: `Failed to create user: ${createUserResponse.status()} - ${JSON.stringify(errorData)}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}




