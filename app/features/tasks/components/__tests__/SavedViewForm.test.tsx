/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SavedViewForm } from "~/features/tasks/components/SavedViewForm";

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "tasks.savedViews.name": "Nombre",
        "tasks.savedViews.namePlaceholder": "Nombre de la vista",
        "tasks.savedViews.description": "Descripción",
        "tasks.savedViews.descriptionPlaceholder": "Descripción opcional",
        "tasks.savedViews.filterByStatus": "Filtrar por estado",
        "tasks.savedViews.filterByPriority": "Filtrar por prioridad",
        "tasks.savedViews.sortBy": "Ordenar por",
        "tasks.savedViews.sortDirection": "Dirección",
        "tasks.savedViews.ascending": "Ascendente",
        "tasks.savedViews.descending": "Descendente",
        "tasks.savedViews.isDefault": "Vista predeterminada",
        "tasks.savedViews.isPublic": "Vista pública",
        "tasks.savedViews.save": "Guardar",
        "tasks.savedViews.cancel": "Cancelar",
        "tasks.savedViews.create": "Crear vista",
        "tasks.savedViews.edit": "Editar vista",
        "tasks.savedViews.sortFields.createdAt": "Fecha creación",
        "tasks.savedViews.sortFields.updatedAt": "Fecha actualización",
        "tasks.savedViews.sortFields.title": "Título",
        "tasks.savedViews.sortFields.priority": "Prioridad",
        "tasks.savedViews.sortFields.dueDate": "Fecha límite",
      };
      return map[key] ?? key;
    },
    language: "es",
  }),
}));

describe("SavedViewForm", () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();

  it("renderiza campos del formulario", () => {
    render(
      <SavedViewForm onSubmit={onSubmit} onCancel={onCancel} />,
    );

    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Filtrar por estado")).toBeInTheDocument();
    expect(screen.getByText("Filtrar por prioridad")).toBeInTheDocument();
    expect(screen.getByText("Ordenar por")).toBeInTheDocument();
  });

  it("renderiza switches de default y público", () => {
    render(
      <SavedViewForm onSubmit={onSubmit} onCancel={onCancel} />,
    );

    expect(screen.getByText("Vista predeterminada")).toBeInTheDocument();
    expect(screen.getByText("Vista pública")).toBeInTheDocument();
  });

  it("renderiza botones guardar y cancelar", () => {
    render(
      <SavedViewForm onSubmit={onSubmit} onCancel={onCancel} />,
    );

    expect(screen.getByText("Guardar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("pre-llena datos cuando se pasa initialData", () => {
    render(
      <SavedViewForm
        initialData={{
          id: "view-1",
          name: "Mi vista",
          description: "Descripción de prueba",
          filters: { status: ["todo"], priority: ["high"] },
          sort_config: { field: "title", direction: "asc" },
          column_config: {},
          is_default: true,
          is_public: false,
          created_by_id: "user-1",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    const nameInput = screen.getByDisplayValue("Mi vista");
    expect(nameInput).toBeInTheDocument();
  });

  it("muestra estado de envío", () => {
    render(
      <SavedViewForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting
      />,
    );

    const saveButton = screen.getByText("Guardar").closest("button");
    expect(saveButton).toBeDisabled();
  });
});
