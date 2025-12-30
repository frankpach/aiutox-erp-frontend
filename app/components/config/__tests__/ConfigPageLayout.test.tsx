/**
 * Tests para ConfigPageLayout
 *
 * Verifica que el componente renderiza correctamente con diferentes props
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ConfigPageLayout } from "../ConfigPageLayout";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("ConfigPageLayout", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza título correctamente", () => {
    renderWithRouter(
      <ConfigPageLayout title="Configuración">
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    expect(screen.getByText("Configuración")).toBeInTheDocument();
  });

  it("renderiza botón Guardar cuando onSave se proporciona", () => {
    const handleSave = vi.fn();
    renderWithRouter(
      <ConfigPageLayout title="Configuración" onSave={handleSave}>
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    const saveButton = screen.getByText("Guardar Cambios");
    expect(saveButton).toBeInTheDocument();
  });

  it("renderiza botón Reset cuando onReset se proporciona", () => {
    const handleReset = vi.fn();
    renderWithRouter(
      <ConfigPageLayout title="Configuración" onReset={handleReset}>
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    const resetButton = screen.getByText("Reset");
    expect(resetButton).toBeInTheDocument();
  });

  it("deshabilita botón Guardar cuando no hay cambios", () => {
    const handleSave = vi.fn();
    renderWithRouter(
      <ConfigPageLayout
        title="Configuración"
        hasChanges={false}
        onSave={handleSave}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    // Buscar todos los botones y encontrar el que está deshabilitado
    const saveButtons = screen.getAllByText("Guardar Cambios");
    const disabledButton = saveButtons.find(btn => btn.hasAttribute("disabled"));
    expect(disabledButton).toBeTruthy();
    expect(disabledButton).toBeDisabled();
  });

  it("habilita botón Guardar cuando hay cambios", () => {
    const handleSave = vi.fn();
    const { container } = renderWithRouter(
      <ConfigPageLayout
        title="Configuración"
        hasChanges={true}
        onSave={handleSave}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    // Buscar el botón habilitado (no disabled)
    const saveButtons = screen.getAllByText("Guardar Cambios");
    const enabledButton = saveButtons.find(btn => !btn.hasAttribute("disabled"));
    expect(enabledButton).toBeTruthy();
  });

  it("deshabilita botones cuando está guardando", () => {
    const handleSave = vi.fn();
    const handleReset = vi.fn();
    render(
      <ConfigPageLayout
        title="Configuración"
        hasChanges={true}
        isSaving={true}
        onSave={handleSave}
        onReset={handleReset}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    const saveButton = screen.getByText("Guardando...");
    const resetButton = screen.getByText("Reset");

    expect(saveButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it("muestra texto personalizado en botón Guardar", () => {
    const handleSave = vi.fn();
    renderWithRouter(
      <ConfigPageLayout
        title="Configuración"
        saveButtonText="Guardar Cambios Personalizado"
        onSave={handleSave}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    expect(screen.getByText("Guardar Cambios Personalizado")).toBeInTheDocument();
  });

  it("muestra texto personalizado en botón Reset", () => {
    const handleReset = vi.fn();
    renderWithRouter(
      <ConfigPageLayout
        title="Configuración"
        resetButtonText="Restablecer"
        onReset={handleReset}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    expect(screen.getByText("Restablecer")).toBeInTheDocument();
  });

  it("llama onSave cuando se hace clic en Guardar", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    const { container } = renderWithRouter(
      <ConfigPageLayout
        title="Configuración"
        hasChanges={true}
        onSave={handleSave}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    // Buscar el botón habilitado dentro del footer sticky
    const footer = container.querySelector('[class*="sticky"]');
    const saveButton = Array.from(footer?.querySelectorAll('button') || [])
      .find(btn => btn.textContent?.trim() === "Guardar Cambios" && !btn.disabled);

    expect(saveButton).toBeTruthy();
    expect(saveButton).not.toBeDisabled();

    // Verificar que el botón tiene onClick
    expect(saveButton?.onclick || saveButton?.getAttribute('onclick')).toBeTruthy();

    // Hacer click directamente en el elemento
    if (saveButton) {
      saveButton.click();
      // Esperar un poco para que se procese el evento
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(handleSave).toHaveBeenCalledTimes(1);
    }
  });

  it("llama onReset cuando se hace clic en Reset", async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();

    const { container } = renderWithRouter(
      <ConfigPageLayout
        title="Configuración"
        hasChanges={true}
        onReset={handleReset}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    // Buscar el botón habilitado dentro del footer sticky
    const footer = container.querySelector('[class*="sticky"]');
    const resetButton = Array.from(footer?.querySelectorAll('button') || [])
      .find(btn => btn.textContent?.trim() === "Reset" && !btn.disabled);

    expect(resetButton).toBeTruthy();
    expect(resetButton).not.toBeDisabled();

    // Verificar que el botón tiene onClick
    expect(resetButton?.onclick || resetButton?.getAttribute('onclick')).toBeTruthy();

    // Hacer click directamente en el elemento
    if (resetButton) {
      resetButton.click();
      // Esperar un poco para que se procese el evento
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(handleReset).toHaveBeenCalledTimes(1);
    }
  });

  it("renderiza footerContent cuando se proporciona", () => {
    renderWithRouter(
      <ConfigPageLayout
        title="Configuración"
        footerContent={<span>Contenido adicional</span>}
      >
        <div>Contenido</div>
      </ConfigPageLayout>
    );

    expect(screen.getByText("Contenido adicional")).toBeInTheDocument();
  });
});

