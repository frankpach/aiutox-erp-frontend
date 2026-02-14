/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BulkActionsBar } from "~/features/tasks/components/BulkActionsBar";

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "tasks.bulkActions.selected": "seleccionadas",
        "tasks.bulkActions.changeStatus": "Cambiar estado",
        "tasks.bulkActions.changePriority": "Cambiar prioridad",
        "tasks.bulkActions.delete": "Eliminar",
        "tasks.statuses.todo": "Pendiente",
        "tasks.statuses.in_progress": "En progreso",
        "tasks.statuses.done": "Completada",
        "tasks.priorities.low": "Baja",
        "tasks.priorities.high": "Alta",
      };
      return map[key] ?? key;
    },
    language: "es",
  }),
}));

describe("BulkActionsBar", () => {
  const defaultProps = {
    selectedCount: 3,
    onUpdateStatus: vi.fn(),
    onUpdatePriority: vi.fn(),
    onDelete: vi.fn(),
    onClearSelection: vi.fn(),
    isProcessing: false,
  };

  it("no renderiza cuando selectedCount es 0", () => {
    const { container } = render(
      <BulkActionsBar {...defaultProps} selectedCount={0} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("muestra cantidad de seleccionados", () => {
    render(<BulkActionsBar {...defaultProps} />);
    expect(screen.getByText("3 seleccionadas")).toBeInTheDocument();
  });

  it("muestra botón de eliminar", () => {
    render(<BulkActionsBar {...defaultProps} />);
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("llama onDelete al hacer click en eliminar", async () => {
    const user = userEvent.setup();
    render(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByText("Eliminar"));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it("llama onClearSelection al hacer click en X", async () => {
    const user = userEvent.setup();
    render(<BulkActionsBar {...defaultProps} />);

    // El botón X es el último botón ghost
    const buttons = screen.getAllByRole("button");
    const clearButton = buttons[buttons.length - 1]!;
    await user.click(clearButton);
    expect(defaultProps.onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("deshabilita controles cuando isProcessing es true", () => {
    render(<BulkActionsBar {...defaultProps} isProcessing />);

    const deleteButton = screen.getByText("Eliminar").closest("button")!;
    expect(deleteButton).toBeDisabled();
  });
});
