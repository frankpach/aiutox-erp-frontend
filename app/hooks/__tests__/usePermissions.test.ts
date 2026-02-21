/**
 * Tests for usePermissions hooks
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissions, useHasPermission, useHasRole } from "../usePermissions";

// Mock the auth store
interface AuthState {
  isAuthenticated: boolean;
  user: unknown;
  permissions?: string[];
  roles?: string[];
}

const mockUseAuthStore = vi.fn();
vi.mock("~/stores/authStore", () => ({
  useAuthStore: (selector: (state: AuthState) => unknown) => mockUseAuthStore(selector),
}));

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty arrays when user is null", () => {
    mockUseAuthStore.mockImplementation((selector) => selector({ user: null }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.permissions).toEqual([]);
    expect(result.current.roles).toEqual([]);
    expect(result.current.hasPermission("test.permission")).toBe(false);
    expect(result.current.hasRole("admin")).toBe(false);
  });

  it("should return user permissions and roles", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["inventory.view", "inventory.edit"],
      roles: [{ role: "admin" }, { role: "inventory.leader" }],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.permissions).toEqual(["inventory.view", "inventory.edit"]);
    expect(result.current.roles).toEqual([{ role: "admin" }, { role: "inventory.leader" }]);
  });

  it("should check exact permission", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["inventory.view"],
      roles: [],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission("inventory.view")).toBe(true);
    expect(result.current.hasPermission("inventory.edit")).toBe(false);
  });

  it("should check wildcard permission (*)", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["*"],
      roles: [],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission("inventory.view")).toBe(true);
    expect(result.current.hasPermission("users.edit")).toBe(true);
    expect(result.current.hasPermission("any.permission")).toBe(true);
  });

  it("should check module wildcard permission (module.*)", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["inventory.*"],
      roles: [],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission("inventory.view")).toBe(true);
    expect(result.current.hasPermission("inventory.edit")).toBe(true);
    expect(result.current.hasPermission("inventory.delete")).toBe(true);
    expect(result.current.hasPermission("users.view")).toBe(false);
  });

  it("should check role", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: [],
      roles: [{ role: "admin" }],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasRole("admin")).toBe(true);
    expect(result.current.hasRole("user")).toBe(false);
  });

  it("should check any permission", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["inventory.view"],
      roles: [],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasAnyPermission(["inventory.view", "users.edit"])).toBe(true);
    expect(result.current.hasAnyPermission(["users.edit", "users.delete"])).toBe(false);
  });

  it("should check all permissions", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["inventory.view", "inventory.edit"],
      roles: [],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasAllPermissions(["inventory.view", "inventory.edit"])).toBe(true);
    expect(result.current.hasAllPermissions(["inventory.view", "users.edit"])).toBe(false);
  });
});

describe("useHasPermission", () => {
  it("should return true when user has permission", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["inventory.view"],
      roles: [],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => useHasPermission("inventory.view"));

    expect(result.current).toBe(true);
  });

  it("should return false when user does not have permission", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: ["inventory.view"],
      roles: [],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => useHasPermission("inventory.edit"));

    expect(result.current).toBe(false);
  });
});

describe("useHasRole", () => {
  it("should return true when user has role", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: [],
      roles: [{ role: "admin" }],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => useHasRole("admin"));

    expect(result.current).toBe(true);
  });

  it("should return false when user does not have role", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      permissions: [],
      roles: [{ role: "user" }],
    };

    mockUseAuthStore.mockImplementation((selector) => selector({ user: mockUser }));

    const { result } = renderHook(() => useHasRole("admin"));

    expect(result.current).toBe(false);
  });
});


