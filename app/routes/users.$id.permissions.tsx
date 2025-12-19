/**
 * User Permissions Route
 *
 * Manages permissions for a specific user
 * Protected by auth.manage_permissions permission
 */

import type { Route } from "./+types/users.$id.permissions";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PermissionRoute } from "~/components/auth/PermissionRoute";
import { useParams, Link } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useUser } from "~/features/users/hooks/useUsers";
import { UserPermissionsManager } from "~/features/users/components/UserPermissionsManager";
import { PermissionDelegationModal } from "~/features/users/components/PermissionDelegationModal";
import { useState } from "react";
import { useAuthStore } from "~/stores/authStore";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Gestión de Permisos - AiutoX ERP" },
    {
      name: "description",
      content: "Gestiona los permisos del usuario",
    },
  ];
}

export default function UserPermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, refresh } = useUser(id || null);
  const currentUser = useAuthStore((state) => state.user);
  const [showDelegationModal, setShowDelegationModal] = useState(false);

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
        permission="auth.manage_permissions"
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestión de Permisos</h1>
                <p className="text-muted-foreground">
                  {user.full_name || user.email}
                </p>
              </div>
              {currentUser && (
                <Button
                  size="sm"
                  onClick={() => setShowDelegationModal(true)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Delegar Permiso
                </Button>
              )}
            </div>
          </div>

          <UserPermissionsManager user={user} onUpdate={refresh} />

          {/* Permission Delegation Modal */}
          {currentUser && (
            <PermissionDelegationModal
              open={showDelegationModal}
              onClose={() => setShowDelegationModal(false)}
              currentUserId={currentUser.id}
              onSuccess={refresh}
            />
          )}
        </div>
      </PermissionRoute>
    </ProtectedRoute>
  );
}

