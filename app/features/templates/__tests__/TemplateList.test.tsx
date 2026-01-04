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
import { Template, TemplateType, TemplateCategory } from "~/features/templates/types/template.types";

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

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

describe("Templates Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();
  });

  describe("TemplateList", () => {
    it("renders template list with actions", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TemplateList templates={[mockTemplate]} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Welcome Email")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("v1")).toBeInTheDocument();
      expect(screen.getByText("View")).toBeInTheDocument();
      expect(screen.getByText("Render")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked", async () => {
      const onEdit = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TemplateList templates={[mockTemplate]} onEdit={onEdit} />
        </QueryClientProvider>
      );

      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("calls onDelete when delete button is clicked", async () => {
      const onDelete = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TemplateList templates={[mockTemplate]} onDelete={onDelete} />
        </QueryClientProvider>
      );

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("calls onPreview when preview button is clicked", async () => {
      const onPreview = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TemplateList templates={[mockTemplate]} onPreview={onPreview} />
        </QueryClientProvider>
      );

      const previewButtons = screen.getAllByText("View");
      fireEvent.click(previewButtons[0]);

      await waitFor(() => {
        expect(onPreview).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("calls onRender when render button is clicked", async () => {
      const onRender = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TemplateList templates={[mockTemplate]} onRender={onRender} />
        </QueryClientProvider>
      );

      const renderButtons = screen.getAllByText("Render");
      fireEvent.click(renderButtons[0]);

      await waitFor(() => {
        expect(onRender).toHaveBeenCalledWith(mockTemplate);
      });
    });

    it("shows loading state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TemplateList templates={[]} loading={true} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Loading templates...")).toBeInTheDocument();
    });

    it("shows empty state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TemplateList templates={[]} />
        </QueryClientProvider>
      );

      expect(screen.getByText("No templates found")).toBeInTheDocument();
      expect(screen.getByText("Create Template")).toBeInTheDocument();
    });
  });

  describe("TemplateForm", () => {
    it("renders form with all fields", () => {
      render(
        <QueryClientProvider client={QueryClient}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByLabelText("Template Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Category")).toBeInTheDocument();
      expect(screen.getByLabelText("Type")).toBeInTheDocument();
      expect(screen.getByLabelText("Content")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("shows subject field for email templates", () => {
      render(
        <QueryClientProvider client={QueryClient}>
          <TemplateForm 
            template={{ ...mockTemplate, type: "email" }}
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", async () => {
      const onSubmit = vi.fn();
      
      render(
        <QueryClientProvider client={QueryClient}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={onSubmit}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const nameInput = screen.getByLabelText("Template Name");
      fireEvent.change(nameInput, { target: { value: "New Template" } });

      const contentTextarea = screen.getByLabelText("Content");
      fireEvent.change(contentTextarea, { target: { value: "Template content" } });

      const submitButton = screen.getByText("Save");
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
        <QueryClientProvider client={queryClient}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={onCancel}
          />
        </QueryClientProvider>
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it("adds variables when add button is clicked", async () => {
      render(
        <QueryClientProvider client={QueryClient}>
          <TemplateForm 
            categories={[mockCategory]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const variableInput = screen.getByPlaceholderText("Add new variable");
      fireEvent.change(variableInput, { target: { value: "test_variable" } });

      const addButton = screen.getByText("Add");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("test_variable")).toBeInTheDocument();
      });
    });

    it("removes variables when X button is clicked", async () => {
      render(
        <QueryClientProvider client={queryClient}>
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
        <QueryClientProvider client={QueryClient}>
          <TemplatePreview template={mockTemplate} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Template Preview")).toBeInTheDocument();
      expect(screen.getByText("Format")).toBeInTheDocument();
      expect(screen.getByText("Context Variables")).toBeInTheDocument();
      expect(screen.getByText("Render")).toBeInTheDocument();
      expect(screen.getByText("Preview Output")).toBeInTheDocument();
    });

    it("calls onRender when render button is clicked", async () => {
      const onRender = vi.fn();
      
      render(
        <QueryClientProvider client={QueryClient}>
          <TemplatePreview template={mockTemplate} onRender={onRender} />
        </QueryClientProvider>
      );

      const renderButton = screen.getByText("Render");
      fireEvent.click(renderButton);

      await waitFor(() => {
        expect(onRender).toHaveBeenCalled();
      });
    });

    it("renders content with variables replaced", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TemplatePreview template={mockTemplate} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Hello John Doe, welcome to AiutoX ERP!")).toBeInTheDocument();
    });

    it("updates context when context fields change", async () => {
      render(
        <QueryClientProvider client={queryClient}>
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
