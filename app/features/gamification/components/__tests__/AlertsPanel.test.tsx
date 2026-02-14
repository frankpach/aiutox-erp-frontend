/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AlertsPanel } from "~/features/gamification/components/AlertsPanel";
import type { Alert } from "~/features/gamification/api/gamification.api";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "gamification.manager.alerts": "Alertas",
        "gamification.manager.noAlerts": "Sin alertas activas",
        "gamification.manager.burnoutRisk": "Riesgo de burnout",
        "gamification.manager.disengagement": "Desconexión",
        "gamification.manager.bottleneck": "Cuello de botella",
      };
      return translations[key] ?? key;
    },
    language: "es",
  }),
}));

const mockAlerts: Alert[] = [
  {
    type: "burnout_risk",
    employee_name: "Juan Pérez",
    employee_id: "user-1",
    severity: "high",
    recommendation: "Reducir carga de trabajo",
    data: {},
  },
  {
    type: "disengagement",
    employee_name: "María López",
    employee_id: "user-2",
    severity: "medium",
    recommendation: "Programar reunión 1:1",
    data: {},
  },
];

describe("AlertsPanel", () => {
  it("muestra mensaje vacío cuando no hay alertas", () => {
    render(<AlertsPanel alerts={[]} />);
    expect(screen.getByText("Sin alertas activas")).toBeInTheDocument();
  });

  it("muestra skeleton cuando está cargando", () => {
    const { container } = render(<AlertsPanel alerts={[]} isLoading />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renderiza alertas con tipo y recomendación", () => {
    render(<AlertsPanel alerts={mockAlerts} />);

    expect(screen.getByText("Riesgo de burnout")).toBeInTheDocument();
    expect(screen.getByText("Reducir carga de trabajo")).toBeInTheDocument();
    expect(screen.getByText("Desconexión")).toBeInTheDocument();
    expect(screen.getByText("Programar reunión 1:1")).toBeInTheDocument();
  });

  it("muestra severidad de cada alerta", () => {
    render(<AlertsPanel alerts={mockAlerts} />);

    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
  });

  it("renderiza título de sección", () => {
    render(<AlertsPanel alerts={mockAlerts} />);
    expect(screen.getByText("Alertas")).toBeInTheDocument();
  });
});
