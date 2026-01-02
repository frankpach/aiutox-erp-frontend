/**
 * Tests para EmptyState
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renderiza título correctamente", () => {
    render(<EmptyState title="No hay datos" />);
    expect(screen.getByText("No hay datos")).toBeInTheDocument();
  });

  it("renderiza descripción cuando se proporciona", () => {
    render(
      <EmptyState
        title="No hay datos"
        description="No se encontraron registros"
      />
    );
    expect(screen.getByText("No se encontraron registros")).toBeInTheDocument();
  });

  it("renderiza acción cuando se proporciona", () => {
    render(
      <EmptyState
        title="No hay datos"
        action={<button>Crear nuevo</button>}
      />
    );
    expect(screen.getByText("Crear nuevo")).toBeInTheDocument();
  });
});




