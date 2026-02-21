/**
 * useTaskFiles hook tests
 * Tests for task file attachments functionality
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTaskFiles, useAttachFile, useDetachFile } from "~/features/tasks/hooks/useTaskFiles";

// Use vi.hoisted() so mocks are available when vi.mock factories run
const { mockListTaskFiles, mockAttachFileToTask, mockDetachFileFromTask, mockInvalidateQueries } = vi.hoisted(() => ({
  mockListTaskFiles: vi.fn(),
  mockAttachFileToTask: vi.fn(),
  mockDetachFileFromTask: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

vi.mock("../../api/task-files.api", () => ({
  listTaskFiles: mockListTaskFiles,
  attachFileToTask: mockAttachFileToTask,
  detachFileFromTask: mockDetachFileFromTask,
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

describe("useTaskFiles hook", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => ReactElement;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 1000 },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: ReactNode }) =>
      QueryClientProvider({
        client: queryClient,
        children,
      });

    vi.clearAllMocks();
  });

  describe("useTaskFiles", () => {
    it("loads task files successfully", async () => {
      const taskId = "task-123";
      const mockFiles = {
        data: [
          {
            file_id: "file1",
            file_name: "document.pdf",
            file_size: 1024000,
            file_type: "application/pdf",
            file_url: "https://example.com/files/document.pdf",
            attached_at: "2024-01-01T00:00:00Z",
            attached_by: "user1",
          },
          {
            file_id: "file2",
            file_name: "image.jpg",
            file_size: 512000,
            file_type: "image/jpeg",
            file_url: "https://example.com/files/image.jpg",
            attached_at: "2024-01-02T00:00:00Z",
            attached_by: "user2",
          },
        ],
        meta: {
          total: 2,
          page: 1,
          page_size: 10,
          total_pages: 1,
        },
      };

      mockListTaskFiles.mockResolvedValue(mockFiles);

      const { result } = renderHook(() => useTaskFiles(taskId), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockFiles);
      });

      expect(mockListTaskFiles).toHaveBeenCalledWith(taskId);
    });

    it("handles empty files list", async () => {
      const taskId = "task-123";
      const mockEmptyFiles = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          page_size: 10,
          total_pages: 1,
        },
      };

      mockListTaskFiles.mockResolvedValue(mockEmptyFiles);

      const { result } = renderHook(() => useTaskFiles(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockEmptyFiles);
      });

      expect(mockListTaskFiles).toHaveBeenCalledWith(taskId);
    });

    it("handles API error", async () => {
      const taskId = "task-123";
      const errorMessage = "Failed to load files";

      mockListTaskFiles.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskFiles(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 5000 });

      expect(mockListTaskFiles).toHaveBeenCalledWith(taskId);
    });

    it("does not fetch when taskId is empty", () => {
      const { result } = renderHook(() => useTaskFiles(""), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(mockListTaskFiles).not.toHaveBeenCalled();
    });

    it("caches query by taskId", async () => {
      const taskId1 = "task-123";
      const taskId2 = "task-456";

      mockListTaskFiles.mockResolvedValue({ data: [], meta: { total: 0, page: 1, page_size: 10, total_pages: 1 } });

      // First call
      renderHook(() => useTaskFiles(taskId1), { wrapper });
      await waitFor(() => expect(mockListTaskFiles).toHaveBeenCalledTimes(1));

      // Second call with different taskId
      renderHook(() => useTaskFiles(taskId2), { wrapper });
      await waitFor(() => expect(mockListTaskFiles).toHaveBeenCalledTimes(2));

      expect(mockListTaskFiles).toHaveBeenNthCalledWith(1, taskId1);
      expect(mockListTaskFiles).toHaveBeenNthCalledWith(2, taskId2);
    });
  });

  describe("useAttachFile", () => {
    it("attaches file successfully", async () => {
      const taskId = "task-123";
      const fileData = {
        fileId: "file1",
        fileName: "document.pdf",
        fileSize: 1024000,
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/document.pdf",
      };

      const mockResponse = {
        data: {
          file_id: fileData.fileId,
          file_name: fileData.fileName,
          file_size: fileData.fileSize,
          file_type: fileData.fileType,
          file_url: fileData.fileUrl,
          attached_at: "2024-01-01T00:00:00Z",
          attached_by: "user1",
        },
      };

      mockAttachFileToTask.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      expect(result.current.isPending).toBe(false);

      await result.current.mutateAsync({
        taskId,
        ...fileData,
      });

      expect(mockAttachFileToTask).toHaveBeenCalledWith(
        taskId,
        fileData.fileId,
        fileData.fileName,
        fileData.fileSize,
        fileData.fileType,
        fileData.fileUrl
      );

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId, "files"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId],
      });
    });

    it("handles API error when attaching file", async () => {
      const taskId = "task-123";
      const fileData = {
        fileId: "file1",
        fileName: "document.pdf",
        fileSize: 1024000,
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/document.pdf",
      };
      const errorMessage = "Failed to attach file";

      mockAttachFileToTask.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          ...fileData,
        })
      ).rejects.toThrow(errorMessage);

      expect(mockAttachFileToTask).toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles timeout error", async () => {
      const taskId = "task-123";
      const fileData = {
        fileId: "file1",
        fileName: "large-file.pdf",
        fileSize: 50000000, // 50MB
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/large-file.pdf",
      };

      const timeoutError = new Error("Request timeout");
      timeoutError.name = "TimeoutError";
      mockAttachFileToTask.mockRejectedValue(timeoutError);

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          ...fileData,
        })
      ).rejects.toThrow("Request timeout");
    });

    it("handles different file types", async () => {
      const taskId = "task-123";
      const imageFileData = {
        fileId: "img1",
        fileName: "image.png",
        fileSize: 256000,
        fileType: "image/png",
        fileUrl: "https://example.com/files/image.png",
      };

      mockAttachFileToTask.mockResolvedValue({
        data: {
          file_id: imageFileData.fileId,
          file_name: imageFileData.fileName,
          file_size: imageFileData.fileSize,
          file_type: imageFileData.fileType,
          file_url: imageFileData.fileUrl,
          attached_at: "2024-01-01T00:00:00Z",
          attached_by: "user1",
        },
      });

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        ...imageFileData,
      });

      expect(mockAttachFileToTask).toHaveBeenCalledWith(
        taskId,
        imageFileData.fileId,
        imageFileData.fileName,
        imageFileData.fileSize,
        imageFileData.fileType,
        imageFileData.fileUrl
      );
    });
  });

  describe("useDetachFile", () => {
    it("detaches file successfully", async () => {
      const taskId = "task-123";
      const fileId = "file1";

      mockDetachFileFromTask.mockResolvedValue({ status: 204 });

      const { result } = renderHook(() => useDetachFile(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        fileId,
      });

      expect(mockDetachFileFromTask).toHaveBeenCalledWith(taskId, fileId);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId, "files"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId],
      });
    });

    it("handles API error when detaching file", async () => {
      const taskId = "task-123";
      const fileId = "file1";
      const errorMessage = "Failed to detach file";

      mockDetachFileFromTask.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDetachFile(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          fileId,
        })
      ).rejects.toThrow(errorMessage);

      expect(mockDetachFileFromTask).toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles 404 error when file not found", async () => {
      const taskId = "task-123";
      const fileId = "nonexistent-file";

      const error = new Error("File not found") as Error & {
        response?: { status: number };
      };
      error.response = { status: 404 };
      mockDetachFileFromTask.mockRejectedValue(error);

      const { result } = renderHook(() => useDetachFile(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          fileId,
        })
      ).rejects.toThrow("File not found");
    });

    it("handles permission error", async () => {
      const taskId = "task-123";
      const fileId = "file1";

      const error = new Error("Permission denied") as Error & {
        response?: { status: number };
      };
      error.response = { status: 403 };
      mockDetachFileFromTask.mockRejectedValue(error);

      const { result } = renderHook(() => useDetachFile(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          fileId,
        })
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("Integration", () => {
    it("invalidates correct queries after operations", async () => {
      const taskId = "task-123";

      // Test attach file
      mockAttachFileToTask.mockResolvedValue({
        data: {
          file_id: "file1",
          file_name: "test.pdf",
          file_size: 1024,
          file_type: "application/pdf",
          file_url: "https://example.com/test.pdf",
          attached_at: "2024-01-01T00:00:00Z",
          attached_by: "user1",
        },
      });

      const { result: attachResult } = renderHook(() => useAttachFile(), { wrapper });

      await attachResult.current.mutateAsync({
        taskId,
        fileId: "file1",
        fileName: "test.pdf",
        fileSize: 1024,
        fileType: "application/pdf",
        fileUrl: "https://example.com/test.pdf",
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId, "files"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId],
      });

      // Reset mocks
      vi.clearAllMocks();

      // Test detach file
      mockDetachFileFromTask.mockResolvedValue({ status: 204 });

      const { result: detachResult } = renderHook(() => useDetachFile(), { wrapper });

      await detachResult.current.mutateAsync({
        taskId,
        fileId: "file1",
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId, "files"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks", taskId],
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles very large file attachment", async () => {
      const taskId = "task-123";
      const largeFileData = {
        fileId: "large-file",
        fileName: "very-large-video.mp4",
        fileSize: 1000000000, // 1GB
        fileType: "video/mp4",
        fileUrl: "https://example.com/files/very-large-video.mp4",
      };

      mockAttachFileToTask.mockResolvedValue({
        data: {
          file_id: largeFileData.fileId,
          file_name: largeFileData.fileName,
          file_size: largeFileData.fileSize,
          file_type: largeFileData.fileType,
          file_url: largeFileData.fileUrl,
          attached_at: "2024-01-01T00:00:00Z",
          attached_by: "user1",
        },
      });

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        ...largeFileData,
      });

      expect(mockAttachFileToTask).toHaveBeenCalledWith(
        taskId,
        largeFileData.fileId,
        largeFileData.fileName,
        largeFileData.fileSize,
        largeFileData.fileType,
        largeFileData.fileUrl
      );
    });

    it("handles special characters in file name", async () => {
      const taskId = "task-123";
      const specialFileData = {
        fileId: "special-file",
        fileName: "archivo con espacios y ñíes.pdf",
        fileSize: 2048,
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/archivo%20con%20espacios%20y%20%C3%B1%C3%ADes.pdf",
      };

      mockAttachFileToTask.mockResolvedValue({
        data: {
          file_id: specialFileData.fileId,
          file_name: specialFileData.fileName,
          file_size: specialFileData.fileSize,
          file_type: specialFileData.fileType,
          file_url: specialFileData.fileUrl,
          attached_at: "2024-01-01T00:00:00Z",
          attached_by: "user1",
        },
      });

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        ...specialFileData,
      });

      expect(mockAttachFileToTask).toHaveBeenCalledWith(
        taskId,
        specialFileData.fileId,
        specialFileData.fileName,
        specialFileData.fileSize,
        specialFileData.fileType,
        specialFileData.fileUrl
      );
    });

    it("handles rapid file operations", async () => {
      const taskId = "task-123";

      // Setup mocks
      mockAttachFileToTask.mockResolvedValue({
        data: {
          file_id: "file1",
          file_name: "test.pdf",
          file_size: 1024,
          file_type: "application/pdf",
          file_url: "https://example.com/test.pdf",
          attached_at: "2024-01-01T00:00:00Z",
          attached_by: "user1",
        },
      });

      mockDetachFileFromTask.mockResolvedValue({ status: 204 });

      const { result: attachResult } = renderHook(() => useAttachFile(), { wrapper });
      const { result: detachResult } = renderHook(() => useDetachFile(), { wrapper });

      // Attach file
      await attachResult.current.mutateAsync({
        taskId,
        fileId: "file1",
        fileName: "test.pdf",
        fileSize: 1024,
        fileType: "application/pdf",
        fileUrl: "https://example.com/test.pdf",
      });

      // Detach file immediately after
      await detachResult.current.mutateAsync({
        taskId,
        fileId: "file1",
      });

      expect(mockAttachFileToTask).toHaveBeenCalled();
      expect(mockDetachFileFromTask).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(4); // 2 for attach, 2 for detach
    });
  });
});
