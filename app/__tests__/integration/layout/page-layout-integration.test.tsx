/**
 * Tests de integración para PageLayout
 *
 * Verifica la integración con otros componentes y hooks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageLayout } from "~/components/layout/PageLayout";

// Mock de useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("PageLayout Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("integra correctamente con breadcrumb y navegación", () => {
    const { container } = render(
      <TestWrapper>
        <PageLayout
          title="Mi Página"
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Mi Página" },
          ]}
        >
          <div>Contenido</div>
        </PageLayout>
      </TestWrapper>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    // Verificar que el breadcrumb existe
    const breadcrumb = container.querySelector('nav[aria-label="layout.breadcrumb"]');
    expect(breadcrumb).toBeInTheDocument();
    // Verificar que "Mi Página" aparece en el breadcrumb
    expect(breadcrumb?.textContent).toContain("Mi Página");
  });

  it("maneja estados de carga correctamente", async () => {
    const { rerender } = render(
      <TestWrapper>
        <PageLayout title="Mi Página" loading={true}>
          <div>Contenido</div>
        </PageLayout>
      </TestWrapper>
    );

    // Debe mostrar skeleton
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);

    // Cambiar a no loading
    rerender(
      <TestWrapper>
        <PageLayout title="Mi Página" loading={false}>
          <div data-testid="content">Contenido</div>
        </PageLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });

  it("maneja estados de error correctamente", () => {
    render(
      <TestWrapper>
        <PageLayout title="Mi Página" error="Error de red">
          <div>Contenido</div>
        </PageLayout>
      </TestWrapper>
    );

    expect(screen.getByText("Error de red")).toBeInTheDocument();
  });

  it("integra correctamente con footer sticky", () => {
    render(
      <TestWrapper>
        <PageLayout
          title="Mi Página"
          footer={<button>Guardar</button>}
        >
          <div>Contenido</div>
        </PageLayout>
      </TestWrapper>
    );

    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });
});

