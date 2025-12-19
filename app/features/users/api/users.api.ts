/**
 * API service for Users module
 *
 * Handles CRUD operations for users
 */

import apiClient from "~/lib/api/client";
import type {
  StandardResponse,
  StandardListResponse,
} from "~/lib/api/types/common.types";
import type {
  User,
  UserCreate,
  UserUpdate,
} from "../types/user.types";

export interface UsersListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  saved_filter_id?: string; // Will be supported when backend is updated
}

/**
 * List users
 * GET /api/v1/users
 *
 * Requires: auth.manage_users permission
 */
export async function listUsers(
  params?: UsersListParams
): Promise<StandardListResponse<User>> {
  const response = await apiClient.get<StandardListResponse<User>>("/users", {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
      search: params?.search,
      is_active: params?.is_active,
      saved_filter_id: params?.saved_filter_id,
    },
  });
  return response.data;
}

/**
 * Get user by ID
 * GET /api/v1/users/{user_id}
 *
 * Requires: auth.manage_users permission
 */
export async function getUser(
  userId: string
): Promise<StandardResponse<User>> {
  const response = await apiClient.get<StandardResponse<User>>(
    `/users/${userId}`
  );
  return response.data;
}

/**
 * Create user
 * POST /api/v1/users
 *
 * Requires: auth.manage_users permission
 */
export async function createUser(
  data: UserCreate
): Promise<StandardResponse<User>> {
  const response = await apiClient.post<StandardResponse<User>>(
    "/users",
    data
  );
  return response.data;
}

/**
 * Update user
 * PATCH /api/v1/users/{user_id}
 *
 * Requires: auth.manage_users permission
 */
export async function updateUser(
  userId: string,
  data: UserUpdate
): Promise<StandardResponse<User>> {
  const response = await apiClient.patch<StandardResponse<User>>(
    `/users/${userId}`,
    data
  );
  return response.data;
}

/**
 * Delete user (soft delete)
 * DELETE /api/v1/users/{user_id}
 *
 * Requires: auth.manage_users permission
 */
export async function deleteUser(
  userId: string
): Promise<StandardResponse<{ message: string }>> {
  const response = await apiClient.delete<StandardResponse<{ message: string }>>(
    `/users/${userId}`
  );
  return response.data;
}

// Legacy function names for backward compatibility
export const getUsers = listUsers;




