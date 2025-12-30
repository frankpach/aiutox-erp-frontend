/**
 * useDashboard Hook Tests
 * Tests for dashboard hook functionality including permissions, filtering, and state management
 * Following TDD principles and security best practices
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDashboard } from "../useDashboard";
import * as dashboardApi from "~/lib/api/dashboard.api";
import * as dashboardTemplates from "~/config/dashboard-templates";
import { usePermissions } from "../usePermissions";
import { useAuthStore } from "~/stores/authStore";

// Mock dependencies
vi.mock("~/lib/api/dashboard.api");
vi.mock("~/config/dashboard-templates");
vi.mock("../usePermissions");
vi.mock("~/stores/authStore");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading state initially", () => {
    vi.mocked(dashboardApi.getDashboards).mockResolvedValue([]);
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "1", tenant_id: "1", roles: ["viewer"] },
    } as any);
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
    } as any);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("filters widgets by permissions", async () => {
    const mockWidgets = [
      {
        id: "1",
        type: "metric" as const,
        title: "Allowed Widget",
        requiredPermission: "users.view",
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        config: {},
      },
      {
        id: "2",
        type: "metric" as const,
        title: "Restricted Widget",
        requiredPermission: "admin.manage",
        position: { x: 1, y: 0 },
        size: { width: 1, height: 1 },
        config: {},
      },
    ];

    vi.mocked(dashboardApi.getDashboards).mockResolvedValue([
      {
        id: "1",
        user_id: "1",
        tenant_id: "1",
        name: "Dashboard",
        widgets: mockWidgets,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    const hasPermission = vi.fn((perm: string) => perm === "users.view");
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission,
    } as any);

    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "1", tenant_id: "1", roles: ["viewer"] },
    } as any);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Security: Only widgets with allowed permissions should be visible
    expect(result.current.widgets).toHaveLength(1);
    expect(result.current.widgets[0].id).toBe("1");
  });

  it("uses template when no dashboard exists", async () => {
    vi.mocked(dashboardApi.getDashboards).mockResolvedValue([]);
    vi.mocked(dashboardTemplates.getDashboardTemplateByRole).mockReturnValue([
      {
        id: "template-1",
        type: "quick-access" as const,
        title: "Template Widget",
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        config: { links: [] },
      },
    ]);

    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "1", tenant_id: "1", roles: ["viewer"] },
    } as any);

    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
    } as any);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should use template when no dashboard exists
    expect(result.current.dashboard).toBeTruthy();
    expect(result.current.dashboard?.id).toBe("template");
  });

  it("filters quick-access links by permissions", async () => {
    const mockWidgets = [
      {
        id: "1",
        type: "quick-access" as const,
        title: "Quick Access",
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        config: {
          links: [
            { label: "Allowed", to: "/allowed", permission: "users.view" },
            { label: "Restricted", to: "/restricted", permission: "admin.manage" },
            { label: "No Permission", to: "/no-perm" },
          ],
        },
      },
    ];

    vi.mocked(dashboardApi.getDashboards).mockResolvedValue([
      {
        id: "1",
        user_id: "1",
        tenant_id: "1",
        name: "Dashboard",
        widgets: mockWidgets,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    const hasPermission = vi.fn((perm: string) => perm === "users.view");
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission,
    } as any);

    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "1", tenant_id: "1", roles: ["viewer"] },
    } as any);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Security: Links should be filtered by permissions
    const widget = result.current.widgets[0];
    expect(widget.config.links).toHaveLength(2); // Allowed + No Permission
    expect(widget.config.links?.some((l) => l.label === "Restricted")).toBe(false);
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(dashboardApi.getDashboards).mockRejectedValue(
      new Error("API Error")
    );

    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "1", tenant_id: "1", roles: ["viewer"] },
    } as any);

    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: vi.fn(() => true),
    } as any);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should handle error and fallback to template
    expect(result.current.error).toBeTruthy();
    expect(result.current.dashboard).toBeTruthy(); // Falls back to template
  });

  it("checks edit permission correctly", async () => {
    vi.mocked(dashboardApi.getDashboards).mockResolvedValue([]);
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "1", tenant_id: "1", roles: ["admin"] },
    } as any);

    const hasPermission = vi.fn((perm: string) => perm === "preferences.manage");
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission,
    } as any);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Security: Edit permission should be checked
    expect(hasPermission).toHaveBeenCalledWith("preferences.manage");
    expect(result.current.canEdit).toBe(true);
  });
});

