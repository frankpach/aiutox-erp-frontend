/**
 * User Detail Route
 *
 * Shows detailed user information with tabs
 * Protected by auth.manage_users permission
 */

import type { Route } from "./+types/users.$id";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PermissionRoute } from "~/components/auth/PermissionRoute";
import { UserDetail } from "~/features/users/components/UserDetail";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Detalle de Usuario - AiutoX ERP" },
    {
      name: "description",
      content: "Información detallada del usuario",
    },
  ];
}

export default function UserDetailPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute
        permission="auth.manage_users"
        redirectTo="/unauthorized"
      >
        <div className="container mx-auto py-6">
          <UserDetail />
        </div>
      </PermissionRoute>
    </ProtectedRoute>
  );
}







