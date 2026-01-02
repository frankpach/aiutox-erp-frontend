/**
 * Tests for MarkdownPreview component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { MarkdownPreview } from "../MarkdownPreview";
import * as useFilesHook from "../../../hooks/useFiles";

// Mock dependencies
vi.mock("../../../hooks/useFiles", () => ({
  useFileContent: vi.fn(),
}));

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock("remark-gfm", () => ({}));
vi.mock("remark-mermaid", () => ({}));
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    run: vi.fn(),
  },
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "files.loading": "Cargando...",
        "files.error": "Error",
        "files.previewNotAvailable": "Vista previa no disponible",
        "files.fileTooLarge": "Archivo demasiado grande",
      };
      return translations[key] || key;
    },
  }),
}));

describe("MarkdownPreview", () => {
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
        <MarkdownPreview fileId="file-1" fileName="test.md" />
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
        <MarkdownPreview fileId="file-1" fileName="test.md" />
      </Wrapper>
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should display markdown content", async () => {
    const content = "# Test Markdown\n\nThis is a test.";
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <MarkdownPreview fileId="file-1" fileName="test.md" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  it("should display file too large message for large files", () => {
    const largeContent = "x".repeat(6 * 1024 * 1024); // 6MB
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: largeContent,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <MarkdownPreview fileId="file-1" fileName="test.md" />
      </Wrapper>
    );

    expect(screen.getByText("Archivo demasiado grande")).toBeInTheDocument();
  });
});


