/**
 * UserFormModal Component
 *
 * Modal/drawer wrapper for UserForm
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { UserForm } from "./UserForm";
import type { User, UserCreate, UserUpdate } from "../types/user.types";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit: (data: UserCreate | UserUpdate) => Promise<void>;
  loading?: boolean;
}

/**
 * UserFormModal component
 */
export function UserFormModal({
  open,
  onClose,
  user,
  onSubmit,
  loading = false,
}: UserFormModalProps) {
  const handleSubmit = async (data: UserCreate | UserUpdate) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Actualiza la información del usuario"
              : "Completa el formulario para crear un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        <UserForm
          user={user}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}

