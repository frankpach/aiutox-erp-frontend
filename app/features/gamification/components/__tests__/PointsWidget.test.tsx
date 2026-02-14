/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PointsWidget } from "~/features/gamification/components/PointsWidget";

// Mock useGamification hook
vi.mock("~/features/gamification/hooks/useGamification", () => ({
  useMyPoints: vi.fn(),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "gamification.totalPoints": "Puntos totales",
        "gamification.level": "Nivel",
        "gamification.pointsToNext": "puntos para el siguiente nivel",
        "gamification.streak": "Racha",
        "gamification.days": "días",
      };
      return translations[key] ?? key;
    },
    language: "es",
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("PointsWidget", () => {
  it("renders null when loading", async () => {
    const { useMyPoints } = await import(
      "~/features/gamification/hooks/useGamification"
    );
    (useMyPoints as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = renderWithProviders(<PointsWidget />);
    expect(container.innerHTML).toBe("");
  });

  it("renders null when no data", async () => {
    const { useMyPoints } = await import(
      "~/features/gamification/hooks/useGamification"
    );
    (useMyPoints as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { container } = renderWithProviders(<PointsWidget />);
    expect(container.innerHTML).toBe("");
  });

  it("renders compact mode with points", async () => {
    const { useMyPoints } = await import(
      "~/features/gamification/hooks/useGamification"
    );
    (useMyPoints as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        total_points: 250,
        level: 2,
        current_streak: 3,
        longest_streak: 5,
        progress_to_next_level: 60,
        points_to_next_level: 150,
      },
      isLoading: false,
    });

    renderWithProviders(<PointsWidget compact />);
    expect(screen.getByText("250")).toBeInTheDocument();
  });

  it("renders full mode with level and progress", async () => {
    const { useMyPoints } = await import(
      "~/features/gamification/hooks/useGamification"
    );
    (useMyPoints as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        total_points: 500,
        level: 3,
        current_streak: 7,
        longest_streak: 10,
        progress_to_next_level: 45,
        points_to_next_level: 400,
      },
      isLoading: false,
    });

    renderWithProviders(<PointsWidget />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("Nivel 3")).toBeInTheDocument();
    expect(screen.getByText("Nivel 4")).toBeInTheDocument();
    expect(
      screen.getByText("400 puntos para el siguiente nivel"),
    ).toBeInTheDocument();
  });

  it("shows streak when active", async () => {
    const { useMyPoints } = await import(
      "~/features/gamification/hooks/useGamification"
    );
    (useMyPoints as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        total_points: 100,
        level: 2,
        current_streak: 5,
        longest_streak: 5,
        progress_to_next_level: 0,
        points_to_next_level: 300,
      },
      isLoading: false,
    });

    renderWithProviders(<PointsWidget />);
    expect(screen.getByText("5 días racha")).toBeInTheDocument();
  });

  it("hides streak when zero", async () => {
    const { useMyPoints } = await import(
      "~/features/gamification/hooks/useGamification"
    );
    (useMyPoints as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        total_points: 100,
        level: 2,
        current_streak: 0,
        longest_streak: 3,
        progress_to_next_level: 0,
        points_to_next_level: 300,
      },
      isLoading: false,
    });

    renderWithProviders(<PointsWidget />);
    expect(screen.queryByText(/racha/i)).not.toBeInTheDocument();
  });
});
