/**
 * Tests para PageHeader
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PageHeader } from "../PageHeader";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("PageHeader", () => {
  it("renderiza título correctamente", () => {
    render(<PageHeader title="Mi Página" />);
    expect(screen.getByText("Mi Página")).toBeInTheDocument();
  });

  it("renderiza descripción cuando se proporciona", () => {
    render(
      <PageHeader
        title="Mi Página"
        description="Descripción de la página"
      />
    );
    expect(screen.getByText("Descripción de la página")).toBeInTheDocument();
  });

  it("renderiza breadcrumb cuando se proporciona", () => {
    const { container } = renderWithRouter(
      <PageHeader
        title="Mi Página"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Mi Página" },
        ]}
      />
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    // Verificar que el breadcrumb existe
    const breadcrumb = container.querySelector('nav[aria-label="Breadcrumb"]');
    expect(breadcrumb).toBeInTheDocument();
    // Verificar que "Mi Página" aparece en el breadcrumb
    expect(breadcrumb?.textContent).toContain("Mi Página");
  });

  it("renderiza acciones cuando se proporcionan", () => {
    render(
      <PageHeader
        title="Mi Página"
        actions={<button>Acción</button>}
      />
    );
    expect(screen.getByText("Acción")).toBeInTheDocument();
  });
});

