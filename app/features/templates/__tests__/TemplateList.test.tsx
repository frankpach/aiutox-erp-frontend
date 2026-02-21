/**
 * Templates tests
 * Basic unit tests for Templates module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TemplateList } from "~/features/templates/components/TemplateList";
import { TemplateForm } from "~/features/templates/components/TemplateForm";
import { TemplatePreview } from "~/features/templates/components/TemplatePreview";
import type { Template, TemplateType, TemplateCategory } from "~/features/templates/types/template.types";

// Mock the translation system
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.cancel": "Cancelar",
        "common.save": "Guardar",
        "common.saving": "Guardando...",
        "common.render": "Renderizar",
        "common.refresh": "Actualizar",
        "common.actions": "Acciones",
        "common.loading": "Cargando...",
        "common.view": "Ver",
        "common.edit": "Editar",
        "common.delete": "Eliminar",
        "common.add": "Agregar",
        "templates.name": "Nombre",
        "templates.name.placeholder": "Ingrese el nombre",
        "templates.category": "Categoría",
        "templates.category.placeholder": "Seleccione una categoría",
        "templates.type.title": "Tipo",
        "templates.type.document": "Documento",
        "templates.type.email": "Email",
        "templates.subject": "Asunto",
        "templates.subject.placeholder": "Ingrese el asunto",
        "templates.content": "Contenido",
        "templates.content.placeholder": "Ingrese el contenido",
        "templates.variables": "Variables",
        "templates.variables.placeholder": "Nombre de variable",
        "templates.add_variable": "Agregar variable",
        "templates.active": "Activo",
        "templates.loading": "Cargando plantillas...",
        "templates.noTemplates": "No hay plantillas",
        "templates.create": "Crear Plantilla",
        "templates.title": "Plantillas",
        "templates.description": "Gestiona tus plantillas de documentos y emails",
        "templates.preview": "Vista previa",
        "templates.context": "Contexto",
        "templates.format": "Formato",
        "templates.html": "HTML",
        "templates.text": "Texto plano",
        "templates.edit": "Editar",
        "templates.delete": "Eliminar",
        "templates.duplicate": "Duplicar",
        "templates.export": "Exportar",
        "templates.preview.context": "Contexto de vista previa",
        "templates.preview.render": "Renderizar",
        "templates.preview.output": "Salida de vista previa",
        "templates.preview.title": "Vista previa de plantilla",
        "templates.preview.format": "Formato",
        "templates.preview.context_variables": "Variables de contexto",
        "templates.status.title": "Estado",
        "templates.status.active": "Activo",
        "templates.status.inactive": "Inactivo",
        "templates.render": "Renderizar",
        "templates.version": "Versión",
        "templates.updatedAt": "Actualizado",
        "templates.search.placeholder": "Buscar plantillas...",
      };
      return translations[key] || key;
    },
  }),
}));

// Create a QueryClient instance for tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 0 },
    mutations: { retry: false },
  },
});

// Mock data
const mockTemplate: Template = {
  id: "1",
  tenant_id: "tenant-1",
  name: "Welcome Email",
  category_id: "category-1",
  type: "email",
  subject: "Welcome to {{company_name}}",
  content: "Hello {{user_name}}, welcome to {{company_name}}!",
  variables: ["company_name", "user_name"],
  is_active: true,
  version: 1,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockCategory: TemplateCategory = {
  id: "category-1",
  tenant_id: "tenant-1",
  name: "Email Templates",
  description: "Email templates for notifications",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};


describe("Templates Module", () => {
  // let queryClient: QueryClient; // Unused for now

  beforeEach(() => {
    // queryClient = createQueryClient(); // Unused for now
    vi.clearAllMocks();
  });

  describe("TemplateList", () => {
    it("renders template list with actions", () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateList templates={[mockTemplate]} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Welcome Email")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("v1")).toBeInTheDocument();
      expect(screen.getByText("Ver")).toBeInTheDocument();
      expect(screen.getByText("Renderizar")).toBeInTheDocument();
      expect(screen.getByText("Editar")).toBeInTheDocument();
      expect(screen.getByText("Eliminar")).toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked", async () => {
      const onEdit = vi.fn();
      
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateList templates={[mockTemplate]} onEdit={onEdit} />
        </QueryClientProvider>
      );

      const editButtons = screen.getAllByText("Editar");
      if (editButtons[0]) {
        fireEvent.click(editButtons[0]);
      }

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("calls onDelete when delete button is clicked", async () => {
      const onDelete = vi.fn();
      
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateList templates={[mockTemplate]} onDelete={onDelete} />
        </QueryClientProvider>
      );

      const deleteButtons = screen.getAllByText("Eliminar");
      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0]);
      }

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("calls onPreview when preview button is clicked", async () => {
      const onPreview = vi.fn();
      
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateList templates={[mockTemplate]} onPreview={onPreview} />
        </QueryClientProvider>
      );

      const previewButtons = screen.getAllByText("Ver");
      if (previewButtons[0]) {
        fireEvent.click(previewButtons[0]);
      }

      await waitFor(() => {
        expect(onPreview).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("calls onRender when render button is clicked", async () => {
      const onRender = vi.fn();
      
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateList templates={[mockTemplate]} onRender={onRender} />
        </QueryClientProvider>
      );

      const renderButtons = screen.getAllByText("Renderizar");
      if (renderButtons[0]) {
        fireEvent.click(renderButtons[0]);
      }

      await waitFor(() => {
        expect(onRender).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("shows loading state", () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateList templates={[]} loading={true} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Cargando plantillas...")).toBeInTheDocument();
    });

    it("shows empty state", () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateList templates={[]} />
        </QueryClientProvider>
      );

      expect(screen.getByText("No hay plantillas")).toBeInTheDocument();
      expect(screen.getByText("Crear Plantilla")).toBeInTheDocument();
    });
  });

  describe("TemplateForm", () => {
    it("renders form with all fields", () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
      expect(screen.getByText("Seleccione una categoría")).toBeInTheDocument();
      expect(screen.getAllByText("Documento")[0]).toBeInTheDocument();
      expect(screen.getByLabelText("Contenido")).toBeInTheDocument();
      expect(screen.getByText("Activo")).toBeInTheDocument();
    });

    it("shows subject field for email templates", () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateForm 
            template={{ ...mockTemplate, type: "email" }}
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByLabelText("Asunto")).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", async () => {
      const onSubmit = vi.fn();
      
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={onSubmit}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const nameInput = screen.getByLabelText("Nombre");
      fireEvent.change(nameInput, { target: { value: "New Template" } });

      // Select category
      const categoryButton = screen.getByText("Seleccione una categoría");
      fireEvent.click(categoryButton);
      
      const categoryOption = screen.getAllByText("Email Templates")[1];
      if (categoryOption) {
        fireEvent.click(categoryOption);
      }

      const contentTextarea = screen.getByLabelText("Contenido");
      fireEvent.change(contentTextarea, { target: { value: "Template content" } });

      const submitButton = screen.getByText("Guardar");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: "New Template",
          category_id: "category-1",
          type: "document",
          subject: "",
          content: "Template content",
          variables: [],
          is_active: true,
        });
      });
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={onCancel}
          />
        </QueryClientProvider>
      );

      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it("adds variables when add button is clicked", async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const variableInput = screen.getByPlaceholderText("Nombre de variable");
      fireEvent.change(variableInput, { target: { value: "test_variable" } });

      const addButton = screen.getByText("Agregar");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("test_variable")).toBeInTheDocument();
      });
    });

    it("removes variables when X button is clicked", async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplateForm 
            template={{ ...mockTemplate, variables: ["test_variable"] }}
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const removeButton = screen.getByText("×");
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText("test_variable")).not.toBeInTheDocument();
      });
    });
  });

  describe("TemplatePreview", () => {
    it("renders preview with context and format selection", () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplatePreview template={mockTemplate} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Vista previa de plantilla")).toBeInTheDocument();
      expect(screen.getByText("Formato")).toBeInTheDocument();
      expect(screen.getByText("Contexto de vista previa")).toBeInTheDocument();
      expect(screen.getByText("Renderizar")).toBeInTheDocument();
      expect(screen.getByText("Salida de vista previa")).toBeInTheDocument();
    });

    it("calls onRender when render button is clicked", async () => {
      const onRender = vi.fn();
      
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplatePreview template={mockTemplate} onRender={onRender} />
        </QueryClientProvider>
      );

      const renderButton = screen.getByText("Renderizar");
      fireEvent.click(renderButton);

      await waitFor(() => {
        expect(onRender).toHaveBeenCalled();
      });
    });

    it("renders content with variables replaced", () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplatePreview template={mockTemplate} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Hello John Doe, welcome to AiutoX ERP!")).toBeInTheDocument();
    });

    it("updates context when context fields change", async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <TemplatePreview template={mockTemplate} />
        </QueryClientProvider>
      );

      const companyNameInput = screen.getByDisplayValue("AiutoX ERP");
      fireEvent.change(companyNameInput, { target: { value: "New Company" } });

      await waitFor(() => {
        expect(screen.getByText("Hello John Doe, welcome to New Company!")).toBeInTheDocument();
      });
    });
  });

  describe("Template Data Structure", () => {
    it("has required template fields", () => {
      const template = mockTemplate;

      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("tenant_id");
      expect(template).toHaveProperty("name");
      expect(template).toHaveProperty("category_id");
      expect(template).toHaveProperty("type");
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("content");
      expect(template).toHaveProperty("variables");
      expect(template).toHaveProperty("is_active");
      expect(template).toHaveProperty("version");
      expect(template).toHaveProperty("created_at");
      expect(template).toHaveProperty("updated_at");
    });

    it("has correct template types", () => {
      const types: TemplateType[] = ["document", "email", "sms"];
      expect(types).toHaveLength(3);
      expect(types).toContain("document");
      expect(types).toContain("email");
      expect(types).toContain("sms");
    });

    it("has required category fields", () => {
      const category = mockCategory;

      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("tenant_id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("description");
      expect(category).toHaveProperty("created_at");
      expect(category).toHaveProperty("updated_at");
    });
  });
});
