/**
 * UsersList Component
 * Displays a list of users with SavedFilters integration.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Save } from "lucide-react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { SavedFilters } from "../../views/components/SavedFilters";
import { FilterEditorModal } from "../../views/components/FilterEditorModal";
import { FilterManagementModal } from "../../views/components/FilterManagementModal";
import { userFieldsConfig } from "../../views/config/userFields";
import { useSavedFilters } from "../../views/hooks/useSavedFilters";
import { useFilterUrlSync } from "../../views/hooks/useFilterUrlSync";
import { getUsers, type User, type UsersListParams } from "../api/users.api";
import type { StandardListResponse, SavedFilter, SavedFilterCreate } from "../../views/types/savedFilter.types";

export interface UsersListProps {
  onManageFiltersClick?: () => void;
}

/**
 * UsersList component with SavedFilters integration
 */
export function UsersList({ onManageFiltersClick }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }>({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 0,
  });

  const [editorOpen, setEditorOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [_savingCurrentFilter, setSavingCurrentFilter] = useState(false);
  const { t } = useTranslation();

  const { filterId, updateFilterId } = useFilterUrlSync();
  const {
    defaultFilter: _defaultFilter,
    getDefaultFilter,
    refreshFilters,
    createFilter,
  } = useSavedFilters("users", true);

  // Apply default filter on mount if no filter in URL
  useEffect(() => {
    if (!filterId) {
      const defaultFilterForModule = getDefaultFilter("users");
      if (defaultFilterForModule) {
        updateFilterId(defaultFilterForModule.id);
      }
    }
  }, [filterId, getDefaultFilter, updateFilterId]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: UsersListParams = {
        page: pagination.page,
        page_size: pagination.page_size,
        saved_filter_id: filterId || undefined,
      };

      const response: StandardListResponse<User> = await getUsers(params);
      setUsers(response.data);
      setPagination({
        total: response.meta.total,
        page: response.meta.page,
        page_size: response.meta.page_size,
        total_pages: response.meta.total_pages,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [filterId, pagination.page, pagination.page_size]);

  // Load users when filter changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleApplyFilter = (newFilterId: string | null) => {
    updateFilterId(newFilterId);
    // Reset to page 1 when filter changes
    setPagination((prev) => ({ ...prev, page: 1 }));
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
    <div className="space-y-4">
      {/* Filters and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
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
              {t("savedFilters.saveCurrent")}
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">{t("users.loading")}</div>
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
            onClick={loadUsers}
            className="mt-2"
          >
            {t("users.retry")}
          </Button>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">
                {filterId
                  ? t("users.noUsersWithFilter")
                  : t("users.noUsers")}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">{t("users.email")}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t("users.name")}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t("users.status")}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t("users.created")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          {user.full_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                              user.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {user.is_active ? t("users.active") : t("users.inactive")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t("users.showing")} {users.length} {t("users.of")} {pagination.total} {t("users.users")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                    >
                      {t("users.previous")}
                    </Button>
                    <span className="text-sm">
                      Página {pagination.page} de {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.total_pages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page >= pagination.total_pages}
                    >
                      {t("users.next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

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
  );
}



