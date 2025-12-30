/**
 * UserForm Component
 *
 * Form for creating/editing users with validation using react-hook-form and zod
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { sanitizeUserFormData } from "~/lib/security/sanitizeFormData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/lib/i18n/useTranslation";
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
  const { t } = useTranslation();
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
    console.log("[UserForm] onSubmitForm called:", { isEditing, data });
    try {
      // Sanitize inputs before submission
      const sanitizedData = sanitizeUserFormData(data);
      console.log("[UserForm] Data sanitized:", sanitizedData);

      // Remove empty strings and convert to null for optional fields
      const cleanedData: any = {};
      for (const [key, value] of Object.entries(sanitizedData)) {
        if (value !== undefined) {
          // Convert empty strings to null for optional fields
          if (value === "" && (key !== "email" || !isEditing)) {
            cleanedData[key] = null;
          } else {
            cleanedData[key] = value;
          }
        }
      }
      console.log("[UserForm] Data cleaned:", cleanedData);

      await onSubmit(cleanedData as UserCreate | UserUpdate);
      console.log("[UserForm] onSubmit completed successfully");
    } catch (error: any) {
      console.error("[UserForm] Error in onSubmitForm:", error);
      // Log detailed error information
      if (error?.response) {
        console.error("[UserForm] Error response details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }
      // Re-throw to let react-hook-form handle it and show validation errors
      throw error;
    }
  };

  // Log form state for debugging
  if (Object.keys(errors).length > 0) {
    console.log("[UserForm] Form validation errors:", errors);
  }

  return (
    <form
      onSubmit={(e) => {
        console.log("[UserForm] Form submit event triggered");
        e.preventDefault();
        handleSubmit(onSubmitForm)(e);
      }}
      className="space-y-6"
    >
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          {t("users.email") || "Email"} <span className="text-destructive">*</span>
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
            {t("users.password") || "Contraseña"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password" as keyof UserCreateFormData)}
            disabled={loading || isSubmitting}
          />
          {"password" in errors && errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      {/* Name fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="first_name">{t("users.firstName") || "Nombre"}</Label>
          <Input
            id="first_name"
            {...register("first_name")}
            disabled={loading || isSubmitting}
            aria-describedby={errors.first_name ? "first_name-error" : undefined}
          />
          {errors.first_name && (
            <p id="first_name-error" className="text-sm text-destructive">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middle_name">{t("users.middleName") || "Segundo Nombre"}</Label>
          <Input
            id="middle_name"
            {...register("middle_name")}
            disabled={loading || isSubmitting}
            aria-describedby={errors.middle_name ? "middle_name-error" : undefined}
          />
          {errors.middle_name && (
            <p id="middle_name-error" className="text-sm text-destructive">
              {errors.middle_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">{t("users.lastName") || "Apellido"}</Label>
          <Input
            id="last_name"
            {...register("last_name")}
            disabled={loading || isSubmitting}
            aria-describedby={errors.last_name ? "last_name-error" : undefined}
          />
          {errors.last_name && (
            <p id="last_name-error" className="text-sm text-destructive">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">{t("users.dateOfBirth") || "Fecha de Nacimiento"}</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth")}
            disabled={loading || isSubmitting}
            aria-describedby={errors.date_of_birth ? "date_of_birth-error" : undefined}
          />
          {errors.date_of_birth && (
            <p id="date_of_birth-error" className="text-sm text-destructive">
              {errors.date_of_birth.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">{t("users.gender") || "Género"}</Label>
          <Select
            onValueChange={(value) => setValue("gender", value)}
            defaultValue={watch("gender") || ""}
            disabled={loading || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("users.selectGender") || "Seleccionar género"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("users.genderMale") || "Masculino"}</SelectItem>
              <SelectItem value="female">{t("users.genderFemale") || "Femenino"}</SelectItem>
              <SelectItem value="other">{t("users.genderOther") || "Otro"}</SelectItem>
              <SelectItem value="prefer_not_to_say">{t("users.genderPreferNotToSay") || "Prefiero no decir"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Professional Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="job_title">{t("users.jobTitle") || "Cargo"}</Label>
          <Input
            id="job_title"
            {...register("job_title")}
            disabled={loading || isSubmitting}
            aria-describedby={errors.job_title ? "job_title-error" : undefined}
          />
          {errors.job_title && (
            <p id="job_title-error" className="text-sm text-destructive">
              {errors.job_title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">{t("users.department") || "Departamento"}</Label>
          <Input
            id="department"
            {...register("department")}
            disabled={loading || isSubmitting}
            aria-describedby={errors.department ? "department-error" : undefined}
          />
          {errors.department && (
            <p id="department-error" className="text-sm text-destructive">
              {errors.department.message}
            </p>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferred_language">{t("users.preferredLanguage") || "Idioma Preferido"}</Label>
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
          <Label htmlFor="timezone">{t("users.timezone") || "Zona Horaria"}</Label>
          <Input
            id="timezone"
            placeholder={t("users.timezonePlaceholder") || "America/Bogota"}
            {...register("timezone")}
            disabled={loading || isSubmitting}
          />
        </div>
      </div>

      {/* Additional fields */}
      <div className="space-y-2">
        <Label htmlFor="bio">{t("users.bio") || "Biografía"}</Label>
        <Textarea
          id="bio"
          {...register("bio")}
          rows={3}
          disabled={loading || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("users.notes") || "Notas"}</Label>
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
              <Label htmlFor="is_active">{t("users.isActive") || "Usuario Activo"}</Label>
              <p className="text-sm text-muted-foreground">
                {t("users.isActiveDescription") || "Desactivar un usuario lo deshabilita sin eliminarlo"}
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
              <Label htmlFor="two_factor_enabled">{t("users.twoFactorEnabled") || "Autenticación de Dos Factores"}</Label>
              <p className="text-sm text-muted-foreground">
                {t("users.twoFactorDescription") || "Habilitar 2FA para mayor seguridad"}
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
            {t("users.cancel") || "Cancelar"}
          </Button>
        )}
        <Button type="submit" disabled={loading || isSubmitting}>
          {loading || isSubmitting
            ? t("users.saving") || "Guardando..."
            : isEditing
            ? t("users.updateUser") || "Actualizar Usuario"
            : t("users.createUser") || "Crear Usuario"}
        </Button>
      </div>
    </form>
  );
}








