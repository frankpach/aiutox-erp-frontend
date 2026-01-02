/**
 * Tests for useFolderPermissions hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useFolderPermissions } from "../useFolderPermissions";
import * as foldersApi from "../../api/folders.api";
import { useAuthStore } from "~/stores/authStore";
import { useHasPermission } from "~/hooks/usePermissions";

// Mock dependencies
vi.mock("../../api/folders.api", () => ({
  getFolderPermissions: vi.fn(),
  getFolder: vi.fn(),
}));

vi.mock("~/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("~/hooks/usePermissions", () => ({
  useHasPermission: vi.fn(),
}));

describe("useFolderPermissions", () => {
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

  it("should return no permissions when folderId is null", () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: "user-1" } } as any);
    vi.mocked(useHasPermission).mockReturnValue(false);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFolderPermissions(null), {
      wrapper: Wrapper,
    });

    expect(result.current.canView).toBe(false);
    expect(result.current.canCreateFiles).toBe(false);
    expect(result.current.canCreateFolders).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });

  it("should return all permissions when user is owner", async () => {
    const folderId = "folder-1";
    const userId = "user-1";
    const mockFolder = {
      id: folderId,
      created_by: userId,
      name: "Test Folder",
    };

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
    vi.mocked(useHasPermission).mockReturnValue(false);
    vi.mocked(foldersApi.getFolder).mockResolvedValue({ data: mockFolder } as any);
    vi.mocked(foldersApi.getFolderPermissions).mockResolvedValue({ data: [] } as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFolderPermissions(folderId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isOwner).toBe(true);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canCreateFiles).toBe(true);
    expect(result.current.canCreateFolders).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canManagePermissions).toBe(true);
  });

  it("should use module-level permissions when user has folders.view", async () => {
    const folderId = "folder-1";
    const userId = "user-1";
    const otherUserId = "user-2";
    const mockFolder = {
      id: folderId,
      created_by: otherUserId,
      name: "Test Folder",
    };

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
    vi.mocked(useHasPermission).mockImplementation((perm: string) => {
      return perm === "folders.view";
    });
    vi.mocked(foldersApi.getFolder).mockResolvedValue({ data: mockFolder } as any);
    vi.mocked(foldersApi.getFolderPermissions).mockResolvedValue({ data: [] } as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFolderPermissions(folderId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canView).toBe(true);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.isOwner).toBe(false);
  });

  it("should use folder-specific permissions when available", async () => {
    const folderId = "folder-1";
    const userId = "user-1";
    const otherUserId = "user-2";
    const mockFolder = {
      id: folderId,
      created_by: otherUserId,
      name: "Test Folder",
    };
    const mockPermissions = [
      {
        id: "perm-1",
        folder_id: folderId,
        target_type: "user" as const,
        target_id: userId,
        can_view: true,
        can_create_files: true,
        can_create_folders: false,
        can_edit: false,
        can_delete: false,
      },
    ];

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
    vi.mocked(useHasPermission).mockReturnValue(false);
    vi.mocked(foldersApi.getFolder).mockResolvedValue({ data: mockFolder } as any);
    vi.mocked(foldersApi.getFolderPermissions).mockResolvedValue({ data: mockPermissions } as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFolderPermissions(folderId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canView).toBe(true);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canCreateFiles).toBe(true);
    expect(result.current.canCreateFolders).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });

  it("should handle errors gracefully", async () => {
    const folderId = "folder-1";
    const userId = "user-1";

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
    vi.mocked(useHasPermission).mockReturnValue(false);
    vi.mocked(foldersApi.getFolder).mockRejectedValue(new Error("Network error"));
    vi.mocked(foldersApi.getFolderPermissions).mockRejectedValue(new Error("Network error"));

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFolderPermissions(folderId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canView).toBe(false);
    });

    expect(result.current.canView).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });
});


