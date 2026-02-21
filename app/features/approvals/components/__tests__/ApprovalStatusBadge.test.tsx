/**
 * Tests for ApprovalStatusBadge component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalStatusBadge } from "~/features/approvals/components/ApprovalStatusBadge";
import type { ApprovalStatus } from "~/features/approvals/types/approval.types";

vi.mock("~/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => children,
  Tooltip: ({ children }: any) => children,
  TooltipTrigger: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@hugeicons/react", () => ({
  HugeiconsIcon: ({ size, className }: any) => <svg data-testid="badge-icon" className={className} width={size} height={size} />,
}));

vi.mock("@hugeicons/core-free-icons", () => ({
  ClockIcon: null,
  CheckmarkCircleIcon: null,
  Cancel01Icon: null,
  AlertCircleIcon: null,
}));

// Helper: get the Badge div (has cursor-help class)
const getBadge = () => document.querySelector(".cursor-help") as HTMLElement;

describe("ApprovalStatusBadge", () => {
  const statuses: ApprovalStatus[] = [
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "delegated",
  ];

  describe("Renderizado básico", () => {
    it.each(statuses)(
      "debería renderizar el badge para el estado '%s'",
      (status: ApprovalStatus) => {
        render(<ApprovalStatusBadge status={status} />);
        expect(getBadge()).toBeInTheDocument();
      }
    );

    it("debería mostrar el icono por defecto", () => {
      render(<ApprovalStatusBadge status="approved" />);
      expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
    });

    it("debería mostrar el label por defecto", () => {
      render(<ApprovalStatusBadge status="approved" />);
      expect(screen.getByText("Aprobado")).toBeInTheDocument();
    });

    it("debería ocultar el icono cuando showIcon es false", () => {
      render(<ApprovalStatusBadge status="approved" showIcon={false} />);
      expect(screen.queryByTestId("badge-icon")).not.toBeInTheDocument();
    });

    it("debería ocultar el label cuando showLabel es false", () => {
      render(<ApprovalStatusBadge status="approved" showLabel={false} />);
      expect(screen.queryByText("Aprobado")).not.toBeInTheDocument();
    });

    it("debería aplicar el tamaño correcto", () => {
      render(<ApprovalStatusBadge status="approved" size="lg" />);
      expect(getBadge()).toHaveClass("text-base");
    });
  });

  describe("Colores y estados", () => {
    it("debería tener el color correcto para estado pending", () => {
      render(<ApprovalStatusBadge status="pending" />);
      expect(getBadge()).toHaveClass("bg-yellow-100");
    });

    it("debería tener el color correcto para estado approved", () => {
      render(<ApprovalStatusBadge status="approved" />);
      expect(getBadge()).toHaveClass("bg-green-100");
    });

    it("debería tener el color correcto para estado rejected", () => {
      render(<ApprovalStatusBadge status="rejected" />);
      expect(getBadge()).toHaveClass("bg-red-100");
    });

    it("debería tener el color correcto para estado cancelled", () => {
      render(<ApprovalStatusBadge status="cancelled" />);
      expect(getBadge()).toHaveClass("bg-gray-100");
    });

    it("debería tener el color correcto para estado delegated", () => {
      render(<ApprovalStatusBadge status="delegated" />);
      expect(getBadge()).toHaveClass("bg-blue-100");
    });
  });

  describe("Accesibilidad", () => {
    it("debería tener cursor help para indicar tooltip", () => {
      render(<ApprovalStatusBadge status="approved" />);
      expect(getBadge()).toHaveClass("cursor-help");
    });

    it("debería renderizar el badge en el DOM", () => {
      render(<ApprovalStatusBadge status="approved" />);
      expect(getBadge()).toBeInTheDocument();
    });
  });
});
