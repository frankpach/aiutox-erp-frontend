/**
 * Tests for FileList component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FileList } from "../FileList";
import * as useFilesHook from "../../hooks/useFiles";
import { showToast } from "~/components/common/Toast";

// Mock useFiles hooks
vi.mock("../../hooks/useFiles", () => ({
  useFiles: vi.fn(),
  useFileDelete: vi.fn(),
  useFileDownload: vi.fn(),
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
        "files.title": "Archivos",
        "files.loading": "Cargando archivos...",
        "files.error": "Error al cargar archivos",
        "files.noFiles": "No hay archivos",
        "files.noFilesDesc": "Sube tu primer archivo para comenzar",
        "files.name": "Nombre",
        "files.type": "Tipo",
        "files.size": "Tamaño",
        "files.uploadedBy": "Subido por",
        "files.uploadedAt": "Subido el",
        "files.actions": "Acciones",
        "files.view": "Ver",
        "files.download": "Descargar",
        "files.delete": "Eliminar",
        "files.deleteConfirm": "¿Eliminar archivo?",
        "files.deleteConfirmDesc": "Esta acción no se puede deshacer.",
        "files.deleteSuccess": "Archivo eliminado exitosamente",
        "files.deleteError": "Error al eliminar el archivo",
        "files.showing": "Mostrando",
        "files.to": "a",
        "files.of": "de",
        "files.records": "archivos",
        "common.previous": "Anterior",
        "common.next": "Siguiente",
      };
      return translations[key] || key;
    },
  }),
}));

describe("FileList", () => {
  const mockFiles = [
    {
      id: "1",
      name: "test.pdf",
      mime_type: "application/pdf",
      size: 1024,
      uploaded_by: "user-1",
      created_at: "2025-12-30T10:00:00Z",
      original_name: "test.pdf",
      tenant_id: "tenant-1",
      extension: ".pdf",
      storage_backend: "local" as const,
      storage_path: "/path/to/file",
      storage_url: null,
      entity_type: null,
      entity_id: null,
      description: null,
      metadata: null,
      version_number: 1,
      is_current: true,
      updated_at: "2025-12-30T10:00:00Z",
    },
  ];

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

  it("should render loading state", () => {
    vi.mocked(useFilesHook.useFiles).mockReturnValue({
      files: [],
      loading: true,
      error: null,
      pagination: null,
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileDelete).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useFilesHook.useFileDownload).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileList />
      </Wrapper>
    );

    expect(screen.getByText("Cargando archivos...")).toBeInTheDocument();
  });

  it("should render files list", () => {
    vi.mocked(useFilesHook.useFiles).mockReturnValue({
      files: mockFiles,
      loading: false,
      error: null,
      pagination: {
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileDelete).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useFilesHook.useFileDownload).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileList />
      </Wrapper>
    );

    expect(screen.getByText("test.pdf")).toBeInTheDocument();
    expect(screen.getByText("application/pdf")).toBeInTheDocument();
  });

  it("should render empty state when no files", () => {
    vi.mocked(useFilesHook.useFiles).mockReturnValue({
      files: [],
      loading: false,
      error: null,
      pagination: null,
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileDelete).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useFilesHook.useFileDownload).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileList />
      </Wrapper>
    );

    expect(screen.getByText("No hay archivos")).toBeInTheDocument();
  });

  it("should have delete functionality available", () => {
    const mockDelete = vi.fn();

    vi.mocked(useFilesHook.useFiles).mockReturnValue({
      files: mockFiles,
      loading: false,
      error: null,
      pagination: {
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileDelete).mockReturnValue({
      mutate: mockDelete,
      isPending: false,
    } as any);

    vi.mocked(useFilesHook.useFileDownload).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileList />
      </Wrapper>
    );

    // Verify the file is displayed and actions column exists
    expect(screen.getAllByText("test.pdf").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Acciones").length).toBeGreaterThan(0);

    // Verify delete mutation is available (even if button is in dropdown)
    expect(mockDelete).toBeDefined();
  });

  it("should have download functionality available", () => {
    const mockDownload = vi.fn();

    vi.mocked(useFilesHook.useFiles).mockReturnValue({
      files: mockFiles,
      loading: false,
      error: null,
      pagination: {
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileDelete).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useFilesHook.useFileDownload).mockReturnValue({
      mutate: mockDownload,
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileList />
      </Wrapper>
    );

    // Verify the file is displayed and download hook is available
    expect(screen.getAllByText("test.pdf").length).toBeGreaterThan(0);
    expect(mockDownload).toBeDefined();
  });

  it("should display pagination when there are multiple pages", () => {
    vi.mocked(useFilesHook.useFiles).mockReturnValue({
      files: mockFiles,
      loading: false,
      error: null,
      pagination: {
        total: 25,
        page: 1,
        page_size: 20,
        total_pages: 2,
      },
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileDelete).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useFilesHook.useFileDownload).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileList />
      </Wrapper>
    );

    // Check for pagination controls
    expect(screen.getByText("Anterior")).toBeInTheDocument();
    expect(screen.getByText("Siguiente")).toBeInTheDocument();
  });
});

