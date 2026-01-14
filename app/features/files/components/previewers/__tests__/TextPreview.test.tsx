/**
 * Tests for TextPreview component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { TextPreview } from "../TextPreview";
import * as useFilesHook from "../../../hooks/useFiles";

// Mock dependencies
vi.mock("../../../hooks/useFiles", () => ({
  useFileContent: vi.fn(),
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "files.loading": "Cargando...",
        "files.error": "Error",
        "files.previewNotAvailable": "Vista previa no disponible",
      };
      return translations[key] || key;
    },
  }),
}));

describe("TextPreview", () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
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

  it("should display loading state", () => {
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <TextPreview fileId="file-1" fileName="test.txt" />
      </Wrapper>
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("should display error state", () => {
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <TextPreview fileId="file-1" fileName="test.txt" />
      </Wrapper>
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should display preview not available when content is empty", () => {
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <TextPreview fileId="file-1" fileName="test.txt" />
      </Wrapper>
    );

    expect(screen.getByText("Vista previa no disponible")).toBeInTheDocument();
  });

  it("should display text content", async () => {
    const content = "This is test content";
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <TextPreview fileId="file-1" fileName="test.txt" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });
});






