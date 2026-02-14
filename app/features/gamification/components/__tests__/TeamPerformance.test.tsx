/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TeamPerformance } from "~/features/gamification/components/TeamPerformance";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "gamification.manager.topPerformers": "Mejores rendimientos",
        "gamification.manager.needsAttention": "Necesita atención",
      };
      return translations[key] ?? key;
    },
    language: "es",
  }),
}));

const mockPerformers = [
  { user_id: "user-abc-12345678", points: 500, level: 3 },
  { user_id: "user-def-87654321", points: 350, level: 2 },
];

const mockAttention = [
  { user_id: "user-ghi-11111111", reason: "Sin actividad en 7 días" },
];

describe("TeamPerformance", () => {
  it("muestra skeleton cuando está cargando", () => {
    const { container } = render(
      <TeamPerformance
        topPerformers={[]}
        needsAttention={[]}
        isLoading
      />,
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(2);
  });

  it("muestra guión cuando no hay performers", () => {
    render(
      <TeamPerformance topPerformers={[]} needsAttention={[]} />,
    );
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza top performers con ranking", () => {
    render(
      <TeamPerformance
        topPerformers={mockPerformers}
        needsAttention={[]}
      />,
    );

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("500 pts")).toBeInTheDocument();
    expect(screen.getByText("Lv 3")).toBeInTheDocument();
  });

  it("renderiza usuarios que necesitan atención", () => {
    render(
      <TeamPerformance
        topPerformers={[]}
        needsAttention={mockAttention}
      />,
    );

    expect(
      screen.getByText("Sin actividad en 7 días"),
    ).toBeInTheDocument();
  });

  it("renderiza títulos de sección", () => {
    render(
      <TeamPerformance
        topPerformers={mockPerformers}
        needsAttention={mockAttention}
      />,
    );

    expect(screen.getByText("Mejores rendimientos")).toBeInTheDocument();
    expect(screen.getByText("Necesita atención")).toBeInTheDocument();
  });
});
