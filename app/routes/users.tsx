/**
 * Users Route
 * Main page for user management with SavedFilters integration.
 */

import type { Route } from "./+types/users";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PermissionRoute } from "~/components/auth/PermissionRoute";
import { UsersList } from "../features/users/components/UsersList";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { UserFormModal } from "../features/users/components/UserFormModal";
import { useCreateUser } from "../features/users/hooks/useUsers";
import { useAuthStore } from "~/stores/authStore";
import { showToast } from "~/components/common/Toast";
import type { UserCreate } from "../features/users/types/user.types";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Usuarios - AiutoX ERP" },
    { name: "description", content: "Gestión de usuarios del sistema" },
  ];
}

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { create, loading: creating } = useCreateUser();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleManageFiltersClick = () => {
    // This will open the FilterManagementModal in Phase 4
    // For now, just a placeholder
    console.log("Open filter management");
  };

  const handleCreateUser = async (data: UserCreate) => {
    if (!currentUser?.tenant_id) return;

    const userData: UserCreate = {
      ...data,
      tenant_id: currentUser.tenant_id,
    };

    const result = await create(userData);
    if (result) {
      showToast("Usuario creado exitosamente", "success");
      setShowCreateModal(false);
    } else {
      showToast("Error al crear el usuario", "error");
    }
  };

  return (
    <ProtectedRoute>
      <PermissionRoute
        permission="auth.manage_users"
        redirectTo="/unauthorized"
      >
        <div className="container mx-auto py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Usuarios</h1>
              <p className="text-muted-foreground">
                Gestiona los usuarios del sistema y aplica filtros personalizados
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </div>

          <UsersList onManageFiltersClick={handleManageFiltersClick} />

          {/* Create User Modal */}
          <UserFormModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateUser}
            loading={creating}
          />
        </div>
      </PermissionRoute>
    </ProtectedRoute>
  );
}




