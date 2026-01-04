/**
 * Tests for useFilePermissions hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useFilePermissions } from "../useFilePermissions";
import * as filesApi from "../../api/files.api";
import { useAuthStore } from "~/stores/authStore";
import { useHasPermission } from "~/hooks/usePermissions";

// Mock dependencies
vi.mock("../../api/files.api", () => ({
  getFilePermissions: vi.fn(),
  getFile: vi.fn(),
}));

vi.mock("~/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("~/hooks/usePermissions", () => ({
  useHasPermission: vi.fn(),
}));

describe("useFilePermissions", () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return no permissions when fileId is null", () => {
    vi.mocked(useAuthStore).mockImplementation((_selector) => ({
      id: "user-1",
      email: "test@example.com"
    }));
    vi.mocked(useHasPermission).mockReturnValue(false);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFilePermissions(null), {
      wrapper: Wrapper,
    });

    expect(result.current.canView).toBe(false);
    expect(result.current.canDownload).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });

  it("should return all permissions when user is owner", async () => {
    const fileId = "file-1";
    const userId = "user-1";
    const mockFile = {
      id: fileId,
      uploaded_by: userId,
      name: "test.pdf",
    };

    vi.mocked(useAuthStore).mockImplementation((_selector) => ({
      id: userId,
      email: "test@example.com"
    }));
    vi.mocked(useHasPermission).mockReturnValue(false);
    vi.mocked(filesApi.getFile).mockResolvedValue({ data: mockFile } as any);
    vi.mocked(filesApi.getFilePermissions).mockResolvedValue({ data: [] } as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFilePermissions(fileId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isOwner).toBe(true);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canDownload).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canManagePermissions).toBe(true);
  });

  it("should use module-level permissions when user has files.view", async () => {
    const fileId = "file-1";
    const userId = "user-1";
    const otherUserId = "user-2";
    const mockFile = {
      id: fileId,
      uploaded_by: otherUserId,
      name: "test.pdf",
    };

    // Clear all mocks before setting them up
    vi.clearAllMocks();
    
    // Create mock that returns specific values based on permission
    vi.mocked(useHasPermission).mockImplementation((permission: string) => {
      if (permission === "files.view") return true;
      if (permission === "files.manage") return false;
      return false;
    });

    // Mock useAuthStore properly - the hook uses useAuthStore((state) => state.user)
    const mockUser = { id: userId, email: "test@example.com" };
    vi.mocked(useAuthStore).mockImplementation((_selector) => {
      return mockUser;
    });

    vi.mocked(filesApi.getFile).mockResolvedValue({ data: mockFile } as any);
    vi.mocked(filesApi.getFilePermissions).mockResolvedValue({ data: [] } as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFilePermissions(fileId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canView).toBe(true);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canDownload).toBe(true);
    expect(result.current.canEdit).toBe(false); // Only has files.view, not files.manage
    expect(result.current.canDelete).toBe(false); // Only has files.view, not files.manage
    expect(result.current.canManagePermissions).toBe(false); // Only has files.view, not files.manage
    expect(result.current.isOwner).toBe(false); // User is not the owner
  });

  it("should use file-specific permissions when available", async () => {
    const fileId = "file-1";
    const userId = "user-1";
    const otherUserId = "user-2";
    const mockFile = {
      id: fileId,
      uploaded_by: otherUserId,
      name: "test.pdf",
    };
    const mockPermissions = [
      {
        id: "perm-1",
        file_id: fileId,
        target_type: "user" as const,
        target_id: userId,
        can_view: true,
        can_download: true,
        can_edit: false,
        can_delete: false,
      },
    ];

    // Clear all mocks before setting them up
    vi.clearAllMocks();
    
    vi.mocked(useHasPermission).mockReturnValue(false); // No module permissions
    
    // Mock useAuthStore properly - the hook uses useAuthStore((state) => state.user)
    const mockUser = { id: userId, email: "test@example.com" };
    vi.mocked(useAuthStore).mockImplementation((_selector) => {
      return mockUser;
    });
    
    vi.mocked(filesApi.getFile).mockResolvedValue({ data: mockFile } as any);
    vi.mocked(filesApi.getFilePermissions).mockResolvedValue({ data: mockPermissions } as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFilePermissions(fileId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canView).toBe(true);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canDownload).toBe(true);
    expect(result.current.canEdit).toBe(false); // Permission explicitly set to false
    expect(result.current.canDelete).toBe(false); // Permission explicitly set to false
    expect(result.current.canManagePermissions).toBe(false); // No module permissions
    expect(result.current.isOwner).toBe(false); // User is not the owner
  });

  it("should handle errors gracefully", async () => {
    const fileId = "file-1";
    const userId = "user-1";

    // Clear all mocks before setting them up
    vi.clearAllMocks();
    
    vi.mocked(useHasPermission).mockReturnValue(false); // No module permissions
    
    // Mock useAuthStore properly - the hook uses useAuthStore((state) => state.user)
    const mockUser = { id: userId, email: "test@example.com" };
    vi.mocked(useAuthStore).mockImplementation((_selector) => {
      return mockUser;
    });
    
    vi.mocked(filesApi.getFile).mockRejectedValue(new Error("Network error"));
    vi.mocked(filesApi.getFilePermissions).mockRejectedValue(new Error("Network error"));

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFilePermissions(fileId), {
      wrapper: Wrapper,
    });

    // When there are errors, all permissions should be false
    await waitFor(() => {
      expect(result.current.canView).toBe(false);
    });

    expect(result.current.canView).toBe(false);
    expect(result.current.canDownload).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canManagePermissions).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });
});





