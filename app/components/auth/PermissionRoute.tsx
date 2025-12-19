/**
 * Route guard component that protects routes based on permissions
 */

import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useHasPermission } from "~/hooks/usePermissions";

export interface PermissionRouteProps {
  permission: string;
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Component that protects routes based on permissions
 * Only renders children if user has the required permission
 * Redirects or shows fallback if permission is missing
 */
export function PermissionRoute({
  permission,
  children,
  redirectTo,
  fallback = null,
}: PermissionRouteProps) {
  const hasPermission = useHasPermission(permission);

  if (!hasPermission) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}


