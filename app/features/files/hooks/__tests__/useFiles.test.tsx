/**
 * Tests for useFiles hooks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFiles, useFile } from "../useFiles";
import * as filesApi from "../../api/files.api";

vi.mock("../../api/files.api", () => ({
  listFiles: vi.fn(),
  getFile: vi.fn(),
}));

describe("useFiles", () => {
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
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch files successfully", async () => {
    const mockResponse = {
      data: [
        {
          id: "1",
          name: "test.pdf",
          mime_type: "application/pdf",
          size: 1024,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      error: null,
    };

    vi.mocked(filesApi.listFiles).mockResolvedValue(mockResponse as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFiles(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files?.[0]?.name).toBe("test.pdf");
  });

  it("should fetch single file successfully", async () => {
    const mockResponse = {
      data: {
        id: "1",
        name: "test.pdf",
        mime_type: "application/pdf",
        size: 1024,
      },
      error: null,
    };

    vi.mocked(filesApi.getFile).mockResolvedValue(mockResponse as any);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFile("1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.file?.name).toBe("test.pdf");
  });

  it("should handle errors gracefully", async () => {
    const mockError = new Error("Failed to fetch files");
    vi.mocked(filesApi.listFiles).mockRejectedValue(mockError);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFiles(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });
});
