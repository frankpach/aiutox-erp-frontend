/**
 * Tests para LoadingState
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LoadingState } from "../LoadingState";

describe("LoadingState", () => {
  it("renderiza correctamente con valores por defecto", () => {
    const { container } = render(<LoadingState />);
    // Debe tener skeletons
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renderiza número correcto de líneas", () => {
    const { container } = render(<LoadingState lines={5} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    // Debe tener al menos 5 líneas (más el título si showTitle es true)
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });

  it("no muestra título cuando showTitle es false", () => {
    const { container } = render(<LoadingState showTitle={false} />);
    // No debe tener skeleton de título
    const titleSkeleton = container.querySelector("h1, h2, h3");
    expect(titleSkeleton).not.toBeInTheDocument();
  });

  it("renderiza sin Card cuando inCard es false", () => {
    const { container } = render(<LoadingState inCard={false} />);
    // No debe tener Card
    const card = container.querySelector("[class*='card']");
    expect(card).not.toBeInTheDocument();
  });
});




