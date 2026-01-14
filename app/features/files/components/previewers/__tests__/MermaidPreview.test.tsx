/**
 * Tests for MermaidPreview component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { MermaidPreview } from "../MermaidPreview";
import * as useFilesHook from "../../../hooks/useFiles";
import mermaid from "mermaid";

// Mock dependencies
vi.mock("../../../hooks/useFiles", () => ({
  useFileContent: vi.fn(),
}));

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: "<svg>Test Diagram</svg>",
    }),
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

describe("MermaidPreview", () => {
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
        <MermaidPreview fileId="file-1" fileName="test.mmd" />
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
        <MermaidPreview fileId="file-1" fileName="test.mmd" />
      </Wrapper>
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should render Mermaid diagram", async () => {
    const content = "graph TD\n  A[Start] --> B[End]";
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    // Mock mermaid.render to return a simple SVG
    vi.mocked(mermaid.render).mockResolvedValue({
      svg: '<svg><text>Start</text><text>End</text></svg>',
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <MermaidPreview fileId="file-1" fileName="test.mmd" />
      </Wrapper>
    );

    await waitFor(() => {
      // Mermaid should render the diagram with the mocked SVG
      expect(screen.getByText(/Start/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});






