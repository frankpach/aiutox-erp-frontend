/**
 * User Roles Route
 *
 * Manages roles for a specific user
 * Protected by auth.manage_roles permission
 */

import type { Route } from "./+types/users.$id.roles";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PermissionRoute } from "~/components/auth/PermissionRoute";
import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useUser } from "~/features/users/hooks/useUsers";
import { UserRolesManager } from "~/features/users/components/UserRolesManager";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Gestión de Roles - AiutoX ERP" },
    {
      name: "description",
      content: "Gestiona los roles del usuario",
    },
  ];
}

export default function UserRolesPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useUser(id || null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando usuario...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Usuario no encontrado</p>
        <Link to="/users">
          <Button variant="outline" className="mt-4">
            Volver a Usuarios
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <PermissionRoute
        permission="auth.manage_roles"
        redirectTo="/unauthorized"
      >
        <div className="container mx-auto py-6">
          <div className="mb-6">
            <Link to={`/users/${user.id}`}>
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Detalle
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Gestión de Roles</h1>
            <p className="text-muted-foreground">
              {user.full_name || user.email}
            </p>
          </div>

          <UserRolesManager user={user} />
        </div>
      </PermissionRoute>
    </ProtectedRoute>
  );
}







