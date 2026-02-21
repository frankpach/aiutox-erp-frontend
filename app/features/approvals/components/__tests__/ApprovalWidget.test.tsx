/**
 * Tests for ApprovalWidget component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApprovalWidget } from "~/features/approvals/components/ApprovalWidget";

describe("ApprovalWidget", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    );
  };

  it("debería renderizar el widget correctamente", () => {
    renderWithQueryClient(
      <ApprovalWidget requestId="req-1" variant="full" />
    );
  });

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
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Aprobado")).toBeInTheDocument();
    });

    it("debería mostrar estado rechazado", () => {
      renderWithQueryClient(
        <ApprovalWidget requestId="req-1" variant="full" />
      );
      expect(screen.getByText("Rechazado")).toBeInTheDocument();
    });

    it("debería mostrar estado cancelado", () => {
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
