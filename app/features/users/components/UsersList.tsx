/**
 * UsersList Component
 * Displays a list of users with SavedFilters integration, pagination, and actions.
 */

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Save, MoreVertical, Eye, Edit, Trash2, Shield } from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { showToast } from "~/components/common/Toast";
import { UserListSkeleton } from "~/components/common/UserListSkeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { SavedFilters } from "../../views/components/SavedFilters";
import { FilterEditorModal } from "../../views/components/FilterEditorModal";
import { FilterManagementModal } from "../../views/components/FilterManagementModal";
import { userFieldsConfig } from "../../views/config/userFields";
import { useSavedFilters } from "../../views/hooks/useSavedFilters";
import { useFilterUrlSync } from "../../views/hooks/useFilterUrlSync";
import { useUsers, useDeleteUser } from "../hooks/useUsers";
import type { User } from "../types/user.types";
import type { SavedFilter, SavedFilterCreate } from "../../views/types/savedFilter.types";

export interface UsersListProps {
  onManageFiltersClick?: () => void;
}

/**
 * UsersList component with SavedFilters integration
 */
export function UsersList({ onManageFiltersClick }: UsersListProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [_savingCurrentFilter, setSavingCurrentFilter] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });
  const { t } = useTranslation();

  const { filterId, updateFilterId } = useFilterUrlSync();
  const {
    defaultFilter: _defaultFilter,
    getDefaultFilter,
    refreshFilters,
    createFilter,
  } = useSavedFilters("users", true);

  // Use the new useUsers hook
  const { users, loading, error, pagination, refresh } = useUsers({
    page,
    page_size: pageSize,
    search: search || undefined,
    is_active: isActiveFilter,
    saved_filter_id: filterId || undefined,
  });

  const { remove: deleteUser, loading: deleting } = useDeleteUser();

  // Apply default filter on mount if no filter in URL
  useEffect(() => {
    if (!filterId) {
      const defaultFilterForModule = getDefaultFilter("users");
      if (defaultFilterForModule) {
        updateFilterId(defaultFilterForModule.id);
      }
    }
  }, [filterId, getDefaultFilter, updateFilterId]);

  const handleApplyFilter = (newFilterId: string | null) => {
    updateFilterId(newFilterId);
    // Reset to page 1 when filter changes
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleteConfirm({ open: true, userId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.userId) return;

    const success = await deleteUser(deleteConfirm.userId);
    if (success) {
      showToast("Usuario eliminado exitosamente", "success");
      refresh();
    } else {
      showToast("Error al eliminar el usuario", "error");
    }
    setDeleteConfirm({ open: false, userId: null });
  };

  const handleSaveCurrentFilter = () => {
    // Open editor modal to save current filter
    // Note: In a real implementation, we'd need to capture the current filter state
    // For now, we'll open the editor and let the user build the filter
    setEditingFilter(null);
    setSavingCurrentFilter(true);
    setEditorOpen(true);
  };

  const handleSaveFilter = async (filterData: SavedFilterCreate) => {
    const saved = await createFilter(filterData);
    if (saved) {
      setEditorOpen(false);
      setEditingFilter(null);
      setSavingCurrentFilter(false);
      await refreshFilters();
      // Optionally apply the new filter
      updateFilterId(saved.id);
    }
    return saved;
  };

  const handleEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setEditorOpen(true);
  };

  const handleManageFilters = () => {
    setManagementOpen(true);
    if (onManageFiltersClick) {
      onManageFiltersClick();
    }
  };

  const _currentFilter = filterId
    ? users.length > 0 || loading
      ? t("savedFilters.applying")
      : null
    : null;

  return (
    <TooltipProvider>
      <div className="space-y-4">
      {/* Filters and Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SavedFilters
            module="users"
            fields={userFieldsConfig}
            onApply={handleApplyFilter}
            currentFilterId={filterId}
            onManageClick={handleManageFilters}
          />
          {filterId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveCurrentFilter}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{t("savedFilters.saveCurrent")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <UserListSkeleton rows={pageSize} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4">
          <div className="text-sm text-destructive">
            {t("users.error")}: {error.message}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            className="mt-2"
          >
            {t("users.retry")}
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder={t("users.search") || "Buscar usuarios..."}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-md"
        />
        <select
          value={isActiveFilter === undefined ? "all" : isActiveFilter ? "active" : "inactive"}
          onChange={(e) => {
            const value = e.target.value;
            setIsActiveFilter(
              value === "all" ? undefined : value === "active"
            );
            setPage(1);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[150px]"
        >
          <option value="all">{t("users.allStatus") || "Todos"}</option>
          <option value="active">{t("users.active") || "Activos"}</option>
          <option value="inactive">{t("users.inactive") || "Inactivos"}</option>
        </select>
      </div>

      {/* Users Table */}
      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">
                {filterId
                  ? t("users.noUsersWithFilter") || "No se encontraron usuarios con el filtro aplicado"
                  : t("users.noUsers") || "No hay usuarios"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">{t("users.email") || "Email"}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">{t("users.name") || "Nombre"}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">{t("users.jobTitle") || "Cargo"}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t("users.status") || "Estado"}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium hidden xl:table-cell">{t("users.created") || "Creado"}</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">{t("users.actions") || "Acciones"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium">{user.email}</td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell">
                          {user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                          {user.job_title || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                              user.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {user.is_active ? t("users.active") || "Activo" : t("users.inactive") || "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden xl:table-cell">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <TooltipProvider>
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">Acciones</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Acciones del usuario</p>
                                </TooltipContent>
                              </Tooltip>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/users/${user.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  {t("users.view") || "Ver"}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/users/${user.id}/edit`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  {t("users.edit") || "Editar"}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/users/${user.id}/roles`} className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  {t("users.manageRoles") || "Gestionar Roles"}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleting}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("users.delete") || "Eliminar"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          </TooltipProvider>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t("users.showing") || "Mostrando"} {users.length} {t("users.of") || "de"} {pagination.total} {t("users.users") || "usuarios"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      {t("users.previous") || "Anterior"}
                    </Button>
                    <span className="text-sm">
                      {t("users.page") || "Página"} {page} {t("users.of") || "de"} {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(pagination.total_pages, page + 1))}
                      disabled={page >= pagination.total_pages}
                    >
                      {t("users.next") || "Siguiente"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, userId: null })}
        onConfirm={confirmDelete}
        title={t("users.confirmDeleteTitle") || "Eliminar Usuario"}
        description={
          t("users.confirmDelete") ||
          "¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        }
        confirmText={t("users.delete") || "Eliminar"}
        cancelText={t("users.cancel") || "Cancelar"}
        variant="destructive"
        loading={deleting}
      />

      {/* Filter Editor Modal */}
      <FilterEditorModal
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingFilter(null);
          setSavingCurrentFilter(false);
        }}
        onSave={handleSaveFilter}
        filter={editingFilter}
        module="users"
        fields={userFieldsConfig}
      />

      {/* Filter Management Modal */}
      <FilterManagementModal
        open={managementOpen}
        onClose={() => setManagementOpen(false)}
        module="users"
        onEditFilter={handleEditFilter}
      />
    </div>
    </TooltipProvider>
  );
}

