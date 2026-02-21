/**
 * useDependencies hook tests
 * Tests for task dependencies management functionality
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTaskDependencies, useAddDependency, useRemoveDependency } from "~/features/tasks/hooks/useDependencies";

// Use vi.hoisted() so mocks are available when vi.mock factories run
const { mockGet, mockPost, mockDelete, mockInvalidateQueries } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

vi.mock("~/lib/api/client", () => ({
  default: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
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

describe("useTaskDependencies hook", () => {
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

  describe("useDependencies", () => {
    it("loads task dependencies successfully", async () => {
      const taskId = "task-123";
      const mockDependencies = {
        data: {
          dependencies: [
            {
              id: "dep1",
              task_id: taskId,
              depends_on_id: "task-456",
              dependency_type: "finish_to_start",
              created_at: "2024-01-01T00:00:00Z",
            },
          ],
          dependents: [
            {
              id: "dep2",
              task_id: "task-789",
              depends_on_id: taskId,
              dependency_type: "finish_to_start",
              created_at: "2024-01-02T00:00:00Z",
            },
          ],
        },
      };

      mockGet.mockResolvedValue(mockDependencies);

      const { result } = renderHook(() => useTaskDependencies(taskId), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockDependencies.data);
      });

      expect(mockGet).toHaveBeenCalledWith(`/tasks/${taskId}/dependencies`);
    });

    it("handles empty dependencies", async () => {
      const taskId = "task-123";
      const mockEmptyDependencies = {
        data: {
          dependencies: [],
          dependents: [],
        },
      };

      mockGet.mockResolvedValue(mockEmptyDependencies);

      const { result } = renderHook(() => useTaskDependencies(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          dependencies: [],
          dependents: [],
        });
      });

      expect(mockGet).toHaveBeenCalledWith(`/tasks/${taskId}/dependencies`);
    });

    it("handles API error", async () => {
      const taskId = "task-123";
      const errorMessage = "Failed to load dependencies";

      mockGet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskDependencies(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(`/tasks/${taskId}/dependencies`);
    });

    it("does not fetch when taskId is empty", () => {
      const { result } = renderHook(() => useTaskDependencies(""), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("caches query by taskId", async () => {
      const taskId1 = "task-123";
      const taskId2 = "task-456";

      mockGet.mockResolvedValue({ data: { dependencies: [], dependents: [] } });

      // First call
      renderHook(() => useTaskDependencies(taskId1), { wrapper });
      await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));

      // Second call with different taskId
      renderHook(() => useTaskDependencies(taskId2), { wrapper });
      await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));

      expect(mockGet).toHaveBeenNthCalledWith(1, `/tasks/${taskId1}/dependencies`);
      expect(mockGet).toHaveBeenNthCalledWith(2, `/tasks/${taskId2}/dependencies`);
    });
  });

  describe("useAddDependency", () => {
    it("adds dependency successfully", async () => {
      const taskId = "task-123";
      const dependsOnId = "task-456";
      const dependencyType = "finish_to_start";

      const mockResponse = {
        data: {
          id: "dep1",
          task_id: taskId,
          depends_on_id: dependsOnId,
          dependency_type: dependencyType,
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAddDependency(), { wrapper });

      expect(result.current.isPending).toBe(false);

      await result.current.mutateAsync({
        taskId,
        dependsOnId,
        dependencyType,
      });

      expect(mockPost).toHaveBeenCalledWith(
        `/tasks/${taskId}/dependencies`,
        {
          depends_on_id: dependsOnId,
          dependency_type: dependencyType,
        }
      );

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["task-dependencies", taskId],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks"],
      });
    });

    it("uses default dependency type", async () => {
      const taskId = "task-123";
      const dependsOnId = "task-456";

      mockPost.mockResolvedValue({
        data: {
          id: "dep1",
          task_id: taskId,
          depends_on_id: dependsOnId,
          dependency_type: "finish_to_start",
          created_at: "2024-01-01T00:00:00Z",
        },
      });

      const { result } = renderHook(() => useAddDependency(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        dependsOnId,
      });

      expect(mockPost).toHaveBeenCalledWith(
        `/tasks/${taskId}/dependencies`,
        {
          depends_on_id: dependsOnId,
          dependency_type: "finish_to_start", // Default value
        }
      );
    });

    it("handles API error when adding dependency", async () => {
      const taskId = "task-123";
      const dependsOnId = "task-456";
      const errorMessage = "Failed to add dependency";

      mockPost.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAddDependency(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          dependsOnId,
        })
      ).rejects.toThrow(errorMessage);

      expect(mockPost).toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles different dependency types", async () => {
      const taskId = "task-123";
      const dependsOnId = "task-456";
      const dependencyType = "start_to_start";

      mockPost.mockResolvedValue({
        data: {
          id: "dep1",
          task_id: taskId,
          depends_on_id: dependsOnId,
          dependency_type: dependencyType,
          created_at: "2024-01-01T00:00:00Z",
        },
      });

      const { result } = renderHook(() => useAddDependency(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        dependsOnId,
        dependencyType,
      });

      expect(mockPost).toHaveBeenCalledWith(
        `/tasks/${taskId}/dependencies`,
        {
          depends_on_id: dependsOnId,
          dependency_type: dependencyType,
        }
      );
    });
  });

  describe("useRemoveDependency", () => {
    it("removes dependency successfully", async () => {
      const taskId = "task-123";
      const dependencyId = "dep1";

      mockDelete.mockResolvedValue({ status: 204 });

      const { result } = renderHook(() => useRemoveDependency(), { wrapper });

      await result.current.mutateAsync({
        taskId,
        dependencyId,
      });

      expect(mockDelete).toHaveBeenCalledWith(
        `/tasks/${taskId}/dependencies/${dependencyId}`
      );

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["task-dependencies", taskId],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks"],
      });
    });

    it("handles API error when removing dependency", async () => {
      const taskId = "task-123";
      const dependencyId = "dep1";
      const errorMessage = "Failed to remove dependency";

      mockDelete.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useRemoveDependency(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          dependencyId,
        })
      ).rejects.toThrow(errorMessage);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles 404 error when dependency not found", async () => {
      const taskId = "task-123";
      const dependencyId = "nonexistent-dep";

      const error = new Error("Dependency not found") as Error & {
        response?: { status: number };
      };
      error.response = { status: 404 };
      mockDelete.mockRejectedValue(error);

      const { result } = renderHook(() => useRemoveDependency(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          dependencyId,
        })
      ).rejects.toThrow("Dependency not found");
    });
  });

  describe("Integration", () => {
    it("invalidates correct queries after operations", async () => {
      const taskId = "task-123";

      // Test add dependency
      mockPost.mockResolvedValue({
        data: {
          id: "dep1",
          task_id: taskId,
          depends_on_id: "task-456",
          dependency_type: "finish_to_start",
          created_at: "2024-01-01T00:00:00Z",
        },
      });

      const { result: addResult } = renderHook(() => useAddDependency(), { wrapper });

      await addResult.current.mutateAsync({
        taskId,
        dependsOnId: "task-456",
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["task-dependencies", taskId],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks"],
      });

      // Reset mocks
      vi.clearAllMocks();

      // Test remove dependency
      mockDelete.mockResolvedValue({ status: 204 });

      const { result: removeResult } = renderHook(() => useRemoveDependency(), { wrapper });

      await removeResult.current.mutateAsync({
        taskId,
        dependencyId: "dep1",
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["task-dependencies", taskId],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tasks"],
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles circular dependency error from backend", async () => {
      const taskId = "task-123";
      const dependsOnId = "task-456";

      const circularError = new Error("Circular dependency detected");
      mockPost.mockRejectedValue(circularError);

      const { result } = renderHook(() => useAddDependency(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          dependsOnId,
        })
      ).rejects.toThrow("Circular dependency detected");
    });

    it("handles self-dependency error from backend", async () => {
      const taskId = "task-123";

      const selfDepError = new Error("Task cannot depend on itself");
      mockPost.mockRejectedValue(selfDepError);

      const { result } = renderHook(() => useAddDependency(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          dependsOnId: taskId, // Same task
        })
      ).rejects.toThrow("Task cannot depend on itself");
    });

    it("handles network timeout", async () => {
      const taskId = "task-123";
      const dependsOnId = "task-456";

      const timeoutError = new Error("Network timeout");
      timeoutError.name = "TimeoutError";
      mockPost.mockRejectedValue(timeoutError);

      const { result } = renderHook(() => useAddDependency(), { wrapper });

      await expect(
        result.current.mutateAsync({
          taskId,
          dependsOnId,
        })
      ).rejects.toThrow("Network timeout");
    });
  });
});
