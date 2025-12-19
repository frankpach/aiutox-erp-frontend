/**
 * Hooks for permission and role checking
 * Provides utilities to check user permissions and roles throughout the app
 *
 * Extended with multi-tenant and multi-module support
 */

import { useMemo } from "react";
import { useAuthStore } from "~/stores/authStore";

/**
 * Hook to get current user's permissions and roles
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = useMemo(() => {
    return (permission: string) => {
      if (!user?.permissions) return false;
      // Check exact permission or wildcard permissions
      return (
        user.permissions.includes(permission) ||
        user.permissions.includes("*") ||
        user.permissions.some((p) => {
          // Support module.* pattern (e.g., "inventory.*" matches "inventory.view")
          if (p.endsWith(".*")) {
            const module = p.slice(0, -2);
            return permission.startsWith(`${module}.`);
          }
          return false;
        })
      );
    };
  }, [user?.permissions]);

  return useMemo(
    () => ({
      permissions: user?.permissions || [],
      roles: user?.roles || [],
      hasPermission,
      hasRole: (role: string) => {
        if (!user?.roles) return false;
        return user.roles.includes(role);
      },
      hasAnyPermission: (permissions: string[]) => {
        if (!user?.permissions) return false;
        return permissions.some((p) => {
          // Check exact permission or wildcard
          return (
            user.permissions?.includes(p) ||
            user.permissions?.includes("*") ||
            user.permissions?.some((userPerm) => {
              if (userPerm.endsWith(".*")) {
                const module = userPerm.slice(0, -2);
                return p.startsWith(`${module}.`);
              }
              return false;
            })
          );
        });
      },
      hasAnyRole: (roles: string[]) => {
        if (!user?.roles) return false;
        return roles.some((r) => user.roles?.includes(r));
      },
      hasAllPermissions: (permissions: string[]) => {
        if (!user?.permissions) return false;
        return permissions.every((p) => {
          return hasPermission(p);
        });
      },
      /**
       * Check if user has permission for a specific module
       * @param moduleId - Module identifier
       * @param permission - Permission string (e.g., "view", "create")
       * @param tenantId - Optional tenant ID (defaults to current user's tenant)
       */
      hasModulePermission: (
        moduleId: string,
        permission: string,
        tenantId?: string
      ) => {
        if (!user?.permissions) return false;
        const fullPermission = `${moduleId}.${permission}`;
        // Check if tenant matches (if specified)
        if (tenantId && user.tenant_id !== tenantId) {
          return false;
        }
        return hasPermission(fullPermission);
      },
      /**
       * Get permissions for a specific module
       * @param moduleId - Module identifier
       * @param tenantId - Optional tenant ID
       */
      getModulePermissions: (moduleId: string, tenantId?: string) => {
        if (!user?.permissions) return [];
        // Check if tenant matches (if specified)
        if (tenantId && user.tenant_id !== tenantId) {
          return [];
        }
        return user.permissions.filter(
          (p) =>
            p === `${moduleId}.*` ||
            p.startsWith(`${moduleId}.`) ||
            p === "*"
        );
      },
    }),
    [user, hasPermission]
  );
}

/**
 * Hook to check if user has a specific permission
 * @param permission - Permission string (e.g., "inventory.view")
 */
export function useHasPermission(permission: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook to check if user has a specific role
 * @param role - Role string (e.g., "admin", "inventory.leader")
 */
export function useHasRole(role: string): boolean {
  const { hasRole } = usePermissions();
  return hasRole(role);
}

/**
 * Hook to check if user has any of the specified permissions
 * @param permissions - Array of permission strings
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check if user has any of the specified roles
 * @param roles - Array of role strings
 */
export function useHasAnyRole(roles: string[]): boolean {
  const { hasAnyRole } = usePermissions();
  return hasAnyRole(roles);
}


