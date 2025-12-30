/**
 * Tests for RolesConfigPage component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RolesConfigPage from "../config.roles";
import apiClient from "~/lib/api/client";
import * as useTranslationHook from "~/lib/i18n/useTranslation";
import { toast } from "sonner";

// Mock apiClient
vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("RolesConfigPage", () => {
  const mockRoles: Array<{ role: string; permissions: string[] }> = [
    {
      role: "owner",
      permissions: ["*.*"],
    },
    {
      role: "admin",
      permissions: ["users.*", "config.*"],
    },
    {
      role: "manager",
      permissions: ["products.view", "products.edit"],
    },
  ];

  const mockUsers = [
    {
      id: "user1",
      email: "admin@example.com",
      full_name: "Admin User",
      is_active: true,
    },
    {
      id: "user2",
      email: "manager@example.com",
      full_name: "Manager User",
      is_active: true,
    },
  ];

  const defaultMockUseTranslation = {
    t: (key: string) => {
      const translations: Record<string, string> = {
        "config.roles.title": "Roles y Permisos",
        "config.roles.description": "Gestiona roles y sus permisos en el sistema",
        "config.roles.loading": "Cargando roles...",
        "config.roles.errorLoading": "Error al cargar roles",
        "config.roles.systemRoles": "Roles del Sistema",
        "config.roles.selectRole": "Selecciona un rol para ver sus detalles",
        "config.roles.permissions": "Permisos",
        "config.roles.users": "Usuarios",
        "config.roles.permissionsAssigned": "Permisos Asignados",
        "config.roles.usersWithRole": "Usuarios con rol",
        "config.roles.manageUsers": "Gestiona los usuarios que tienen este rol asignado",
        "config.roles.searchUser": "Buscar Usuario",
        "config.roles.searchUserPlaceholder": "Buscar por nombre o email...",
        "config.roles.assignRole": "Asignar Rol a Usuario",
        "config.roles.assignRoleButton": "Asignar Rol",
        "config.roles.usersWithThisRole": "Usuarios con este rol",
        "config.roles.noUsersWithRole": "No hay usuarios con este rol asignado",
        "config.roles.removeRole": "Remover",
        "config.roles.removeRoleConfirm": "¿Estás seguro de remover el rol",
        "config.roles.from": "de",
        "config.roles.roleAssignedSuccess": "Rol asignado exitosamente",
        "config.roles.roleRemovedSuccess": "Rol removido exitosamente",
        "config.roles.errorAssigning": "Error al asignar rol",
        "config.roles.errorRemoving": "Error al remover rol",
        "config.roles.systemRoleWarning": "Este es un rol del sistema y no puede ser modificado",
        "config.roles.allModules": "Todos los módulos",
        "config.roles.module": "Módulo",
        "config.roles.noPermissions": "No hay permisos asignados",
        "config.roles.permissionsCount": "permisos",
        "config.roles.roleSystem": "Sistema",
        "config.roles.roleOwner": "Propietario",
        "config.roles.roleOwnerDesc": "Acceso total al sistema",
        "config.roles.roleAdmin": "Administrador",
        "config.roles.roleAdminDesc": "Acceso administrativo",
        "config.roles.roleManager": "Gerente",
        "config.roles.roleManagerDesc": "Acceso de gestión",
        "config.roles.roleStaff": "Personal",
        "config.roles.roleStaffDesc": "Acceso básico",
        "config.roles.roleViewer": "Visualizador",
        "config.roles.roleViewerDesc": "Solo lectura",
        "config.roles.roleSystemDesc": "Rol del sistema",
        "config.roles.assigned": "Asignado",
        "config.roles.loadingUsers": "Cargando usuarios...",
        "config.roles.infoTitle": "Sobre Roles y Permisos",
        "config.roles.infoSystemRoles": "Los roles del sistema no pueden ser modificados",
        "config.roles.infoPermissions": "Los permisos se organizan por módulos",
        "config.roles.infoMultipleRoles": "Un usuario puede tener múltiples roles",
        "config.roles.infoEffectivePermissions": "Los permisos efectivos son la unión de todos los roles",
        "config.common.selectUser": "Selecciona un usuario...",
        "config.common.assigning": "Asignando...",
        "config.common.errorUnknown": "Error desconocido",
      };
      return translations[key] || key;
    },
    setLanguage: vi.fn(),
    language: "es" as const,
  };

  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTranslationHook.useTranslation).mockReturnValue(
      defaultMockUseTranslation
    );

    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
      },
    });
    queryClient.clear();

    // Default mock for roles API
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === "/auth/roles") {
        return Promise.resolve({
          data: {
            data: mockRoles,
            meta: {
              total: mockRoles.length,
              page: 1,
              page_size: 100,
              total_pages: 1,
            },
            error: null,
          },
        } as any);
      }
      if (url === "/users?page_size=100") {
        return Promise.resolve({
          data: {
            data: mockUsers,
            meta: {
              total: mockUsers.length,
              page: 1,
              page_size: 100,
              total_pages: 1,
            },
            error: null,
          },
        } as any);
      }
      if (url.startsWith("/auth/roles/") && url.split("/").length === 4) {
        // User roles endpoint: /auth/roles/{user_id}
        const userId = url.split("/").pop();
        return Promise.resolve({
          data: {
            roles: [],
            total: 0,
          },
        } as any);
      }
      // For any other URL, return empty data to avoid errors
      return Promise.resolve({
        data: {
          data: [],
          meta: null,
          error: null,
        },
      } as any);
    });

    // Default mocks for mutations
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        data: { role: "admin", granted_by: null, created_at: new Date().toISOString() },
        meta: null,
        error: null,
      },
    } as any);

    vi.mocked(apiClient.delete).mockResolvedValue({} as any);
  });

  const renderWithRouter = () => {
    const router = createMemoryRouter(
      [
        {
          path: "/config/roles",
          element: (
            <QueryClientProvider client={queryClient}>
              <RolesConfigPage />
            </QueryClientProvider>
          ),
        },
      ],
      {
        initialEntries: ["/config/roles"],
      }
    );

    return render(<RouterProvider router={router} />);
  };

  describe("rendering", () => {
    it("should render roles configuration page", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Roles y Permisos")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Gestiona roles y sus permisos en el sistema/i)
      ).toBeInTheDocument();
    });

    it("should show loading state", async () => {
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
          },
        },
      });
      testQueryClient.clear();

      vi.mocked(apiClient.get).mockImplementation(
        (url: string) =>
          new Promise((resolve) => {
            setTimeout(() => {
              if (url === "/auth/roles") {
                resolve({
                  data: {
                    data: mockRoles,
                    meta: {
                      total: mockRoles.length,
                      page: 1,
                      page_size: 100,
                      total_pages: 1,
                    },
                    error: null,
                  },
                } as any);
              } else {
                resolve({ data: { data: [], meta: null, error: null } } as any);
              }
            }, 100);
          })
      );

      const router = createMemoryRouter(
        [
          {
            path: "/config/roles",
            element: (
              <QueryClientProvider client={testQueryClient}>
                <RolesConfigPage />
              </QueryClientProvider>
            ),
          },
        ],
        {
          initialEntries: ["/config/roles"],
        }
      );

      render(<RouterProvider router={router} />);

      expect(screen.getByText("Cargando roles...")).toBeInTheDocument();
    });

    it("should show error message when error occurs", async () => {
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
          },
        },
      });
      testQueryClient.clear();

      const mockError = new Error("Failed to load roles");
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      const router = createMemoryRouter(
        [
          {
            path: "/config/roles",
            element: (
              <QueryClientProvider client={testQueryClient}>
                <RolesConfigPage />
              </QueryClientProvider>
            ),
          },
        ],
        {
          initialEntries: ["/config/roles"],
        }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Error al cargar roles/i)
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("loading roles from API", () => {
    it("should load roles from API on mount", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith("/auth/roles");
      });
    });

    it("should display loaded roles", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Propietario")).toBeInTheDocument();
      });

      expect(screen.getByText("Administrador")).toBeInTheDocument();
      expect(screen.getByText("Gerente")).toBeInTheDocument();
    });
  });

  describe("role selection", () => {
    it("should show select role message when no role is selected", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Selecciona un rol para ver sus detalles")).toBeInTheDocument();
      });
    });

    it("should display role details when role is selected", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Propietario")).toBeInTheDocument();
      });

      // Click on owner role
      const ownerRole = screen.getByText("Propietario");
      await user.click(ownerRole);

      await waitFor(() => {
        expect(screen.getByText("Permisos")).toBeInTheDocument();
        expect(screen.getByText("Usuarios")).toBeInTheDocument();
      });
    });
  });

  describe("permissions display", () => {
    it("should display permissions when role is selected", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Administrador")).toBeInTheDocument();
      });

      // Click on admin role
      const adminRole = screen.getByText("Administrador");
      await user.click(adminRole);

      await waitFor(() => {
        expect(screen.getByText("Permisos Asignados")).toBeInTheDocument();
      });
    });

    it("should group permissions by module", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Administrador")).toBeInTheDocument();
      });

      // Click on admin role
      const adminRole = screen.getByText("Administrador");
      await user.click(adminRole);

      await waitFor(() => {
        expect(screen.getByText("Permisos")).toBeInTheDocument();
      });

      // Click on Permissions tab
      const permissionsTab = screen.getByText("Permisos");
      await user.click(permissionsTab);

      await waitFor(() => {
        expect(screen.getByText("Permisos Asignados")).toBeInTheDocument();
      });
    });
  });

  describe("role assignment", () => {
    it("should display users tab when role is selected", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Administrador")).toBeInTheDocument();
      });

      // Click on admin role
      const adminRole = screen.getByText("Administrador");
      await user.click(adminRole);

      await waitFor(() => {
        expect(screen.getByText("Usuarios")).toBeInTheDocument();
      });
    });

    it("should display assign role section", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Administrador")).toBeInTheDocument();
      });

      // Click on admin role
      const adminRole = screen.getByText("Administrador");
      await user.click(adminRole);

      await waitFor(() => {
        expect(screen.getByText("Usuarios")).toBeInTheDocument();
      });

      // Click on Users tab
      const usersTab = screen.getByText("Usuarios");
      await user.click(usersTab);

      await waitFor(() => {
        expect(screen.getByText("Asignar Rol a Usuario")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
          },
        },
      });
      testQueryClient.clear();

      const networkError = new Error("Network error");
      vi.mocked(apiClient.get).mockRejectedValue(networkError);

      const router = createMemoryRouter(
        [
          {
            path: "/config/roles",
            element: (
              <QueryClientProvider client={testQueryClient}>
                <RolesConfigPage />
              </QueryClientProvider>
            ),
          },
        ],
        {
          initialEntries: ["/config/roles"],
        }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Error al cargar roles/i)
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("validation", () => {
    it("should display system role warning for system roles", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Propietario")).toBeInTheDocument();
      });

      // Click on owner role (system role)
      const ownerRole = screen.getByText("Propietario");
      await user.click(ownerRole);

      await waitFor(() => {
        expect(screen.getByText(/Este es un rol del sistema y no puede ser modificado/i)).toBeInTheDocument();
      });
    });
  });
});

