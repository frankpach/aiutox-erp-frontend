/**
 * Tests for CsvPreview component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { CsvPreview } from "../CsvPreview";
import * as useFilesHook from "../../../hooks/useFiles";

// Mock dependencies
vi.mock("../../../hooks/useFiles", () => ({
  useFileContent: vi.fn(),
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, any>) => {
      const translations: Record<string, string> = {
        "files.loading": "Cargando...",
        "files.error": "Error",
        "files.previewNotAvailable": "Vista previa no disponible",
        "files.fileTooLarge": "Archivo demasiado grande",
        "files.showingFirstRows": `Mostrando las primeras ${params?.count || 0} filas de ${params?.total || 0}`,
        "common.noData": "No hay datos",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CsvPreview", () => {
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
        <CsvPreview fileId="file-1" fileName="test.csv" />
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
        <CsvPreview fileId="file-1" fileName="test.csv" />
      </Wrapper>
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should display CSV content as table", async () => {
    const content = "Name,Age,City\nJohn,30,New York\nJane,25,Boston";
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: content,
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CsvPreview fileId="file-1" fileName="test.csv" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });

  it("should display message when CSV is empty", () => {
    vi.mocked(useFilesHook.useFileContent).mockReturnValue({
      data: "",
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CsvPreview fileId="file-1" fileName="test.csv" />
      </Wrapper>
    );

    expect(screen.getByText("Vista previa no disponible")).toBeInTheDocument();
  });
});






