/**
 * Tests for Sidebar component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import * as permissionsHook from "~/hooks/usePermissions";
import { navigationItems } from "~/config/navigation";

// Mock usePermissions
vi.mock("~/hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

// Mock NavItem component
vi.mock("../NavItem", () => ({
  NavItem: ({ item }: { item: typeof navigationItems[0] }) => (
    <div data-testid={`nav-item-${item.id}`}>{item.label}</div>
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
    vi.mocked(permissionsHook.usePermissions).mockReturnValue({
      permissions: [],
      roles: [],
      hasPermission: () => true,
      hasRole: () => false,
      hasAnyPermission: () => true,
      hasAnyRole: () => false,
      hasAllPermissions: () => true,
    });
  });

  it("should render navigation items", () => {
    const { getByTestId } = render(<Sidebar isOpen={true} />);

    expect(getByTestId("nav-item-home")).toBeTruthy();
    expect(getByTestId("nav-item-users")).toBeTruthy();
  });

  it("should filter items by permissions", () => {
    // Mock hasPermission to return false for users.view
    vi.mocked(permissionsHook.usePermissions).mockReturnValue({
      permissions: [],
      roles: [],
      hasPermission: (perm: string) => {
        // Return false for users.view to test filtering
        return perm !== "users.view";
      },
      hasRole: () => false,
      hasAnyPermission: () => false,
      hasAnyRole: () => false,
      hasAllPermissions: () => false,
    });

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










