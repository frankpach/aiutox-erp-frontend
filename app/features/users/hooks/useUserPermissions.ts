/**
 * React hooks for user permissions management
 *
 * Provides operations for viewing and managing user permissions,
 * including delegation and revocation
 */

import { useCallback, useState, useEffect, useMemo } from "react";
import {
  listPermissions,
  getPermissionsByModule,
  getUserPermissions,
  getUserModulePermissions,
  delegatePermission,
  revokePermission,
  revokeAllUserPermissions,
  revokeUserPermission,
  type DelegatedPermissionResponse,
} from "../api/permissions.api";
import type { PermissionGroup } from "../types/user.types";
import type {
  Permission,
  PermissionGroup,
  PermissionDelegation,
} from "../types/user.types";

/**
 * Hook to get all permissions (optionally filtered by module/tenant)
 */
export function usePermissions(moduleId?: string, tenantId?: string) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listPermissions(moduleId, tenantId);
      setPermissions(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load permissions")
      );
    } finally {
      setLoading(false);
    }
  }, [moduleId, tenantId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refresh: fetchPermissions,
  };
}

/**
 * Hook to get permissions grouped by module
 */
export function usePermissionsByModule(tenantId?: string) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const groups = await getPermissionsByModule(tenantId);
      setPermissionGroups(groups);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load permission groups")
      );
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    permissionGroups,
    loading,
    error,
    refresh: fetchGroups,
  };
}

/**
 * Hook to get user permissions summary
 */
export function useUserPermissions(userId: string | null) {
  const [permissions, setPermissions] = useState<{
    global_role_permissions: string[];
    module_role_permissions: Record<string, string[]>;
    delegated_permissions: DelegatedPermissionResponse[];
    effective_permissions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!userId) {
      setPermissions(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getUserPermissions(userId);
      setPermissions(response.data);
    } catch (err) {
      // If endpoint doesn't exist, try to construct from available endpoints
      if (err instanceof Error && err.message.includes("404")) {
        // Fallback: get from /auth/me or construct manually
        setPermissions({
          global_role_permissions: [],
          module_role_permissions: {},
          delegated_permissions: [],
          effective_permissions: [],
        });
      } else {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load user permissions")
        );
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refresh: fetchPermissions,
  };
}

/**
 * Hook to get user module permissions
 */
export function useUserModulePermissions(
  moduleId: string | null,
  userId: string | null
) {
  const [permissions, setPermissions] = useState<
    DelegatedPermissionResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!moduleId || !userId) {
      setPermissions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getUserModulePermissions(moduleId, userId);
      setPermissions(response.permissions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load user module permissions")
      );
    } finally {
      setLoading(false);
    }
  }, [moduleId, userId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refresh: fetchPermissions,
  };
}

/**
 * Hook to delegate a permission
 */
export function useDelegatePermission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const delegate = useCallback(
    async (
      moduleId: string,
      data: PermissionDelegation
    ): Promise<DelegatedPermissionResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await delegatePermission(moduleId, data);
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to delegate permission")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    delegate,
    loading,
    error,
  };
}

/**
 * Hook to revoke a delegated permission
 */
export function useRevokePermission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revoke = useCallback(
    async (moduleId: string, permissionId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await revokePermission(moduleId, permissionId);
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to revoke permission")
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    revoke,
    loading,
    error,
  };
}

/**
 * Hook to revoke all user permissions (admin override)
 */
export function useRevokeAllUserPermissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revokeAll = useCallback(async (userId: string): Promise<number> => {
    setLoading(true);
    setError(null);

    try {
      const response = await revokeAllUserPermissions(userId);
      return response.data.revoked_count;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to revoke all user permissions")
      );
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    revokeAll,
    loading,
    error,
  };
}

/**
 * Hook to revoke a specific user permission (admin override)
 */
export function useRevokeUserPermission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revoke = useCallback(
    async (userId: string, permissionId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await revokeUserPermission(userId, permissionId);
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to revoke user permission")
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    revoke,
    loading,
    error,
  };
}

