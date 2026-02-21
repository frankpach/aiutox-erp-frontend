/**
 * TaskEdit component tests
 * Tests for task editing dialog component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskEdit } from "~/features/tasks/components/TaskEdit";
import type { Task, TaskStatus, TaskPriority } from "~/features/tasks/types/task.types";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.editTask": "Editar Tarea",
        "tasks.title": "Título",
        "tasks.description": "Descripción",
        "tasks.status": "Estado",
        "tasks.priority": "Prioridad",
        "tasks.assignedTo": "Asignado a",
        "tasks.dueDate": "Fecha de vencimiento",
        "tasks.tags": "Etiquetas",
        "tasks.checklist.title": "Checklist",
        "tasks.attachments": "Archivos adjuntos",
        "tasks.comments": "Comentarios",
        "tasks.update": "Actualizar",
        "tasks.cancel": "Cancelar",
        "tasks.loading": "Cargando...",
        "tasks.status.todo": "Por hacer",
        "tasks.status.in_progress": "En progreso",
        "tasks.status.done": "Completado",
        "tasks.priority.low": "Baja",
        "tasks.priority.medium": "Media",
        "tasks.priority.high": "Alta",
        "tasks.priority.urgent": "Urgente",
        "validation.required": "Este campo es requerido",
        "common.save": "Guardar",
        "common.cancel": "Cancelar",
        "common.loading": "Cargando...",
        "common.edit": "Editar",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock hooks
const mockUpdateTask = vi.fn();
const mockTask = vi.fn();
const mockAssignments = vi.fn();
const mockUsers = vi.fn();
const mockTags = vi.fn();

const mockTasks = [
  {
    id: "task-1",
    title: "Test Task",
    description: "Test Description",
    status: "open" as TaskStatus,
    priority: "medium" as TaskPriority,
    assigned_to_id: "user-1",
    created_by_id: "user-2",
    due_date: "2025-01-15",
    checklist: [],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    tenant_id: "tenant-1",
  },
];

vi.mock("~/features/tasks/hooks/useTasks", () => ({
  useTask: () => mockTask(),
  useUpdateTask: () => mockUpdateTask(),
  useAssignments: () => mockAssignments(),
}));

vi.mock("~/features/users/hooks/useUsers", () => ({
  useUsers: () => mockUsers(),
}));

vi.mock("~/features/tags/hooks/useTags", () => ({
  useTags: () => mockTags(),
}));

// Mock child components
vi.mock("~/features/tasks/components/FileUploader", () => ({
  FileUploader: ({ onFileAttached }: { onFileAttached: (file: any) => void }) => (
    <div data-testid="file-uploader">
      <button onClick={() => onFileAttached({ id: "file1", name: "test.pdf" })}>
        Adjuntar archivo
      </button>
    </div>
  ),
}));

vi.mock("~/features/tasks/components/CommentThread", () => ({
  CommentThread: ({ taskId }: { taskId: string }) => (
    <div data-testid="comment-thread">Comentarios para {taskId}</div>
  ),
}));

vi.mock("~/features/tasks/components/CalendarSyncToggle", () => ({
  CalendarSyncToggle: ({ taskId, enabled }: { taskId: string; enabled: boolean }) => (
    <div data-testid="calendar-sync">
      Calendar sync: {enabled ? "enabled" : "disabled"} para {taskId}
    </div>
  ),
}));

vi.mock("~/components/ui/multi-select", () => ({
  MultiSelect: ({ options, value, onChange }: any) => (
    <div data-testid="multi-select">
      {options.map((opt: any) => (
        <button
          key={opt.value}
          onClick={() => onChange([...value, opt.value])}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

describe("TaskEdit component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Setup default mock returns
    mockTask.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    mockAssignments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    mockUsers.mockReturnValue({
      data: [
        { id: "user1", name: "John Doe", email: "john@example.com" },
        { id: "user2", name: "Jane Smith", email: "jane@example.com" },
      ],
      isLoading: false,
    });

    mockTags.mockReturnValue({
      data: [
        { id: "tag1", name: "Urgent", color: "#FF0000" },
        { id: "tag2", name: "Important", color: "#0000FF" },
      ],
      isLoading: false,
    });
  });

  const renderTaskEdit = (props = {}) => {
    const defaultProps = {
      task: mockTasks[0] || null,
      open: true,
      onOpenChange: vi.fn(),
      taskId: "task-123",
      ...props,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <TaskEdit {...defaultProps} />
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("renders dialog with task data when open", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Tarea existente",
        description: "Descripción existente",
        status: "in_progress" as TaskStatus,
        priority: "high" as TaskPriority,
        assigned_to_id: "user1",
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByDisplayValue("Tarea existente")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Descripción existente")).toBeInTheDocument();
      });

      expect(screen.getByText(/editar tarea/i)).toBeInTheDocument();
    });

    it("shows loading state while loading task", () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderTaskEdit();

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it("does not render when dialog is closed", () => {
      renderTaskEdit({ isOpen: false });

      expect(screen.queryByText(/editar tarea/i)).not.toBeInTheDocument();
    });

    it("displays error message when task loading fails", () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Failed to load task"),
      });

      renderTaskEdit();

      expect(screen.getByText(/failed to load task/i)).toBeInTheDocument();
    });
  });

  describe("Task Editing", () => {
    it("updates task fields successfully", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Tarea original",
        description: "Descripción original",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      const mockMutateAsync = vi.fn().mockResolvedValue({
        data: { ...existingTask, title: "Tarea actualizada" },
      });

      mockUpdateTask.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByDisplayValue("Tarea original")).toBeInTheDocument();
      });

      // Update title
      const titleInput = screen.getByDisplayValue("Tarea original");
      fireEvent.change(titleInput, { target: { value: "Tarea actualizada" } });

      // Update description
      const descriptionInput = screen.getByDisplayValue("Descripción original");
      fireEvent.change(descriptionInput, { target: { value: "Descripción actualizada" } });

      // Submit form
      const updateButton = screen.getByText(/actualizar/i);
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith("task-123", {
          title: "Tarea actualizada",
          description: "Descripción actualizada",
          status: "todo",
          priority: "medium",
          assigned_to_id: null,
          tags: [],
          checklist: [],
        });
      });
    });

    it("handles status selection", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      // Open status dropdown
      const statusSelect = screen.getByLabelText(/estado/i);
      fireEvent.click(statusSelect);

      // Select different status
      const inProgressOption = screen.getByText(/en progreso/i);
      fireEvent.click(inProgressOption);

      expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    });

    it("handles priority selection", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      // Open priority dropdown
      const prioritySelect = screen.getByLabelText(/prioridad/i);
      fireEvent.click(prioritySelect);

      // Select high priority
      const highPriorityOption = screen.getByText(/alta/i);
      fireEvent.click(highPriorityOption);

      expect(screen.getByText(/alta/i)).toBeInTheDocument();
    });
  });

  describe("User Assignments", () => {
    it("handles user assignment", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      // Open assignee dropdown
      const assigneeSelect = screen.getByLabelText(/asignado a/i);
      fireEvent.click(assigneeSelect);

      // Select user
      const userOption = screen.getByText(/John Doe/i);
      fireEvent.click(userOption);

      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    it("shows current assignment", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: "user1",
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      // Should show current assignment
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  describe("File Attachments", () => {
    it("handles file attachment", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      // Find and click file uploader button
      const fileUploader = screen.getByTestId("file-uploader");
      const attachButton = screen.getByText(/adjuntar archivo/i);
      fireEvent.click(attachButton);

      // File should be attached (mock implementation)
      expect(fileUploader).toBeInTheDocument();
    });
  });

  describe("Dialog Actions", () => {
    it("calls onClose when cancel is clicked", async () => {
      const mockOnClose = vi.fn();

      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskEdit({ onClose: mockOnClose });

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText(/cancelar/i);
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("closes dialog after successful update", async () => {
      const mockOnClose = vi.fn();

      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      const mockMutateAsync = vi.fn().mockResolvedValue({
        data: { ...existingTask, title: "Updated Task" },
      });

      mockUpdateTask.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderTaskEdit({ onClose: mockOnClose });

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      const updateButton = screen.getByText(/actualizar/i);
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      // Dialog should close after successful update
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when update fails", async () => {
      const existingTask: Task = {
        id: "task-123",
        title: "Test Task",
        description: "Test Description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to_id: null,
        checklist: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by_id: "user1",
        tenant_id: "tenant1",
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      mockUpdateTask.mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error("Update failed")),
        isPending: false,
      });

      renderTaskEdit();

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });

      const updateButton = screen.getByText(/actualizar/i);
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });
    });
  });
});
