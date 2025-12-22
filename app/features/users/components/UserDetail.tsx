/**
 * UserDetail Component
 *
 * Complete user detail view with tabs for:
 * - General Information
 * - Organizations
 * - Contact Methods
 * - Roles
 * - Permissions
 * - Active Delegations
 */

import { useState } from "react";
import { useParams, Link } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Edit, Shield } from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { showToast } from "~/components/common/Toast";
import { LoadingSpinner } from "~/components/common/LoadingSpinner";
import { useUser, useUpdateUser, useDeleteUser } from "../hooks/useUsers";
import { UserForm } from "./UserForm";
import { UserOrganizations } from "./UserOrganizations";
import { UserContactMethods } from "./UserContactMethods";
import { UserRolesManager } from "./UserRolesManager";
import { UserPermissionsManager } from "./UserPermissionsManager";
import { PermissionDelegationModal } from "./PermissionDelegationModal";
import { useAuthStore } from "~/stores/authStore";
import type { User, UserUpdate } from "../types/user.types";

/**
 * UserDetail component
 */
export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const { user, loading, refresh } = useUser(id || null);
  const { update, loading: updating } = useUpdateUser();
  const { remove, loading: deleting } = useDeleteUser();

  const [editing, setEditing] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleUpdate = async (data: UserUpdate) => {
    if (!id) return;
    const result = await update(id, data);
    if (result) {
      showToast("Usuario actualizado exitosamente", "success");
      setEditing(false);
      refresh();
    } else {
      showToast("Error al actualizar el usuario", "error");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    const success = await remove(id);
    if (success) {
      showToast("Usuario eliminado exitosamente", "success");
      // Redirect to users list
      setTimeout(() => {
        window.location.href = "/users";
      }, 1000);
    } else {
      showToast("Error al eliminar el usuario", "error");
    }
    setDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando usuario..." />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {user.full_name || user.email}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setEditing(!editing)}
            disabled={updating}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            {editing ? "Cancelar" : "Editar"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            size="sm"
            className="w-full sm:w-auto"
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        description="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={deleting}
      />

      {/* Edit Form */}
      {editing && (
        <div className="rounded-md border p-6">
          <h2 className="text-xl font-semibold mb-4">Editar Usuario</h2>
          <UserForm
            user={user}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            loading={updating}
          />
        </div>
      )}

      {/* Tabs */}
      {!editing && (
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="organizations">Organizaciones</TabsTrigger>
            <TabsTrigger value="contact-methods">
              Métodos de Contacto
            </TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
            <TabsTrigger value="delegations">Delegaciones Activas</TabsTrigger>
          </TabsList>

          {/* General Information Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="rounded-md border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Información General
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">
                    {user.full_name ||
                      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                      "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="font-medium">{user.job_title || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departamento</p>
                  <p className="font-medium">{user.department || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">2FA Habilitado</p>
                  <p className="font-medium">
                    {user.two_factor_enabled ? "Sí" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último Acceso</p>
                  <p className="font-medium">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleString()
                      : "Nunca"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creado</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <UserOrganizations user={user} onUpdate={refresh} />
          </TabsContent>

          {/* Contact Methods Tab */}
          <TabsContent value="contact-methods">
            <UserContactMethods user={user} onUpdate={refresh} />
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <UserRolesManager user={user} onUpdate={refresh} />
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Permisos del Usuario</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualiza y gestiona los permisos del usuario
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowDelegationModal(true)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Delegar Permiso
                </Button>
              </div>
              <UserPermissionsManager user={user} onUpdate={refresh} />
            </div>
          </TabsContent>

          {/* Active Delegations Tab */}
          <TabsContent value="delegations">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Delegaciones Activas</h3>
                <p className="text-sm text-muted-foreground">
                  Permisos delegados temporalmente a este usuario
                </p>
              </div>
              {/* TODO: Create component to list active delegations */}
              <div className="rounded-md border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Componente de delegaciones activas (pendiente de implementar)
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

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
  );
}







