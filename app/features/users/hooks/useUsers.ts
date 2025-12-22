/**
 * React hooks for user management
 *
 * Provides CRUD operations and state management for users
 * with encrypted caching support
 */

import { useCallback, useState, useEffect } from "react";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../api/users.api";
import { cacheUserData, getCachedUserData } from "~/lib/storage/encryptedStorage";
import { useAuthStore } from "~/stores/authStore";
import type {
  User,
  UserCreate,
  UserUpdate,
  UsersListParams,
} from "../types/user.types";

/**
 * Get encryption secret (should come from secure source in production)
 */
function getSecret(): string {
  return import.meta.env.VITE_ENCRYPTION_SECRET || "default-secret-change-in-production";
}

/**
 * Hook to list users with pagination
 */
export function useUsers(params?: UsersListParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listUsers(params);
      setUsers(response.data);
      if (response.meta && "total" in response.meta) {
        setPagination({
          total: response.meta.total,
          page: response.meta.page,
          page_size: response.meta.page_size,
          total_pages: response.meta.total_pages,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    refresh: fetchUsers,
  };
}

/**
 * Hook to get a single user by ID
 * Uses encrypted cache for performance
 */
export function useUser(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const tenantId = currentUser?.tenant_id || "default-tenant";
  const secret = getSecret();

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await getCachedUserData<User>(userId, tenantId, secret);
      if (cached) {
        setUser(cached);
        setLoading(false);
        // Still fetch fresh data in background
      }

      // Fetch fresh data
      const response = await getUser(userId);
      const userData = response.data;
      setUser(userData);

      // Cache the data
      await cacheUserData(userId, userData, tenantId, secret);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load user"));
    } finally {
      setLoading(false);
    }
  }, [userId, tenantId, secret]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refresh: fetchUser,
  };
}

/**
 * Hook to create a user
 */
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: UserCreate): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await createUser(data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create user"));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    create,
    loading,
    error,
  };
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const tenantId = currentUser?.tenant_id || "default-tenant";
  const secret = getSecret();

  const update = useCallback(
    async (userId: string, data: UserUpdate): Promise<User | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await updateUser(userId, data);
        const userData = response.data;

        // Update cache
        await cacheUserData(userId, userData, tenantId, secret);

        return userData;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update user")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, secret]
  );

  return {
    update,
    loading,
    error,
  };
}

/**
 * Hook to delete a user (soft delete)
 */
export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await deleteUser(userId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete user"));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    remove,
    loading,
    error,
  };
}







