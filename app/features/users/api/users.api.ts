/**
 * API service for Users module.
 */

import apiClient from "../../../lib/api/client";
import type { StandardListResponse } from "../../views/types/savedFilter.types";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Allow additional fields
}

export interface UsersListParams {
  page?: number;
  page_size?: number;
  saved_filter_id?: string; // Will be supported when backend is updated
}

/**
 * Get list of users
 */
export async function getUsers(
  params?: UsersListParams
): Promise<StandardListResponse<User>> {
  const response = await apiClient.get<StandardListResponse<User>>("/users", {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
      saved_filter_id: params?.saved_filter_id, // Backend will support this
    },
  });
  return response.data;
}

/**
 * Get a single user by ID
 */
export async function getUser(userId: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
}



