/**
 * useTaskFiles hook tests
 * Tests for task file attachments functionality
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTaskFiles, useAttachFile, useDetachFile } from "~/features/tasks/hooks/useTaskFiles";

// Mock apiClient
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock("~/lib/api/client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

// Mock useQueryClient
const mockInvalidateQueries = vi.fn();

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
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 1000 },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

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

      mockGet.mockResolvedValue(mockFiles);

      const { result } = renderHook(() => useTaskFiles(taskId), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockFiles);
      });

      expect(mockGet).toHaveBeenCalledWith(`/tasks/${taskId}/files`);
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

      mockGet.mockResolvedValue(mockEmptyFiles);

      const { result } = renderHook(() => useTaskFiles(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockEmptyFiles);
      });

      expect(mockGet).toHaveBeenCalledWith(`/tasks/${taskId}/files`);
    });

    it("handles API error", async () => {
      const taskId = "task-123";
      const errorMessage = "Failed to load files";

      mockGet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskFiles(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockGet).toHaveBeenCalledWith(`/tasks/${taskId}/files`);
    });

    it("does not fetch when taskId is empty", () => {
      const { result } = renderHook(() => useTaskFiles(""), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("caches query by taskId", async () => {
      const taskId1 = "task-123";
      const taskId2 = "task-456";

      mockGet.mockResolvedValue({ data: [], meta: { total: 0, page: 1, page_size: 10, total_pages: 1 } });

      // First call
      renderHook(() => useTaskFiles(taskId1), { wrapper });
      await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));

      // Second call with different taskId
      renderHook(() => useTaskFiles(taskId2), { wrapper });
      await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));

      expect(mockGet).toHaveBeenNthCalledWith(1, `/tasks/${taskId1}/files`);
      expect(mockGet).toHaveBeenNthCalledWith(2, `/tasks/${taskId2}/files`);
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

      mockPost.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      expect(result.current.isPending).toBe(false);

      await result.current.mutateAsync({
        taskId,
        ...fileData,
      });

      expect(mockPost).toHaveBeenCalledWith(
        `/tasks/${taskId}/files`,
        {},
        {
          params: {
            file_id: fileData.fileId,
            file_name: fileData.fileName,
            file_size: fileData.fileSize.toString(),
            file_type: fileData.fileType,
            file_url: fileData.fileUrl,
          },
          timeout: 60000,
        }
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

      mockPost.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAttachFile(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          ...fileData,
        })
      ).rejects.toThrow(errorMessage);

      expect(mockPost).toHaveBeenCalled();
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
      mockPost.mockRejectedValue(timeoutError);

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

      mockPost.mockResolvedValue({
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

      expect(mockPost).toHaveBeenCalledWith(
        `/tasks/${taskId}/files`,
        {},
        {
          params: {
            file_id: imageFileData.fileId,
            file_name: imageFileData.fileName,
            file_size: imageFileData.fileSize.toString(),
            file_type: imageFileData.fileType,
            file_url: imageFileData.fileUrl,
          },
          timeout: 60000,
        }
      );
    });
  });

  describe("useDetachFile", () => {
    it("detaches file successfully", async () => {
      const taskId = "task-123";
      const fileId = "file1";

      mockDelete.mockResolvedValue({ status: 204 });

      const { result } = renderHook(() => useDetachFile(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        fileId,
      });

      expect(mockDelete).toHaveBeenCalledWith(`/tasks/${taskId}/files/${fileId}`);

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

      mockDelete.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDetachFile(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          fileId,
        })
      ).rejects.toThrow(errorMessage);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles 404 error when file not found", async () => {
      const taskId = "task-123";
      const fileId = "nonexistent-file";

      const error = new Error("File not found");
      (error as any).response = { status: 404 };
      mockDelete.mockRejectedValue(error);

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

      const error = new Error("Permission denied");
      (error as any).response = { status: 403 };
      mockDelete.mockRejectedValue(error);

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
      mockPost.mockResolvedValue({
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
      mockDelete.mockResolvedValue({ status: 204 });

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

      mockPost.mockResolvedValue({
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

      expect(mockPost).toHaveBeenCalledWith(
        `/tasks/${taskId}/files`,
        {},
        {
          params: {
            file_id: largeFileData.fileId,
            file_name: largeFileData.fileName,
            file_size: largeFileData.fileSize.toString(),
            file_type: largeFileData.fileType,
            file_url: largeFileData.fileUrl,
          },
          timeout: 60000,
        }
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

      mockPost.mockResolvedValue({
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

      expect(mockPost).toHaveBeenCalledWith(
        `/tasks/${taskId}/files`,
        {},
        {
          params: {
            file_id: specialFileData.fileId,
            file_name: specialFileData.fileName,
            file_size: specialFileData.fileSize.toString(),
            file_type: specialFileData.fileType,
            file_url: specialFileData.fileUrl,
          },
          timeout: 60000,
        }
      );
    });

    it("handles rapid file operations", async () => {
      const taskId = "task-123";

      // Setup mocks
      mockPost.mockResolvedValue({
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

      mockDelete.mockResolvedValue({ status: 204 });

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

      expect(mockPost).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(4); // 2 for attach, 2 for detach
    });
  });
});
