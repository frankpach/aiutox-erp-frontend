/**
 * Roles Configuration Page
 *
 * Manage roles and their permissions, assign roles to users
 * Uses ConfigPageLayout and shared components for visual consistency
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { showToast } from "~/components/common/Toast";
import { listRoles } from "~/features/users/api/roles.api";
import { useUsers } from "~/features/users/hooks/useUsers";
import type { User } from "~/features/users/types/user.types";
import { ConfigPageLayout } from "~/components/config/ConfigPageLayout";
import { ConfigLoadingState } from "~/components/config/ConfigLoadingState";
import { ConfigErrorState } from "~/components/config/ConfigErrorState";
import { ConfigEmptyState } from "~/components/config/ConfigEmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SearchBar } from "~/components/common/SearchBar";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ShieldIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type GlobalRole = "owner" | "admin" | "manager" | "staff" | "viewer";

const SYSTEM_ROLES: GlobalRole[] = ["owner", "admin"];

export function meta() {
  // Note: meta() runs at build time, so we can't use useTranslation() here
  // These are SEO meta tags and will be overridden by the page title/description
  return [
    { title: "Roles y Permisos - AiutoX ERP" },
    { name: "description", content: "Gestiona los roles y permisos del sistema" },
  ];
}

export default function RolesConfigPage() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<GlobalRole | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const { data: rolesData, isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
  });

  const { users: usersData, loading: usersLoading } = useUsers({
    search: searchUser || undefined,
    page: 1,
    page_size: 20,
  });

  // Agrupar permisos por módulo
  const groupPermissionsByModule = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {};
    permissions.forEach((perm) => {
      const parts = perm.split(".");
      const module = parts[0];
      if (module && !grouped[module]) {
        grouped[module] = [];
      }
      if (module && grouped[module]) {
        grouped[module].push(perm);
      }
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <ConfigPageLayout
        title={t("config.roles.title")}
        description={t("config.roles.description")}
        loading={true}
      >
        <ConfigLoadingState lines={6} />
      </ConfigPageLayout>
    );
  }

  if (error) {
    return (
      <ConfigPageLayout
        title={t("config.roles.title")}
        description={t("config.roles.description")}
        error={error instanceof Error ? error : String(error)}
      >
        <ConfigErrorState message={t("config.roles.errorLoading")} />
      </ConfigPageLayout>
    );
  }

  const roles = rolesData?.data || [];
  const selectedRoleData = roles.find((r) => r.role === selectedRole);

  // Usuarios con el rol seleccionado (simulado - debería venir del backend)
  const usersWithRole: User[] = (usersData || []).filter((u) =>
    u.roles?.some(r => r.role === selectedRole)
  );

  // Columnas para la tabla de usuarios
  const userColumns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: t("config.roles.users"),
      cell: (user) => (
        <div>
          <div className="font-medium">{user.full_name || user.email}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      cell: (user) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // TODO: Implementar remover rol
            showToast(`${t("config.roles.removeRole")} ${user.full_name || user.email}`, "info");
          }}
        >
          {t("config.roles.removeRole")}
        </Button>
      ),
    },
  ];

  return (
    <ConfigPageLayout
      title={t("config.roles.title")}
      description={t("config.roles.description")}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de roles */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("config.roles.systemRoles")}</h3>
            <div className="space-y-2">
              {roles.length === 0 ? (
                <ConfigEmptyState
                  title={t("config.roles.noRoles")}
                  description={t("config.roles.noRolesDesc")}
                />
              ) : (
                roles.map((role) => (
                  <Card
                    key={role.role}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedRole === role.role ? "border-primary border-2" : ""
                    }`}
                    onClick={() => setSelectedRole(role.role as GlobalRole)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold capitalize">{role.role}</h4>
                            {SYSTEM_ROLES.includes(role.role as GlobalRole) && (
                              <Badge variant="secondary">{t("config.roles.roleSystem")}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {role.permissions.length} {t("config.roles.permissionsCount")}
                          </p>
                        </div>
                        <HugeiconsIcon
                          icon={ShieldIcon}
                          size={24}
                          className="text-muted-foreground"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detalles del rol seleccionado */}
        <div className="lg:col-span-2">
          {selectedRoleData ? (
            <Tabs defaultValue="permissions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="permissions">{t("config.roles.permissions")}</TabsTrigger>
                <TabsTrigger value="users">{t("config.roles.users")} ({usersWithRole.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("config.roles.permissionsAssigned")}</CardTitle>
                    <CardDescription>
                      {t("config.roles.permissionsAssignedDesc")} {selectedRoleData.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedRoleData.permissions.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {Object.entries(
                            groupPermissionsByModule(selectedRoleData.permissions)
                          ).map(([module, perms]) => (
                            <div key={module} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold capitalize">{module}</h4>
                                <Badge variant="outline">{perms.length}</Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {perms.map((permission) => (
                                  <Badge
                                    key={permission}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
                              <Separator className="mt-2" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <ConfigEmptyState
                        title={t("config.roles.noPermissions")}
                        description={t("config.roles.noPermissions")}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{t("config.roles.usersWithRole")}</CardTitle>
                        <CardDescription>
                          {t("config.roles.manageUsers")} {selectedRoleData.role}
                        </CardDescription>
                      </div>
                      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>{t("config.roles.assignRoleButton")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("config.roles.assignRole")}</DialogTitle>
                            <DialogDescription>
                              {t("config.roles.assignRoleDesc")} {selectedRoleData.role}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>{t("config.roles.searchUser")}</Label>
                              <SearchBar
                                value={searchUser}
                                onChange={setSearchUser}
                                placeholder={t("config.roles.searchUserPlaceholder")}
                              />
                            </div>
                            {usersLoading ? (
                              <div className="text-center py-8 text-muted-foreground">
                                {t("config.roles.loadingUsers")}
                              </div>
                            ) : usersData && usersData.length > 0 ? (
                              <ScrollArea className="h-[300px]">
                                <div className="space-y-2">
                                  {usersData.map((user) => (
                                    <div
                                      key={user.id}
                                      className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                                    >
                                      <div>
                                        <p className="font-medium">{user.full_name || user.email}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          // TODO: Implementar asignar rol
                                          showToast(`${t("config.roles.roleAssignedTo")} ${user.full_name || user.email}`, "success");
                                          setAssignDialogOpen(false);
                                        }}
                                      >
                                        {t("config.roles.assignRoleButton")}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            ) : (
                              <ConfigEmptyState
                                title={t("config.roles.noUsersFound")}
                                description={t("config.roles.noUsersFoundDesc")}
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {usersWithRole.length > 0 ? (
                      <DataTable
                        columns={userColumns}
                        data={usersWithRole}
                      />
                    ) : (
                      <ConfigEmptyState
                        title={t("config.roles.noUsersWithRole")}
                        description={t("config.roles.noUsersWithRole")}
                        action={
                          <Button onClick={() => setAssignDialogOpen(true)}>
                            {t("config.roles.assignRoleButton")}
                          </Button>
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-2">
                  <HugeiconsIcon
                    icon={ShieldIcon}
                    size={48}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold">{t("config.roles.selectRole")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("config.roles.selectRole")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ConfigPageLayout>
  );
}
