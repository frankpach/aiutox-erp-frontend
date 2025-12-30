/**
 * User Edit Page
 *
 * Form for editing user information
 * Uses PageLayout for consistent visual structure
 */

import type { Route } from "./+types/users.$id.edit";
import { useParams, useNavigate } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";
import { UserForm } from "~/features/users/components/UserForm";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { LoadingState } from "~/components/common/LoadingState";
import { ErrorState } from "~/components/common/ErrorState";
import { useUser, useUpdateUser } from "~/features/users/hooks/useUsers";
import { showToast } from "~/components/common/Toast";
import type { UserUpdate } from "~/features/users/types/user.types";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Editar Usuario - AiutoX ERP" },
    { name: "description", content: "Editar información del usuario" },
  ];
}

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading, error } = useUser(id || null);
  const { mutateAsync: updateUserAsync, isPending: updating } = useUpdateUser();

  const handleSubmit = async (data: UserUpdate) => {
    if (!id) return;
    try {
      await updateUserAsync({ userId: id, data });
      showToast(t("users.updateSuccess") || "Usuario actualizado exitosamente", "success");
      navigate(`/users/${id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("users.updateError") || "Error al actualizar el usuario";
      showToast(errorMessage, "error");
    }
  };

  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  return (
    <PageLayout
      title={t("users.editTitle") || "Editar Usuario"}
      description={user?.email || t("users.editDescription") || "Modifica la información del usuario"}
      breadcrumb={[
        { label: t("users.title") || "Usuarios", href: "/users" },
        { label: user?.email || id || "", href: `/users/${id}` },
        { label: t("common.edit") || "Editar" },
      ]}
      loading={loading}
      error={error}
    >
      {loading && <LoadingState />}
      {error && <ErrorState message={error instanceof Error ? error.message : t("users.error") || "Error"} />}
      {user && (
        <UserForm
          user={user}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </PageLayout>
  );
}
