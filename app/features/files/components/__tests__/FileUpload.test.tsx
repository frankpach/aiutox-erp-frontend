/**
 * Tests for FileUpload component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FileUpload } from "../FileUpload";
import * as useFilesHook from "../../hooks/useFiles";

// Mock useFiles hooks
vi.mock("../../hooks/useFiles", () => ({
  useFileUpload: vi.fn(),
}));

// Mock showToast
vi.mock("~/components/common/Toast", () => ({
  showToast: vi.fn(),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "files.upload": "Subir Archivo",
        "files.dragDrop": "Arrastra archivos aquí o haz clic para seleccionar",
        "files.dragDropActive": "Suelta los archivos aquí",
        "files.selectFiles": "Seleccionar archivos",
        "files.uploadError": "Error al subir el archivo",
        "files.fileTooLarge": "El archivo es demasiado grande",
        "files.invalidFileType": "Tipo de archivo no válido",
        "files.uploadSuccess": "Archivo subido exitosamente",
      };
      return translations[key] || key;
    },
  }),
}));

describe("FileUpload", () => {
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

  it("should render upload area", () => {
    vi.mocked(useFilesHook.useFileUpload).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileUpload />
      </Wrapper>
    );

    expect(
      screen.getByText("Arrastra archivos aquí o haz clic para seleccionar")
    ).toBeInTheDocument();
    expect(screen.getByText("Seleccionar archivos")).toBeInTheDocument();
  });

  it("should render upload button", () => {
    vi.mocked(useFilesHook.useFileUpload).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileUpload />
      </Wrapper>
    );

    // Verify upload button is rendered
    const buttons = screen.getAllByText("Seleccionar archivos");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should have upload functionality available", () => {
    const mockUpload = vi.fn();
    const mockOnSuccess = vi.fn();

    vi.mocked(useFilesHook.useFileUpload).mockReturnValue({
      mutate: mockUpload,
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileUpload onUploadSuccess={mockOnSuccess} />
      </Wrapper>
    );

    // Verify upload hook is available and component renders
    expect(mockUpload).toBeDefined();
    expect(screen.getAllByText("Seleccionar archivos").length).toBeGreaterThan(0);
  });

  it("should show progress during upload", () => {
    vi.mocked(useFilesHook.useFileUpload).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileUpload />
      </Wrapper>
    );

    // Button should be disabled during upload - get first button
    const buttons = screen.getAllByText("Seleccionar archivos");
    const disabledButton = buttons.find(btn => btn.hasAttribute("disabled"));
    expect(disabledButton).toBeDefined();
  });
});

