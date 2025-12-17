/**
 * Route guard component that protects routes based on authentication
 */

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "~/stores/authStore";

export interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Component that protects routes - only renders children if user is authenticated
 * Redirects to login if not authenticated, preserving the original route for redirect after login
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the current location to redirect back after login
    const redirectPath = location.pathname + location.search;
    return (
      <Navigate
        to={`${redirectTo}?redirect=${encodeURIComponent(redirectPath)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}

