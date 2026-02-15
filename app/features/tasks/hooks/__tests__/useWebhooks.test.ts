/**
 * useWebhooks hook tests
 * Tests for webhook management functionality
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook } from "~/features/tasks/hooks/useWebhooks";
import type { WebhookCreate, WebhookUpdate } from "~/features/tasks/types/webhook.types";

// Mock apiClient
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("~/lib/api/client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
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

describe("useWebhooks hook", () => {
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

  describe("useWebhooks", () => {
    it("loads webhooks successfully", async () => {
      const mockWebhooks = {
        data: [
          {
            id: "webhook1",
            name: "Task Created Webhook",
            url: "https://example.com/webhooks/task-created",
            events: ["task.created"],
            secret: "secret123",
            active: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "webhook2",
            name: "Task Updated Webhook",
            url: "https://example.com/webhooks/task-updated",
            events: ["task.updated"],
            secret: "secret456",
            active: false,
            created_at: "2024-01-02T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
          },
        ],
        meta: {
          total: 2,
          page: 1,
          page_size: 10,
          total_pages: 1,
        },
      };

      mockGet.mockResolvedValue(mockWebhooks);

      const { result } = renderHook(() => useWebhooks(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockWebhooks);
      });

      expect(mockGet).toHaveBeenCalledWith("/integrations/webhooks");
    });

    it("handles empty webhooks list", async () => {
      const mockEmptyWebhooks = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          page_size: 10,
          total_pages: 1,
        },
      };

      mockGet.mockResolvedValue(mockEmptyWebhooks);

      const { result } = renderHook(() => useWebhooks(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockEmptyWebhooks);
      });

      expect(mockGet).toHaveBeenCalledWith("/integrations/webhooks");
    });

    it("handles API error", async () => {
      const errorMessage = "Failed to load webhooks";

      mockGet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useWebhooks(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockGet).toHaveBeenCalledWith("/integrations/webhooks");
    });
  });

  describe("useCreateWebhook", () => {
    it("creates webhook successfully", async () => {
      const webhookData: WebhookCreate = {
        name: "New Webhook",
        url: "https://example.com/webhooks/new",
        event_type: "task.created",
      };

      const mockResponse = {
        data: {
          id: "webhook3",
          ...webhookData,
          created_at: "2024-01-03T00:00:00Z",
          updated_at: "2024-01-03T00:00:00Z",
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateWebhook(), { wrapper });

      expect(result.current.isPending).toBe(false);

      await result.current.mutateAsync(webhookData);

      expect(mockPost).toHaveBeenCalledWith("/integrations/webhooks", webhookData);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["webhooks"],
      });
    });

    it("handles API error when creating webhook", async () => {
      const webhookData: WebhookCreate = {
        name: "New Webhook",
        url: "https://example.com/webhooks/new",
        event_type: "task.created",
      };
      const errorMessage = "Failed to create webhook";

      mockPost.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCreateWebhook(), { wrapper });

      await expect(result.current.mutateAsync(webhookData)).rejects.toThrow(errorMessage);

      expect(mockPost).toHaveBeenCalledWith("/integrations/webhooks", webhookData);
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles validation error", async () => {
      const invalidWebhookData: WebhookCreate = {
        name: "", // Empty name should fail validation
        url: "invalid-url", // Invalid URL should fail validation
        event_type: "", // Empty event type should fail validation
      };

      const validationError = new Error("Validation failed") as Error & {
        response?: {
          status: number;
          data?: { error?: { message?: string } };
        };
      };
      validationError.response = {
        status: 422,
        data: {
          error: {
            message: "Name is required, URL is invalid, Events are required",
          },
        },
      };
      mockPost.mockRejectedValue(validationError);

      const { result } = renderHook(() => useCreateWebhook(), { wrapper });

      await expect(result.current.mutateAsync(invalidWebhookData)).rejects.toThrow("Validation failed");
    });
  });

  describe("useUpdateWebhook", () => {
    it("updates webhook successfully", async () => {
      const webhookId = "webhook1";
      const updateData: WebhookUpdate = {
        name: "Updated Webhook",
        url: "https://example.com/webhooks/updated",
        event_type: "task.updated",
        enabled: false,
      };

      const mockResponse = {
        data: {
          id: webhookId,
          ...updateData,
          secret: "secret123",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-03T00:00:00Z",
        },
      };

      mockPut.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateWebhook(), { wrapper });

      await result.current.mutateAsync({ id: webhookId, data: updateData });

      expect(mockPut).toHaveBeenCalledWith(`/integrations/webhooks/${webhookId}`, updateData);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["webhooks"],
      });
    });

    it("handles API error when updating webhook", async () => {
      const webhookId = "webhook1";
      const updateData: WebhookUpdate = {
        name: "Updated Webhook",
        url: "https://example.com/webhooks/updated",
        event_type: "task.updated",
        enabled: false,
      };
      const errorMessage = "Failed to update webhook";

      mockPut.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useUpdateWebhook(), { wrapper });

      await expect(
        result.current.mutateAsync({ id: webhookId, data: updateData })
      ).rejects.toThrow(errorMessage);

      expect(mockPut).toHaveBeenCalledWith(`/integrations/webhooks/${webhookId}`, updateData);
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles webhook not found error", async () => {
      const webhookId = "nonexistent-webhook";
      const updateData: WebhookUpdate = {
        name: "Updated Webhook",
        url: "https://example.com/webhooks/updated",
        event_type: "task.created",
        enabled: true,
      };

      const notFoundError = new Error("Webhook not found") as Error & {
        response?: { status: number };
      };
      notFoundError.response = { status: 404 };
      mockPut.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useUpdateWebhook(), { wrapper });

      await expect(
        result.current.mutateAsync({ id: webhookId, data: updateData })
      ).rejects.toThrow("Webhook not found");
    });
  });

  describe("useDeleteWebhook", () => {
    it("deletes webhook successfully", async () => {
      const webhookId = "webhook1";

      mockDelete.mockResolvedValue({ status: 204 });

      const { result } = renderHook(() => useDeleteWebhook(), { wrapper });

      await result.current.mutateAsync(webhookId);

      expect(mockDelete).toHaveBeenCalledWith(`/integrations/webhooks/${webhookId}`);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["webhooks"],
      });
    });

    it("handles API error when deleting webhook", async () => {
      const webhookId = "webhook1";
      const errorMessage = "Failed to delete webhook";

      mockDelete.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDeleteWebhook(), { wrapper });

      await expect(result.current.mutateAsync(webhookId)).rejects.toThrow(errorMessage);

      expect(mockDelete).toHaveBeenCalledWith(`/integrations/webhooks/${webhookId}`);
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("handles webhook not found error", async () => {
      const webhookId = "nonexistent-webhook";

      const notFoundError = new Error("Webhook not found") as Error & {
        response?: { status: number };
      };
      notFoundError.response = { status: 404 };
      mockDelete.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useDeleteWebhook(), { wrapper });

      await expect(result.current.mutateAsync(webhookId)).rejects.toThrow("Webhook not found");
    });

    it("handles permission error", async () => {
      const webhookId = "webhook1";

      const permissionError = new Error("Permission denied") as Error & {
        response?: { status: number };
      };
      permissionError.response = { status: 403 };
      mockDelete.mockRejectedValue(permissionError);

      const { result } = renderHook(() => useDeleteWebhook(), { wrapper });

      await expect(result.current.mutateAsync(webhookId)).rejects.toThrow("Permission denied");
    });
  });

  describe("Integration", () => {
    it("invalidates queries after operations", async () => {
      // Setup mocks
      mockPost.mockResolvedValue({
        data: {
          id: "webhook3",
          name: "New Webhook",
          url: "https://example.com/webhooks/new",
          events: ["task.created"],
          secret: "newsecret123",
          active: true,
          created_at: "2024-01-03T00:00:00Z",
          updated_at: "2024-01-03T00:00:00Z",
        },
      });

      mockPut.mockResolvedValue({
        data: {
          id: "webhook1",
          name: "Updated Webhook",
          url: "https://example.com/webhooks/updated",
          events: ["task.created", "task.updated"],
          secret: "secret123",
          active: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-03T00:00:00Z",
        },
      });

      mockDelete.mockResolvedValue({ status: 204 });

      // Test create webhook
      const { result: createResult } = renderHook(() => useCreateWebhook(), { wrapper });

      await createResult.current.mutateAsync({
        name: "New Webhook",
        url: "https://example.com/webhooks/new",
        event_type: "task.created",
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["webhooks"],
      });

      // Reset mocks
      vi.clearAllMocks();

      // Test update webhook
      const { result: updateResult } = renderHook(() => useUpdateWebhook(), { wrapper });

      await updateResult.current.mutateAsync({
        id: "webhook1",
        data: {
          name: "Updated Webhook",
          url: "https://example.com/webhooks/updated",
          event_type: "task.updated",
          enabled: false,
        },
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["webhooks"],
      });

      // Reset mocks
      vi.clearAllMocks();

      // Test delete webhook
      const { result: deleteResult } = renderHook(() => useDeleteWebhook(), { wrapper });

      await deleteResult.current.mutateAsync("webhook1");

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["webhooks"],
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles webhook with multiple events", async () => {
      const webhookData: WebhookCreate = {
        name: "Multi-Event Webhook",
        url: "https://example.com/webhooks/multi",
        event_type: "task.created",
      };

      mockPost.mockResolvedValue({
        data: {
          id: "webhook4",
          ...webhookData,
          created_at: "2024-01-04T00:00:00Z",
          updated_at: "2024-01-04T00:00:00Z",
        },
      });

      const { result } = renderHook(() => useCreateWebhook(), { wrapper });

      await result.current.mutateAsync(webhookData);

      expect(mockPost).toHaveBeenCalledWith("/integrations/webhooks", webhookData);
      expect(webhookData.event_type).toBe("task.created");
    });

    it("handles webhook with special characters in name", async () => {
      const webhookData: WebhookCreate = {
        name: "Webhook con ñíes y espacios",
        url: "https://example.com/webhooks/special",
        event_type: "task.created",
      };

      mockPost.mockResolvedValue({
        data: {
          id: "webhook5",
          ...webhookData,
          created_at: "2024-01-05T00:00:00Z",
          updated_at: "2024-01-05T00:00:00Z",
        },
      });

      const { result } = renderHook(() => useCreateWebhook(), { wrapper });

      await result.current.mutateAsync(webhookData);

      expect(mockPost).toHaveBeenCalledWith("/integrations/webhooks", webhookData);
    });

    it("handles webhook deactivation", async () => {
      const webhookId = "webhook1";
      const updateData: WebhookUpdate = {
        enabled: false, // Only deactivating
      };

      mockPut.mockResolvedValue({
        data: {
          id: webhookId,
          name: "Existing Webhook",
          url: "https://example.com/webhooks/existing",
          events: ["task.created"],
          secret: "secret123",
          active: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-06T00:00:00Z",
        },
      });

      const { result } = renderHook(() => useUpdateWebhook(), { wrapper });

      await result.current.mutateAsync({ id: webhookId, data: updateData });

      expect(mockPut).toHaveBeenCalledWith(`/integrations/webhooks/${webhookId}`, updateData);
    });

    it("handles rapid webhook operations", async () => {
      // Setup mocks
      mockPost.mockResolvedValue({
        data: {
          id: "webhook6",
          name: "Rapid Webhook",
          url: "https://example.com/webhooks/rapid",
          events: ["task.created"],
          secret: "rapidsecret",
          active: true,
          created_at: "2024-01-07T00:00:00Z",
          updated_at: "2024-01-07T00:00:00Z",
        },
      });

      mockDelete.mockResolvedValue({ status: 204 });

      const { result: createResult } = renderHook(() => useCreateWebhook(), { wrapper });
      const { result: deleteResult } = renderHook(() => useDeleteWebhook(), { wrapper });

      // Create webhook
      await createResult.current.mutateAsync({
        name: "Rapid Webhook",
        url: "https://example.com/webhooks/rapid",
        event_type: "task.created",
      });

      // Delete webhook immediately after
      await deleteResult.current.mutateAsync("webhook6");

      expect(mockPost).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    });
  });
});
