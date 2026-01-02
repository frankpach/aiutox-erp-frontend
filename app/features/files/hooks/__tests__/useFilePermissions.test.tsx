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
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: "user-1" } } as any);
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

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
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

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
    vi.mocked(useHasPermission).mockImplementation((perm: string) => {
      return perm === "files.view";
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
    expect(result.current.isOwner).toBe(false);
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

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
    vi.mocked(useHasPermission).mockReturnValue(false);
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
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });

  it("should handle errors gracefully", async () => {
    const fileId = "file-1";
    const userId = "user-1";

    vi.mocked(useAuthStore).mockReturnValue({ user: { id: userId } } as any);
    vi.mocked(useHasPermission).mockReturnValue(false);
    vi.mocked(filesApi.getFile).mockRejectedValue(new Error("Network error"));
    vi.mocked(filesApi.getFilePermissions).mockRejectedValue(new Error("Network error"));

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFilePermissions(fileId), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canView).toBe(false);
    });

    expect(result.current.canView).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });
});


