/**
 * UserForm Component
 *
 * Form for creating/editing users with validation using react-hook-form and zod
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import type { User, UserCreate, UserUpdate } from "../types/user.types";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateFormData,
  type UserUpdateFormData,
} from "../validations/user.schema";

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserCreate | UserUpdate) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * UserForm component
 */
export function UserForm({
  user,
  onSubmit,
  onCancel,
  loading = false,
}: UserFormProps) {
  const isEditing = !!user;
  const schema = isEditing ? userUpdateSchema : userCreateSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UserCreateFormData | UserUpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: user
      ? {
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          middle_name: user.middle_name || "",
          full_name: user.full_name || "",
          date_of_birth: user.date_of_birth || "",
          gender: user.gender || "",
          nationality: user.nationality || "",
          marital_status: user.marital_status || "",
          job_title: user.job_title || "",
          department: user.department || "",
          employee_id: user.employee_id || "",
          preferred_language: user.preferred_language || "es",
          timezone: user.timezone || "",
          avatar_url: user.avatar_url || "",
          bio: user.bio || "",
          notes: user.notes || "",
          is_active: user.is_active,
          two_factor_enabled: user.two_factor_enabled,
        }
      : {
          preferred_language: "es",
          is_active: true,
          two_factor_enabled: false,
        },
  });

  const isActive = watch("is_active");
  const twoFactorEnabled = watch("two_factor_enabled");

  const onSubmitForm = async (
    data: UserCreateFormData | UserUpdateFormData
  ) => {
    await onSubmit(data as UserCreate | UserUpdate);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          disabled={loading || isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password (only for create) */}
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            disabled={loading || isSubmitting}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      {/* Name fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre</Label>
          <Input
            id="first_name"
            {...register("first_name")}
            disabled={loading || isSubmitting}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middle_name">Segundo Nombre</Label>
          <Input
            id="middle_name"
            {...register("middle_name")}
            disabled={loading || isSubmitting}
          />
          {errors.middle_name && (
            <p className="text-sm text-destructive">
              {errors.middle_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido</Label>
          <Input
            id="last_name"
            {...register("last_name")}
            disabled={loading || isSubmitting}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth")}
            disabled={loading || isSubmitting}
          />
          {errors.date_of_birth && (
            <p className="text-sm text-destructive">
              {errors.date_of_birth.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select
            onValueChange={(value) => setValue("gender", value)}
            defaultValue={watch("gender") || ""}
            disabled={loading || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Femenino</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefiero no decir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Professional Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="job_title">Cargo</Label>
          <Input
            id="job_title"
            {...register("job_title")}
            disabled={loading || isSubmitting}
          />
          {errors.job_title && (
            <p className="text-sm text-destructive">
              {errors.job_title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departamento</Label>
          <Input
            id="department"
            {...register("department")}
            disabled={loading || isSubmitting}
          />
          {errors.department && (
            <p className="text-sm text-destructive">
              {errors.department.message}
            </p>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferred_language">Idioma Preferido</Label>
          <Select
            onValueChange={(value) => setValue("preferred_language", value)}
            defaultValue={watch("preferred_language") || "es"}
            disabled={loading || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Input
            id="timezone"
            placeholder="America/Bogota"
            {...register("timezone")}
            disabled={loading || isSubmitting}
          />
        </div>
      </div>

      {/* Additional fields */}
      <div className="space-y-2">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea
          id="bio"
          {...register("bio")}
          rows={3}
          disabled={loading || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          rows={3}
          disabled={loading || isSubmitting}
        />
      </div>

      {/* Status switches (only for editing) */}
      {isEditing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Usuario Activo</Label>
              <p className="text-sm text-muted-foreground">
                Desactivar un usuario lo deshabilita sin eliminarlo
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive ?? true}
              onCheckedChange={(checked) => setValue("is_active", checked)}
              disabled={loading || isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two_factor_enabled">Autenticación de Dos Factores</Label>
              <p className="text-sm text-muted-foreground">
                Habilitar 2FA para mayor seguridad
              </p>
            </div>
            <Switch
              id="two_factor_enabled"
              checked={twoFactorEnabled ?? false}
              onCheckedChange={(checked) =>
                setValue("two_factor_enabled", checked)
              }
              disabled={loading || isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || isSubmitting}>
          {loading || isSubmitting
            ? "Guardando..."
            : isEditing
            ? "Actualizar Usuario"
            : "Crear Usuario"}
        </Button>
      </div>
    </form>
  );
}

