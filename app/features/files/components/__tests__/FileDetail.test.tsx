/**
 * Tests for FileDetail component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FileDetail } from "../FileDetail";
import * as useFilesHook from "../../hooks/useFiles";

// Mock useFiles hooks
vi.mock("../../hooks/useFiles", () => ({
  useFile: vi.fn(),
  useFileVersions: vi.fn(),
  fileKeys: {
    all: ["files"] as const,
    lists: () => ["files", "list"] as const,
    list: (params?: any) => ["files", "list", params] as const,
    detail: (id: string) => ["files", "detail", id] as const,
    versions: (id: string) => ["files", "versions", id] as const,
    content: (id: string) => ["files", "content", id] as const,
    preview: (id: string) => ["files", "preview", id] as const,
  },
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "files.title": "Archivos",
        "files.loading": "Cargando archivos...",
        "files.error": "Error al cargar archivos",
        "files.name": "Nombre",
        "files.type": "Tipo",
        "files.size": "Tamaño",
        "files.uploadedBy": "Subido por",
        "files.uploadedAt": "Subido el",
        "files.description": "Descripción",
        "files.preview": "Vista Previa",
        "files.versions": "Versiones",
        "files.permissions": "Permisos",
        "files.metadata": "Metadatos",
      };
      return translations[key] || key;
    },
  }),
}));

describe("FileDetail", () => {
  const mockFile = {
    id: "1",
    name: "test.pdf",
    original_name: "test.pdf",
    mime_type: "application/pdf",
    size: 1024,
    uploaded_by: "user-1",
    created_at: "2025-12-30T10:00:00Z",
    tenant_id: "tenant-1",
    extension: ".pdf",
    storage_backend: "local" as const,
    storage_path: "/path/to/file",
    storage_url: null,
    entity_type: null,
    entity_id: null,
    description: "Test file",
    metadata: null,
    version_number: 1,
    is_current: true,
    updated_at: "2025-12-30T10:00:00Z",
  };

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
    vi.mocked(useFilesHook.useFile).mockReturnValue({
      file: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileVersions).mockReturnValue({
      versions: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileDetail fileId="1" />
      </Wrapper>
    );

    expect(screen.getByText("Cargando archivos...")).toBeInTheDocument();
  });

  it("should render file details", () => {
    vi.mocked(useFilesHook.useFile).mockReturnValue({
      file: mockFile,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileVersions).mockReturnValue({
      versions: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileDetail fileId="1" />
      </Wrapper>
    );

    // Use getAllByText since file name appears multiple times
    expect(screen.getAllByText("test.pdf").length).toBeGreaterThan(0);
    expect(screen.getByText("application/pdf")).toBeInTheDocument();
  });

  it("should render tabs for preview, versions, permissions, and metadata", () => {
    vi.mocked(useFilesHook.useFile).mockReturnValue({
      file: mockFile,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    vi.mocked(useFilesHook.useFileVersions).mockReturnValue({
      versions: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FileDetail fileId="1" />
      </Wrapper>
    );

    // Use getAllByText since tabs might appear multiple times
    expect(screen.getAllByText("Vista Previa").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Versiones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Permisos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Metadatos").length).toBeGreaterThan(0);
  });
});

