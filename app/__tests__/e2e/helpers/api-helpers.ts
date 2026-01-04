/**
 * API Helpers for E2E Tests
 *
 * Provides helper functions to interact with the backend API directly
 * Useful for setup/teardown and data preparation
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Get current user info (to get tenant_id)
 */
async function getCurrentUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get current user");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create a test user via API
 */
export async function createTestUser(data: {
  email: string;
  password: string;
  full_name: string;
  tenant_id?: string;
}) {
  const token = await getAdminToken();

  // Si no se proporciona tenant_id, obtenerlo del usuario admin
  let tenantId = data.tenant_id;
  if (!tenantId) {
    const currentUser = await getCurrentUser(token);
    tenantId = currentUser.tenant_id;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...data,
      tenant_id: tenantId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create test user: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Delete a test user via API
 */
export async function deleteTestUser(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await getAdminToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to delete test user: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get admin authentication token
 */
export async function getAdminToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "admin@aiutox.com",
      password: "password",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get admin token");
  }

  const data = await response.json();
  return data.data.access_token;
}

/**
 * Login and get token for a user
 */
export async function loginAndGetToken(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.access_token;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const token = await getAdminToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/users?search=${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user");
  }

  const data = await response.json();
  return data.data.find((user: any) => user.email === email);
}

/**
 * Clean up test data
 */
export async function cleanupTestUsers(emails: string[]) {
  const token = await getAdminToken();

  for (const email of emails) {
    try {
      const user = await getUserByEmail(email);
      if (user) {
        await deleteTestUser(user.id);
      }
    } catch (error) {
      // User might not exist, ignore
      console.warn(`Failed to cleanup user ${email}:`, error);
    }
  }
}






















