/**
 * Tests para ErrorState
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renderiza mensaje de error correctamente", () => {
    render(<ErrorState message="Error al cargar los datos" />);
    expect(screen.getByText("Error al cargar los datos")).toBeInTheDocument();
  });

  it("renderiza acción cuando se proporciona", () => {
    render(
      <ErrorState
        message="Error al cargar"
        action={<button>Reintentar</button>}
      />
    );
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });
});







