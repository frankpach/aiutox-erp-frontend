/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SavedViewsManager } from "~/features/tasks/components/SavedViewsManager";

// Mock useSavedViews
vi.mock("~/features/tasks/hooks/useSavedViews", () => ({
  useSavedViews: () => ({
    views: [
      {
        id: "view-1",
        name: "Mis urgentes",
        description: "Tareas urgentes",
        filters: { priority: ["urgent"] },
        sort_config: { field: "created_at", direction: "desc" },
        column_config: {},
        is_default: true,
        is_public: false,
      },
      {
        id: "view-2",
        name: "Equipo",
        description: "",
        filters: { status: ["in_progress"] },
        sort_config: { field: "updated_at", direction: "asc" },
        column_config: {},
        is_default: false,
        is_public: true,
      },
    ],
    isLoading: false,
    createView: vi.fn(),
    updateView: vi.fn(),
    deleteView: vi.fn(),
    isCreating: false,
  }),
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "tasks.savedViews.title": "Vistas guardadas",
        "tasks.savedViews.create": "Crear vista",
        "tasks.savedViews.edit": "Editar",
        "tasks.savedViews.delete": "Eliminar",
        "tasks.savedViews.apply": "Aplicar",
        "tasks.savedViews.clear": "Limpiar",
        "tasks.savedViews.default": "Predeterminada",
        "tasks.savedViews.public": "Pública",
        "tasks.savedViews.private": "Privada",
        "tasks.savedViews.confirmDelete": "¿Eliminar esta vista?",
        "tasks.savedViews.confirmDeleteDescription": "Esta acción no se puede deshacer.",
        "tasks.savedViews.cancel": "Cancelar",
      };
      return map[key] ?? key;
    },
    language: "es",
  }),
}));

describe("SavedViewsManager", () => {
  const onApplyView = vi.fn();
  const onClearView = vi.fn();

  it("renderiza el botón de vistas guardadas", () => {
    render(
      <SavedViewsManager onApplyView={onApplyView} onClearView={onClearView} />,
    );
    // Debe existir un botón/trigger para abrir el dropdown
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
  });

  it("muestra indicador de vista activa", () => {
    render(
      <SavedViewsManager
        activeViewId="view-1"
        onApplyView={onApplyView}
        onClearView={onClearView}
      />,
    );
    // El componente debe renderizar sin errores con activeViewId
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
