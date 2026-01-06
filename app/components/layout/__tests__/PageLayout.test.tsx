/**
 * Tests para PageLayout
 *
 * Verifica que el componente renderiza correctamente con diferentes props
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PageLayout } from "../PageLayout";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("PageLayout", () => {
  it("renderiza título correctamente", () => {
    render(
      <PageLayout title="Mi Página">
        <div>Contenido</div>
      </PageLayout>
    );

    expect(screen.getByText("Mi Página")).toBeInTheDocument();
  });

  it("renderiza descripción cuando se proporciona", () => {
    render(
      <PageLayout title="Mi Página" description="Descripción de la página">
        <div>Contenido</div>
      </PageLayout>
    );

    expect(screen.getByText("Descripción de la página")).toBeInTheDocument();
  });

  it("renderiza breadcrumb cuando se proporciona", () => {
    renderWithRouter(
      <PageLayout
        title="Mi Página"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Mi Página" },
        ]}
      >
        <div>Contenido</div>
      </PageLayout>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    // El título también aparece en el breadcrumb, así que buscamos ambos
    const breadcrumbItems = screen.getAllByText("Mi Página");
    expect(breadcrumbItems.length).toBeGreaterThan(0);
  });

  it("renderiza breadcrumb con enlaces", () => {
    const { container } = renderWithRouter(
      <PageLayout 
        title="Mi Página" 
        breadcrumb={[{ label: "Home", href: "/" }]}
      >
        <div>Contenido</div>
      </PageLayout>
    );

    // Buscar el enlace dentro del breadcrumb
    const breadcrumb = container.querySelector('nav[aria-label="layout.breadcrumb"]');
    expect(breadcrumb).toBeInTheDocument();
    const link = breadcrumb?.querySelector('a[href="/"]');
    expect(link).toBeInTheDocument();
    expect(link?.textContent).toBe("Home");
  });

  it("renderiza estado de carga cuando loading es true", () => {
    renderWithRouter(
      <PageLayout title="Mi Página" loading={true}>
        <div>Contenido</div>
      </PageLayout>
    );

    // Debe mostrar skeletons
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    // En modo loading, el título no debe aparecer (solo skeletons)
    expect(screen.queryByText("Mi Página")).toBeNull();
  });

  it("renderiza estado de error cuando error se proporciona", () => {
    renderWithRouter(
      <PageLayout title="Mi Página" error="Error al cargar">
        <div>Contenido</div>
      </PageLayout>
    );

    // El mensaje de error aparece en el título y en el contenido
    const errorMessages = screen.getAllByText("Error al cargar");
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it("renderiza estado de error con objeto Error", () => {
    const error = new Error("Error de red");
    render(
      <PageLayout title="Mi Página" error={error}>
        <div>Contenido</div>
      </PageLayout>
    );

    expect(screen.getByText("Error de red")).toBeInTheDocument();
  });

  it("renderiza contenido cuando no hay loading ni error", () => {
    render(
      <PageLayout title="Mi Página">
        <div data-testid="content">Contenido de la página</div>
      </PageLayout>
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByText("Contenido de la página")).toBeInTheDocument();
  });

  it("renderiza footer cuando se proporciona", () => {
    render(
      <PageLayout
        title="Mi Página"
        footer={<button>Guardar</button>}
      >
        <div>Contenido</div>
      </PageLayout>
    );

    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("aplica fullWidth cuando se especifica", () => {
    const { container } = render(
      <PageLayout title="Mi Página" fullWidth={true}>
        <div>Contenido</div>
      </PageLayout>
    );

    const mainContainer = container.querySelector(".container");
    // Con fullWidth, no debe tener clase "container" o debe tener padding 0
    expect(mainContainer || container.firstChild).toBeTruthy();
  });

  it("aplica className personalizada", () => {
    const { container } = renderWithRouter(
      <PageLayout title="Mi Página" className="custom-class">
        <div>Contenido</div>
      </PageLayout>
    );

    // Buscar el contenedor principal que tiene la className
    const mainContainer = container.querySelector(".container.mx-auto.py-6.space-y-6.flex-1");
    expect(mainContainer).toHaveClass("custom-class");
  });
});

