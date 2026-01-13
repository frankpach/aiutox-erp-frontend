/**
 * Tests for ApprovalTimeline component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalTimeline } from "~/features/approvals/components/ApprovalTimeline";
import type { ApprovalTimelineItem } from "~/features/approvals/types/approval.types";

describe("ApprovalTimeline", () => {
  const mockItems: ApprovalTimelineItem[] = [
    {
      id: "1",
      request_id: "req-1",
      action_type: "created",
      step_order: 1,
      comment: "Solicitud inicial",
      acted_by: "user-1",
      acted_at: "2025-01-12T10:00:00Z",
      metadata: null,
    },
    {
      id: "2",
      request_id: "req-1",
      action_type: "approve",
      step_order: 1,
      comment: "Aprobado por gerente",
      acted_by: "user-2",
      acted_at: "2025-01-12T11:00:00Z",
      metadata: null,
    },
    {
      id: "3",
      request_id: "req-1",
      action_type: "reject",
      step_order: 2,
      comment: "Rechazado por finanzas",
      rejection_reason: "Presupuesto insuficiente",
      acted_by: "user-3",
      acted_at: "2025-01-12T12:00:00Z",
      metadata: null,
    },
  ];

  describe("Renderizado básico", () => {
    it("debería renderizar el timeline con items", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText("Historial de Aprobaciones")).toBeInTheDocument();
    });

    it("debería mostrar mensaje cuando no hay items", () => {
      render(<ApprovalTimeline items={[]} />);
      expect(
        screen.getByText("No hay acciones registradas")
      ).toBeInTheDocument();
    });

    it("debería renderizar todos los items del timeline", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText("Solicitud creada")).toBeInTheDocument();
      expect(screen.getByText("Aprobado")).toBeInTheDocument();
      expect(screen.getByText("Rechazado")).toBeInTheDocument();
    });
  });

  describe("Contenido de items", () => {
    it("debería mostrar el comentario del item", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText("Solicitud inicial")).toBeInTheDocument();
    });

    it("debería mostrar el usuario que realizó la acción", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText("Por: user-1")).toBeInTheDocument();
    });

    it("debería mostrar el motivo del rechazo", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText("Motivo del rechazo:")).toBeInTheDocument();
      expect(screen.getByText("Presupuesto insuficiente")).toBeInTheDocument();
    });

    it("debería mostrar el número de paso", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText("(Paso 1)")).toBeInTheDocument();
    });
  });

  describe("Formato de fecha", () => {
    it("debería mostrar la fecha en formato español", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText("12 de enero de 2025")).toBeInTheDocument();
    });

    it("debería mostrar la hora", () => {
      render(<ApprovalTimeline items={mockItems} />);
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
    });
  });

  describe("Configuración", () => {
    it("debería aceptar altura máxima personalizada", () => {
      const { container } = render(
        <ApprovalTimeline items={mockItems} maxHeight="600px" />
      );
      const scrollArea = container.querySelector('[class*="max-h-"]');
      expect(scrollArea).toHaveClass("max-h-600px");
    });

    it("debería usar altura máxima por defecto", () => {
      const { container } = render(<ApprovalTimeline items={mockItems} />);
      const scrollArea = container.querySelector('[class*="max-h-"]');
      expect(scrollArea).toHaveClass("max-h-400px");
    });
  });

  describe("Accesibilidad", () => {
    it("debería tener estructura semántica correcta", () => {
      render(<ApprovalTimeline items={mockItems} />);
      const timeline = screen
        .getByText("Historial de Aprobaciones")
        .closest("div");
      expect(timeline).toBeInTheDocument();
    });
  });
});
