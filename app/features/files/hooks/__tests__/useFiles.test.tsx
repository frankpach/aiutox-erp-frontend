/**
 * Tests for useFiles hooks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useFiles, useFile } from "../useFiles";
import * as filesApi from "../../api/files.api";

// Mock API
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch files list", async () => {
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
    };

    vi.mocked(filesApi.listFiles).mockResolvedValue(mockResponse);

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFiles(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].name).toBe("test.pdf");
  });

  it("should fetch single file", async () => {
    const mockResponse = {
      data: {
        id: "1",
        name: "test.pdf",
        mime_type: "application/pdf",
        size: 1024,
      },
    };

    vi.mocked(filesApi.getFile).mockResolvedValue(mockResponse);

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
    vi.mocked(filesApi.listFiles).mockRejectedValue(new Error("Network error"));

    const Wrapper = createWrapper();
    const { result } = renderHook(() => useFiles(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.files).toHaveLength(0);
  });
});

