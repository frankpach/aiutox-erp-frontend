/**
 * UserContactMethods Component
 *
 * Manages contact methods (email, phone, address, etc.) for a user
 */

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2, Mail, Phone, MapPin, Globe } from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { showToast } from "~/components/common/Toast";
import { LoadingSpinner } from "~/components/common/LoadingSpinner";
import {
  useContactMethods,
  useCreateContactMethod,
  useUpdateContactMethod,
  useDeleteContactMethod,
} from "../hooks/useContactMethods";
import { ContactMethodForm } from "./ContactMethodForm";
import type { ContactMethod, ContactMethodType, User } from "../types/user.types";

interface UserContactMethodsProps {
  user: User;
  onUpdate?: () => void;
}

/**
 * Get icon for contact method type
 */
function getContactMethodIcon(type: ContactMethodType) {
  switch (type) {
    case "email":
      return Mail;
    case "phone":
    case "mobile":
      return Phone;
    case "address":
      return MapPin;
    case "website":
      return Globe;
    default:
      return Mail;
  }
}

/**
 * UserContactMethods component
 */
export function UserContactMethods({
  user,
  onUpdate,
}: UserContactMethodsProps) {
  const { contactMethods, loading, refresh } = useContactMethods(
    "user",
    user.id
  );
  const { create, loading: creating } = useCreateContactMethod();
  const { update, loading: updating } = useUpdateContactMethod();
  const { remove, loading: deleting } = useDeleteContactMethod();

  const [editingMethod, setEditingMethod] =
    useState<ContactMethod | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    methodId: string | null;
  }>({ open: false, methodId: null });

  const handleCreate = async (data: {
    method_type?: ContactMethodType;
    value?: string | null;
    label?: string | null;
    is_primary?: boolean | null;
    // Address fields
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state_province?: string | null;
    postal_code?: string | null;
    country?: string | null;
  }) => {
    if (!data.method_type || !data.value) {
      showToast("Tipo de método y valor son requeridos", "error");
      return;
    }
    const result = await create({
      entity_type: "user",
      entity_id: user.id,
      method_type: data.method_type,
      value: data.value,
      label: data.label,
      is_primary: data.is_primary ?? false,
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      city: data.city,
      state_province: data.state_province,
      postal_code: data.postal_code,
      country: data.country,
    });

    if (result) {
      showToast("Método de contacto creado exitosamente", "success");
      setShowForm(false);
      refresh();
      onUpdate?.();
    } else {
      showToast("Error al crear el método de contacto", "error");
    }
  };

  const handleUpdate = async (
    methodId: string,
    data: {
      value?: string | null;
      label?: string | null;
      is_primary?: boolean | null;
    }
  ) => {
    const result = await update(methodId, data);
    if (result) {
      showToast("Método de contacto actualizado exitosamente", "success");
      setEditingMethod(null);
      refresh();
      onUpdate?.();
    } else {
      showToast("Error al actualizar el método de contacto", "error");
    }
  };

  const handleDelete = async (methodId: string) => {
    setDeleteConfirm({ open: true, methodId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.methodId) return;

    const success = await remove(deleteConfirm.methodId);
    if (success) {
      showToast("Método de contacto eliminado exitosamente", "success");
      refresh();
      onUpdate?.();
    } else {
      showToast("Error al eliminar el método de contacto", "error");
    }
    setDeleteConfirm({ open: false, methodId: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" text="Cargando métodos de contacto..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Métodos de Contacto</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingMethod(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Método
        </Button>
      </div>

      {contactMethods.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay métodos de contacto registrados
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contactMethods.map((method) => {
            const Icon = getContactMethodIcon(method.method_type);
            const isEditing = editingMethod?.id === method.id;

            if (isEditing) {
              return (
                <ContactMethodForm
                  key={method.id}
                  method={method}
                  onSubmit={async (data) => {
                    await handleUpdate(method.id, {
                      value: data.value,
                      label: data.label,
                      is_primary: data.is_primary,
                    });
                  }}
                  onCancel={() => setEditingMethod(null)}
                  loading={updating}
                />
              );
            }

            return (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">
                        {method.method_type}
                      </p>
                      {method.is_primary && (
                        <span className="rounded-full bg-[#023E87]/10 px-2 py-0.5 text-xs text-[#023E87]">
                          Principal
                        </span>
                      )}
                      {method.is_verified && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.value}
                    </p>
                    {method.label && (
                      <p className="text-xs text-muted-foreground">
                        {method.label}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingMethod(method)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(method.id)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <ContactMethodForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={creating}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, methodId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Método de Contacto"
        description="¿Estás seguro de que deseas eliminar este método de contacto?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}







