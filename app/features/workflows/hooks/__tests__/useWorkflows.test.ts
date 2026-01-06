/**
 * Unit tests for useWorkflows hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import * as api from "../../api/workflows.api";
import {
  useWorkflows,
  useWorkflow,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
} from "../useWorkflows";

// Mock the API
vi.mock("../../api/workflows.api");

describe("useWorkflows hook", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };

  describe("useWorkflows", () => {
    it("should fetch workflows list", async () => {
      const mockWorkflows = {
        data: [
          {
            id: "1",
            tenant_id: "tenant-1",
            name: "Test Workflow",
            description: "Test",
            enabled: true,
            definition: { steps: [] },
            metadata: null,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        ],
        meta: { total: 1, page: 1, page_size: 20, total_pages: 1 },
        error: null,
      };

      vi.mocked(api.listWorkflows).mockResolvedValue(mockWorkflows);

      const { result } = renderHook(() => useWorkflows(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.listWorkflows).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockWorkflows);
    });
  });

  describe("useWorkflow", () => {
    it("should fetch single workflow by id", async () => {
      const mockWorkflow = {
        data: {
          id: "1",
          tenant_id: "tenant-1",
          name: "Test Workflow",
          description: "Test",
          enabled: true,
          definition: { steps: [] },
          metadata: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        meta: null,
        error: null,
      };

      vi.mocked(api.getWorkflow).mockResolvedValue(mockWorkflow);

      const { result } = renderHook(() => useWorkflow("1"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.getWorkflow).toHaveBeenCalledWith("1");
      expect(result.current.data).toEqual(mockWorkflow);
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useWorkflow(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useCreateWorkflow", () => {
    it("should create workflow and invalidate queries", async () => {
      const mockWorkflow = {
        data: {
          id: "1",
          tenant_id: "tenant-1",
          name: "New Workflow",
          description: "Test",
          enabled: true,
          definition: { steps: [] },
          metadata: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        meta: null,
        error: null,
      };

      vi.mocked(api.createWorkflow).mockResolvedValue(mockWorkflow);

      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

      result.current.mutate({
        name: "New Workflow",
        description: "Test",
        enabled: true,
        definition: { steps: [] },
        metadata: null,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.createWorkflow).toHaveBeenCalled();
    });
  });

  describe("useUpdateWorkflow", () => {
    it("should update workflow and invalidate queries", async () => {
      const mockWorkflow = {
        data: {
          id: "1",
          tenant_id: "tenant-1",
          name: "Updated Workflow",
          description: "Test",
          enabled: true,
          definition: { steps: [] },
          metadata: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        meta: null,
        error: null,
      };

      vi.mocked(api.updateWorkflow).mockResolvedValue(mockWorkflow);

      const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

      result.current.mutate({
        id: "1",
        payload: { name: "Updated Workflow" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.updateWorkflow).toHaveBeenCalledWith("1", { name: "Updated Workflow" });
    });
  });

  describe("useDeleteWorkflow", () => {
    it("should delete workflow and invalidate queries", async () => {
      vi.mocked(api.deleteWorkflow).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

      result.current.mutate("1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.deleteWorkflow).toHaveBeenCalledWith("1", expect.any(Object));
    });
  });
});
