/**
 * Tests for ApprovalStatusBadge component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalStatusBadge } from "~/features/approvals/components/ApprovalStatusBadge";
import type { ApprovalStatus } from "~/features/approvals/types/approval.types";

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
        const badge = screen.getByRole("button");
        expect(badge).toBeInTheDocument();
      }
    );

    it("debería mostrar el icono por defecto", () => {
      render(<ApprovalStatusBadge status="approved" />);
      const badge = screen.getByRole("button");
      expect(badge.querySelector("svg")).toBeInTheDocument();
    });

    it("debería mostrar el label por defecto", () => {
      render(<ApprovalStatusBadge status="approved" />);
      expect(screen.getByText("Aprobado")).toBeInTheDocument();
    });

    it("debería ocultar el icono cuando showIcon es false", () => {
      render(<ApprovalStatusBadge status="approved" showIcon={false} />);
      const badge = screen.getByRole("button");
      expect(badge.querySelector("svg")).not.toBeInTheDocument();
    });

    it("debería ocultar el label cuando showLabel es false", () => {
      render(<ApprovalStatusBadge status="approved" showLabel={false} />);
      expect(screen.queryByText("Aprobado")).not.toBeInTheDocument();
    });

    it("debería aplicar el tamaño correcto", () => {
      render(<ApprovalStatusBadge status="approved" size="lg" />);
      const badge = screen.getByRole("button");
      expect(badge).toHaveClass("text-base");
    });
  });

  describe("Colores y estados", () => {
    it("debería tener el color correcto para estado pending", () => {
      render(<ApprovalStatusBadge status="pending" />);
      const badge = screen.getByRole("button");
      expect(badge).toHaveClass("bg-yellow-100");
    });

    it("debería tener el color correcto para estado approved", () => {
      render(<ApprovalStatusBadge status="approved" />);
      const badge = screen.getByRole("button");
      expect(badge).toHaveClass("bg-green-100");
    });

    it("debería tener el color correcto para estado rejected", () => {
      render(<ApprovalStatusBadge status="rejected" />);
      const badge = screen.getByRole("button");
      expect(badge).toHaveClass("bg-red-100");
    });

    it("debería tener el color correcto para estado cancelled", () => {
      render(<ApprovalStatusBadge status="cancelled" />);
      const badge = screen.getByRole("button");
      expect(badge).toHaveClass("bg-gray-100");
    });

    it("debería tener el color correcto para estado delegated", () => {
      render(<ApprovalStatusBadge status="delegated" />);
      const badge = screen.getByRole("button");
      expect(badge).toHaveClass("bg-blue-100");
    });
  });

  describe("Accesibilidad", () => {
    it("debería tener role button para tooltip", () => {
      render(<ApprovalStatusBadge status="approved" />);
      const badge = screen.getByRole("button");
      expect(badge).toBeInTheDocument();
    });

    it("debería tener cursor help para indicar tooltip", () => {
      render(<ApprovalStatusBadge status="approved" />);
      const badge = screen.getByRole("button");
      expect(badge).toHaveClass("cursor-help");
    });
  });
});
