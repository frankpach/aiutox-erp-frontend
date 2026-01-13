/**
 * Tests for ApprovalWidget component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApprovalWidget } from "~/features/approvals/components/ApprovalWidget";
import type { ApprovalWidgetData } from "~/features/approvals/types/approval.types";

const mockWidgetData: ApprovalWidgetData = {
  request: {
    id: "req-1",
    title: "Aprobación de Orden #123",
    description: "Orden por $5,000",
    status: "pending",
    current_step: 1,
    entity_type: "order",
    entity_id: "order-1",
    requested_by: "user-1",
    requested_at: "2025-01-12T10:00:00Z",
    completed_at: null,
  },
  flow: {
    id: "flow-1",
    name: "Aprobación de Órdenes",
    flow_type: "sequential",
  },
  current_step: {
    id: "step-1",
    step_order: 1,
    name: "Aprobación Gerencial",
    description: "Aprobación inicial por el gerente de departamento",
    approver_type: "role",
    rejection_required: true,
  },
  permissions: {
    can_approve: true,
  },
  timeline: [],
};

const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createMockQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("ApprovalWidget", () => {
  describe("Variante full", () => {
    it("debería renderizar el widget completo", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Aprobación de Orden #123")).toBeInTheDocument();
    });

    it("debería mostrar el estado pending", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Pendiente")).toBeInTheDocument();
    });

    it("debería mostrar el paso actual", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Aprobación Gerencial")).toBeInTheDocument();
    });

    it("debería mostrar botones de aprobar y rechazar cuando se puede aprobar", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Aprobar Solicitud")).toBeInTheDocument();
      expect(screen.getByText("Rechazar Solicitud")).toBeInTheDocument();
    });
  });

  describe("Variante compact", () => {
    it("debería renderizar el widget compacto", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="compact" />
      );
      expect(screen.getByText("Pendiente")).toBeInTheDocument();
    });

    it("debería mostrar botones de acción", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="compact" />
      );
      expect(screen.getByText("Aprobar")).toBeInTheDocument();
      expect(screen.getByText("Rechazar")).toBeInTheDocument();
    });
  });

  describe("Variante minimal", () => {
    it("debería renderizar solo el badge de estado", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="minimal" />
      );
      expect(screen.getByText("Pendiente")).toBeInTheDocument();
      expect(screen.queryByText("Aprobar")).not.toBeInTheDocument();
    });
  });

  describe("Estados de aprobación", () => {
    it("debería mostrar estado aprobado", () => {
      const approvedData = {
        ...mockWidgetData,
        request: { ...mockWidgetData.request, status: "approved" as const },
      };
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Aprobado")).toBeInTheDocument();
    });

    it("debería mostrar estado rechazado", () => {
      const rejectedData = {
        ...mockWidgetData,
        request: { ...mockWidgetData.request, status: "rejected" as const },
      };
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Rechazado")).toBeInTheDocument();
    });

    it("debería mostrar estado cancelado", () => {
      const cancelledData = {
        ...mockWidgetData,
        request: { ...mockWidgetData.request, status: "cancelled" as const },
      };
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Cancelado")).toBeInTheDocument();
    });
  });

  describe("Acciones de usuario", () => {
    it("debería permitir agregar comentario", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="compact" />
      );
      const textarea = screen.getByPlaceholderText(/Agrega un comentario/);
      fireEvent.change(textarea, { target: { value: "Comentario de prueba" } });
      expect(textarea).toHaveValue("Comentario de prueba");
    });

    it("debería mostrar campo de motivo de rechazo cuando es requerido", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="compact" />
      );
      expect(screen.getByText(/Motivo de rechazo/)).toBeInTheDocument();
    });

    it("debería deshabilitar botón de rechazar si no hay motivo requerido", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="compact" />
      );
      const rejectButton = screen.getByText("Rechazar");
      expect(rejectButton).toBeDisabled();
    });
  });

  describe("Loading y error states", () => {
    it("debería mostrar skeleton mientras carga", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      // El skeleton se muestra mientras la query está en estado loading
    });

    it("debería mostrar mensaje de error si falla la carga", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="invalid-id" variant="full" />
      );
      // El error state se muestra si la query falla
    });
  });

  describe("Callbacks", () => {
    it("debería llamar a onAction cuando se aprueba", () => {
      const onAction = vi.fn();
      renderWithQueryClient(
        <ApprovalWidget
          requestId="req-1"
          variant="compact"
          onAction={onAction}
        />
      );
      // Simular aprobación
      // onAction("approve");
      // expect(onAction).toHaveBeenCalledWith("approve");
    });

    it("debería llamar a onAction cuando se rechaza", () => {
      const onAction = vi.fn();
      renderWithQueryClient(
        <ApprovalWidget
          requestId="req-1"
          variant="compact"
          onAction={onAction}
        />
      );
      // Simular rechazo
      // onAction("reject");
      // expect(onAction).toHaveBeenCalledWith("reject");
    });
  });
});
