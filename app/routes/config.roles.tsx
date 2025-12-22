import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/api/client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { StandardListResponse, StandardResponse } from "~/lib/api/types/common.types";
import { toast } from "sonner";

interface RoleWithPermissions {
  role: string;
  permissions: string[];
}

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

interface UserRole {
  role: string;
  granted_by: string | null;
  created_at: string;
}

// Role display names and descriptions
const ROLE_INFO: Record<string, { display_name: string; description: string }> = {
  owner: {
    display_name: "Propietario",
    description: "Acceso total al sistema. Control completo sobre la organización.",
  },
  admin: {
    display_name: "Administrador",
    description: "Administrador del sistema con acceso casi completo. Puede gestionar usuarios, roles y configuraciones.",
  },
  manager: {
    display_name: "Gestor",
    description: "Gestor con acceso a módulos asignados. Puede gestionar operaciones de negocio.",
  },
  staff: {
    display_name: "Personal",
    description: "Personal operativo con acceso limitado a funciones específicas.",
  },
  viewer: {
    display_name: "Visualizador",
    description: "Solo lectura. Puede ver información pero no realizar cambios.",
  },
};

// System roles that cannot be modified
const SYSTEM_ROLES = ["owner", "admin"];

export default function RolesConfigPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<string>("");
  const [searchUser, setSearchUser] = useState("");

  // Fetch roles from backend
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await apiClient.get<StandardListResponse<RoleWithPermissions>>(
        "/auth/roles"
      );
      return response.data.data;
    },
  });

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const response = await apiClient.get<StandardListResponse<User>>(
        "/users?page_size=100"
      );
      return response.data.data;
    },
  });

  // Fetch users with selected role
  const { data: usersWithRole, isLoading: isLoadingUsersWithRole } = useQuery({
    queryKey: ["users", "role", selectedRole],
    queryFn: async () => {
      if (!selectedRole) return [];
      // Fetch all users and check their roles
      const users = usersData || [];
      const usersWithRoleData: Array<User & { userRole: UserRole }> = [];

      for (const user of users) {
        try {
          const roleResponse = await apiClient.get<{ roles: UserRole[]; total: number }>(
            `/auth/roles/${user.id}`
          );
          const userRoles = roleResponse.data.roles || [];
          const hasRole = userRoles.some((ur) => ur.role === selectedRole);
          if (hasRole) {
            const userRole = userRoles.find((ur) => ur.role === selectedRole)!;
            usersWithRoleData.push({ ...user, userRole });
          }
        } catch (error) {
          // User might not have roles, skip
          console.warn(`Could not fetch roles for user ${user.id}:`, error);
        }
      }

      return usersWithRoleData;
    },
    enabled: !!selectedRole && !!usersData,
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiClient.post<StandardResponse<UserRole>>(
        `/auth/roles/${userId}`,
        { role }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "role", selectedRole] });
      toast.success("Rol asignado exitosamente");
      setSelectedUserForRole("");
    },
    onError: (error: any) => {
      toast.error(`Error al asignar rol: ${error.response?.data?.error?.message || error.message}`);
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiClient.delete(`/auth/roles/${userId}/${role}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "role", selectedRole] });
      toast.success("Rol removido exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error al remover rol: ${error.response?.data?.error?.message || error.message}`);
    },
  });

  // Group permissions by module
  const groupPermissionsByModule = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {};
    for (const perm of permissions) {
      const parts = perm.split(".");
      const module = parts[0];
      if (module) {
        if (!grouped[module]) {
          grouped[module] = [];
        }
        grouped[module].push(perm);
      }
    }
    return grouped;
  };

  const selectedRoleData = rolesData?.find((r: RoleWithPermissions) => r.role === selectedRole);
  const permissionsByModule = selectedRoleData
    ? groupPermissionsByModule(selectedRoleData.permissions)
    : {};

  // Filter users for assignment
  const availableUsers = usersData?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchUser.toLowerCase())
  ) || [];

  // Filter users with role
  const filteredUsersWithRole = usersWithRole?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchUser.toLowerCase())
  ) || [];

  if (isLoadingRoles) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Cargando roles...</p>
      </div>
    );
  }

  if (rolesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">
          Error al cargar roles: {rolesError instanceof Error ? rolesError.message : "Error desconocido"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles y Permisos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona roles y sus permisos en el sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Roles */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold">Roles del Sistema</h2>
          <div className="space-y-2">
            {rolesData?.map((role: RoleWithPermissions) => {
              const roleInfo = ROLE_INFO[role.role] || {
                display_name: role.role,
                description: "Rol del sistema",
              };
              const isSystem = SYSTEM_ROLES.includes(role.role);
              return (
                <button
                  key={role.role}
                  onClick={() => setSelectedRole(role.role)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedRole === role.role
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{roleInfo.display_name}</span>
                    {isSystem && (
                      <Badge variant="outline" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{roleInfo.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {role.permissions.length} permiso(s)
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalles del Rol */}
        <div className="lg:col-span-2">
          {selectedRoleData ? (
            <Tabs defaultValue="permissions" className="w-full">
              <TabsList>
                <TabsTrigger value="permissions">Permisos</TabsTrigger>
                <TabsTrigger value="users">Usuarios ({filteredUsersWithRole.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      {ROLE_INFO[selectedRoleData.role]?.display_name || selectedRoleData.role}
                    </h2>
                    <p className="text-gray-600">
                      {ROLE_INFO[selectedRoleData.role]?.description || "Rol del sistema"}
                    </p>
                    {SYSTEM_ROLES.includes(selectedRoleData.role) && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ Este es un rol del sistema y no puede ser modificado
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">
                      Permisos Asignados ({selectedRoleData.permissions.length})
                    </h3>
                    {Object.keys(permissionsByModule).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(permissionsByModule).map(([module, perms]) => (
                          <div key={module} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-700 mb-2 capitalize">
                              {module === "*" ? "Todos los módulos" : `Módulo: ${module}`}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {perms.map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay permisos asignados</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      Usuarios con rol: {ROLE_INFO[selectedRoleData.role]?.display_name || selectedRoleData.role}
                    </h2>
                    <p className="text-gray-600">
                      Gestiona los usuarios que tienen este rol asignado
                    </p>
                  </div>

                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search-user">Buscar Usuario</Label>
                    <Input
                      id="search-user"
                      placeholder="Buscar por nombre o email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                    />
                  </div>

                  {/* Assign Role */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Asignar Rol a Usuario</h3>
                    <div className="flex gap-2">
                      <Select value={selectedUserForRole} onValueChange={setSelectedUserForRole}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecciona un usuario..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers
                            .filter(
                              (user) =>
                                !filteredUsersWithRole.some((ur) => ur.id === user.id)
                            )
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name} ({user.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          if (selectedUserForRole && selectedRole) {
                            assignRoleMutation.mutate({
                              userId: selectedUserForRole,
                              role: selectedRole,
                            });
                          }
                        }}
                        disabled={!selectedUserForRole || assignRoleMutation.isPending}
                      >
                        {assignRoleMutation.isPending ? "Asignando..." : "Asignar Rol"}
                      </Button>
                    </div>
                  </div>

                  {/* Users with Role */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      Usuarios con este rol ({filteredUsersWithRole.length})
                    </h3>
                    {isLoadingUsersWithRole ? (
                      <p className="text-gray-500">Cargando usuarios...</p>
                    ) : filteredUsersWithRole.length > 0 ? (
                      <div className="space-y-2">
                        {filteredUsersWithRole.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{user.full_name || user.email}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.userRole?.created_at && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Asignado: {new Date(user.userRole.created_at).toLocaleDateString("es-ES")}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Estás seguro de remover el rol "${ROLE_INFO[selectedRoleData.role]?.display_name}" de ${user.full_name || user.email}?`
                                  )
                                ) {
                                  removeRoleMutation.mutate({
                                    userId: user.id,
                                    role: selectedRoleData.role,
                                  });
                                }
                              }}
                              disabled={removeRoleMutation.isPending}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay usuarios con este rol asignado</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center h-64">
              <p className="text-gray-500">
                Selecciona un rol para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          ℹ️ Sobre Roles y Permisos
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Los roles del sistema (Propietario, Administrador) no pueden ser modificados</li>
          <li>Los permisos se organizan por módulos del sistema</li>
          <li>Un usuario puede tener múltiples roles asignados</li>
          <li>Los permisos efectivos de un usuario son la unión de todos sus roles</li>
        </ul>
      </div>
    </div>
  );
}
