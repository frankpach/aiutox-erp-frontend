/**
 * Tests for JsonPreview component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { JsonPreview } from "../JsonPreview";
import * as useFilesHook from "../../../hooks/useFiles";

// Mock dependencies
vi.mock("../../../hooks/useFiles", () => ({
  useFileContent: vi.fn(),
}));

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "files.loading": "Cargando...",
        "files.error": "Error",
        "files.previewNotAvailable": "Vista previa no disponible",
        "files.fileTooLarge": "Archivo demasiado grande",
        "files.invalidJson": "JSON inválido",
      };
      return translations[key] || key;
    },
  }),
}));

describe("JsonPreview", () => {
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
        <JsonPreview fileId="file-1" fileName="test.json" />
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
        <JsonPreview fileId="file-1" fileName="test.json" />
      </Wrapper>
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should display valid JSON content", async () => {
    const content = '{"name": "test", "value": 123}';
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <JsonPreview fileId="file-1" fileName="test.json" />
      </Wrapper>
    );

    await waitFor(() => {
      // JSON should be formatted and displayed
      expect(screen.getByText(/test/)).toBeInTheDocument();
    });
  });

  it("should display invalid JSON error", () => {
    const content = "invalid json content";
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <JsonPreview fileId="file-1" fileName="test.json" />
      </Wrapper>
    );

    expect(screen.getByText("JSON inválido")).toBeInTheDocument();
  });
});





