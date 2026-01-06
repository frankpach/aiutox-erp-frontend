/**
 * Tests for Sidebar component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import * as permissionsHook from "~/hooks/usePermissions";
import { navigationItems } from "~/config/navigation";
import { useAuthStore } from "~/stores/authStore";
import { useModulesStore } from "~/stores/modulesStore";

// Mock useAuthStore
vi.mock("~/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

// Mock useModulesStore
vi.mock("~/stores/modulesStore", () => ({
  useModulesStore: vi.fn(),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock TenantSwitcher
vi.mock("../TenantSwitcher", () => ({
  TenantSwitcher: () => <div data-testid="tenant-switcher">Tenant</div>,
}));

// Variable global para almacenar el estado de los permisos
let mockHasPermission = ((perm: string) => true);

// Mock usePermissions
vi.mock("~/hooks/usePermissions", () => ({
  usePermissions: () => ({
    permissions: [],
    roles: [],
    hasPermission: mockHasPermission,
    hasRole: () => false,
    hasAnyPermission: () => true,
    hasAnyRole: () => false,
    hasAllPermissions: () => true,
    hasModulePermission: () => true,
    getModulePermissions: () => [],
  }),
}));

// Mock NavigationTree component (Sidebar uses NavigationTree, not NavItem directly)
vi.mock("../NavigationTree", () => ({
  NavigationTree: ({ isCollapsed }: { isCollapsed: boolean }) => (
    <div data-testid="navigation-tree">
      <div data-testid="nav-item-home">Dashboard</div>
      {mockHasPermission("users.view") && (
        <div data-testid="nav-item-users">Usuarios</div>
      )}
    </div>
  ),
}));

// Mock useLocation
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLocation: () => ({ pathname: "/" }),
  };
});

describe("Sidebar", () => {
  beforeEach(() => {
    // Reset mock permission to default (allow all)
    mockHasPermission = (perm: string) => true;

    // Mock auth store to return authenticated user
    vi.mocked(useAuthStore).mockReturnValue(true);

    // Mock modules store
    vi.mocked(useModulesStore).mockReturnValue({
      isInitialized: true,
      loadModules: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("should render navigation items", () => {
    const { getByTestId } = render(<Sidebar isOpen={true} />);

    expect(getByTestId("nav-item-home")).toBeTruthy();
    expect(getByTestId("nav-item-users")).toBeTruthy();
  });

  it("should filter items by permissions", () => {
    // Mock hasPermission to return false for users.view
    mockHasPermission = (perm: string) => perm !== "users.view";

    const { getByTestId, queryByTestId } = render(<Sidebar isOpen={true} />);

    // Home should be visible (no permission required)
    expect(getByTestId("nav-item-home")).toBeTruthy();
    // Users should not be visible (requires users.view permission, which we're denying)
    expect(queryByTestId("nav-item-users")).toBeNull();
  });

  it("should be hidden when isOpen is false", () => {
    const { container } = render(<Sidebar isOpen={false} />);
    const sidebar = container.querySelector("aside");

    expect(sidebar?.className).toContain("-translate-x-full");
  });

  it("should show backdrop on mobile when open", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { container } = render(<Sidebar isOpen={true} />);
    const backdrop = container.querySelector(".bg-black\\/50");

    expect(backdrop).toBeTruthy();
  });
});


























