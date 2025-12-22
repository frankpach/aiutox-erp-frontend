/**
 * CustomRolesManager Component
 *
 * Manages custom roles with granular permission assignment
 * Inspired by Aureus ERP role management interface
 */

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { showToast } from "~/components/common/Toast";
import { useCustomRoles, useDeleteCustomRole } from "../hooks/useCustomRoles";
import { RoleForm } from "./RoleForm";
import type { CustomRole } from "../types/user.types";

interface CustomRolesManagerProps {
  onRoleSelect?: (role: CustomRole) => void;
}

/**
 * CustomRolesManager component
 */
export function CustomRolesManager({
  onRoleSelect,
}: CustomRolesManagerProps) {
  const { roles, loading, refresh } = useCustomRoles();
  const { remove, loading: deleting } = useDeleteCustomRole();

  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    roleId: string | null;
  }>({ open: false, roleId: null });

  const handleDelete = async (roleId: string) => {
    setDeleteConfirm({ open: true, roleId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.roleId) return;

    const success = await remove(deleteConfirm.roleId);
    if (success) {
      showToast("Rol eliminado exitosamente", "success");
      refresh();
    } else {
      showToast("Error al eliminar el rol", "error");
    }
    setDeleteConfirm({ open: false, roleId: null });
  };

  const handleFormSuccess = () => {
    showToast(
      editingRole
        ? "Rol actualizado exitosamente"
        : "Rol creado exitosamente",
      "success"
    );
    setShowForm(false);
    setEditingRole(null);
    refresh();
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Cargando roles...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Roles Personalizados</h3>
          <p className="text-sm text-muted-foreground">
            Crea y gestiona roles personalizados con permisos granulares
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingRole(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Rol
        </Button>
      </div>

      {showForm && (
        <RoleForm
          role={editingRole}
          onSubmit={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingRole(null);
          }}
        />
      )}

      {roles.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay roles personalizados. Crea uno para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between rounded-md border p-4 hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{role.name}</p>
                  <span className="rounded-full bg-[#023E87]/10 px-2 py-0.5 text-xs text-[#023E87]">
                    {role.permissions.length} permisos
                  </span>
                </div>
                {role.description && (
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingRole(role);
                    setShowForm(true);
                    onRoleSelect?.(role);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(role.id)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, roleId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Rol Personalizado"
        description="¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}







