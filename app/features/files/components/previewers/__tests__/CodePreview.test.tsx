/**
 * Tests for CodePreview component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { CodePreview } from "../CodePreview";
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
      };
      return translations[key] || key;
    },
  }),
}));

describe("CodePreview", () => {
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
        <CodePreview fileId="file-1" fileName="test.js" />
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
        <CodePreview fileId="file-1" fileName="test.js" />
      </Wrapper>
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should display code content", async () => {
    const content = "function test() {\n  return true;\n}";
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CodePreview fileId="file-1" fileName="test.js" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/function test/)).toBeInTheDocument();
    });
  });

  it("should detect language from file extension", async () => {
    const content = "def hello():\n    print('Hello')";
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CodePreview fileId="file-1" fileName="test.py" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/def hello/)).toBeInTheDocument();
    });
  });
});





