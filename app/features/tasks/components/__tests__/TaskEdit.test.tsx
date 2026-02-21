/**
 * TaskEdit component tests
 * Aligned to actual TaskEdit interface: { task, open, onOpenChange, onTaskUpdated }
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskEdit } from "~/features/tasks/components/TaskEdit";
import type { Task, TaskStatus, TaskPriority } from "~/features/tasks/types/task.types";

// Mock useTranslation — keys match what TaskEdit actually calls via t()
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.editTask": "Editar Tarea",
        "tasks.editTaskDescription": "Editar descripción de tarea",
        "tasks.description": "Descripción",
        "tasks.descriptionPlaceholder": "Descripción placeholder",
        "tasks.titlePlaceholder": "Título placeholder",
        "tasks.assignedTo": "Asignado a",
        "tasks.dueDate": "Fecha de vencimiento",
        "tasks.update": "Actualizar",
        "tasks.colorOverride": "Color override",
        "tasks.status.title": "Estado",
        "tasks.priority.title": "Prioridad",
        "tasks.statuses.todo": "Por hacer",
        "tasks.statuses.inProgress": "En progreso",
        "tasks.statuses.done": "Completado",
        "tasks.statuses.onHold": "En espera",
        "tasks.statuses.cancelled": "Cancelado",
        "tasks.priorities.low": "Baja",
        "tasks.priorities.medium": "Media",
        "tasks.priorities.high": "Alta",
        "tasks.priorities.urgent": "Urgente",
        "tasks.errors.eventTimesRequired": "Debes indicar inicio y fin",
        "tasks.errors.invalidEventRange": "La hora de fin debe ser posterior",
        "common.name": "Nombre",
        "common.cancel": "Cancelar",
        "common.delete": "Eliminar",
        "common.save": "Guardar",
        "common.saving": "Guardando...",
        "common.deleting": "Eliminando...",
        "common.confirmDelete": "Confirmar Eliminación",
        "calendar.events.allDay": "Todo el día",
        "calendar.labels.start": "Inicio",
        "calendar.labels.end": "Fin",
        "tags.title": "Etiquetas",
        "tags.select": "Seleccionar tags",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock hooks — TaskEdit uses useUpdateTask, useDeleteTask, useUsers, useTags, useAuthStore
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();

vi.mock("~/features/tasks/hooks/useTasks", () => ({
  useUpdateTask: () => mockUpdateTask(),
  useDeleteTask: () => mockDeleteTask(),
}));

vi.mock("~/features/users/hooks/useUsers", () => ({
  useUsers: () => ({
    users: [
      { id: "user1", first_name: "John", last_name: "Doe", email: "john@example.com" },
      { id: "user2", first_name: "Jane", last_name: "Smith", email: "jane@example.com" },
    ],
    isLoading: false,
  }),
}));

vi.mock("~/features/tags/hooks/useTags", () => ({
  useTags: () => ({
    data: [
      { id: "tag1", name: "Urgent" },
      { id: "tag2", name: "Important" },
    ],
  }),
}));

vi.mock("~/stores/authStore", () => ({
  useAuthStore: () => ({ user: { id: "user1" } }),
}));

vi.mock("~/features/tasks/api/tasks.api", () => ({
  listAssignments: vi.fn().mockResolvedValue({ data: [] }),
  createAssignment: vi.fn().mockResolvedValue({}),
  deleteAssignment: vi.fn().mockResolvedValue({}),
}));

vi.mock("~/features/tasks/components/FileUploader", () => ({
  FileUploader: () => <div data-testid="file-uploader">File Uploader</div>,
}));

vi.mock("~/features/tasks/components/CommentThread", () => ({
  CommentThread: ({ taskId }: { taskId: string }) => (
    <div data-testid="comment-thread">Comentarios para {taskId}</div>
  ),
}));

vi.mock("~/features/tasks/components/CalendarSyncToggle", () => ({
  CalendarSyncToggle: () => <div data-testid="calendar-sync" />,
}));

vi.mock("~/components/ui/multi-select", () => ({
  MultiSelect: ({ options, selected, onChange, label }: {
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (v: string[]) => void;
    label?: string;
  }) => (
    <div data-testid="multi-select">
      {label && <span>{label}</span>}
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange([...selected, opt.value])}>
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

const makeTask = (overrides: Partial<Task> = {}): Task => ({
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
  ...overrides,
});

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
    mockUpdateTask.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    mockDeleteTask.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
  });

  const renderTaskEdit = (task: Task | null = makeTask(), extraProps: Record<string, unknown> = {}) => {
    const onOpenChange = vi.fn();
    return {
      onOpenChange,
      ...render(
        <QueryClientProvider client={queryClient}>
          <TaskEdit task={task} open={true} onOpenChange={onOpenChange} {...extraProps} />
        </QueryClientProvider>
      ),
    };
  };

  describe("Rendering", () => {
    it("renders dialog with task data when open", async () => {
      const task = makeTask({ title: "Tarea existente", description: "Descripción existente" });
      renderTaskEdit(task);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Tarea existente")).toBeInTheDocument();
      });
      expect(screen.getByText(/editar tarea/i)).toBeInTheDocument();
    });

    it("shows saving text and disabled state while isPending", () => {
      mockUpdateTask.mockReturnValue({ mutateAsync: vi.fn(), isPending: true });
      renderTaskEdit(makeTask());

      // When isPending, button shows t("common.saving") = "Guardando..."
      const buttons = screen.getAllByRole("button");
      const savingBtn = buttons.find((b) => /guardando/i.test(b.textContent ?? ""));
      expect(savingBtn).toBeDisabled();
    });

    it("does not render content when dialog is closed", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TaskEdit task={makeTask()} open={false} onOpenChange={vi.fn()} />
        </QueryClientProvider>
      );
      expect(screen.queryByText(/editar tarea/i)).not.toBeInTheDocument();
    });

    it("renders without crashing when task is null", () => {
      renderTaskEdit(null);
      expect(screen.queryByDisplayValue("Test Task")).not.toBeInTheDocument();
    });
  });

  describe("Task Editing", () => {
    it("calls mutateAsync on submit", async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUpdateTask.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });

      const task = makeTask({ title: "Tarea original", description: "Desc original" });
      renderTaskEdit(task);

      await waitFor(() => expect(screen.getByDisplayValue("Tarea original")).toBeInTheDocument());

      fireEvent.change(screen.getByDisplayValue("Tarea original"), {
        target: { value: "Tarea actualizada" },
      });

      fireEvent.click(screen.getByText(/actualizar/i));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });

    it("renders status select trigger", async () => {
      renderTaskEdit(makeTask());

      await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());

      // Radix Select renders a button with role="combobox" for the trigger
      const combos = screen.getAllByRole("combobox");
      expect(combos.length).toBeGreaterThanOrEqual(2);
    });

    it("renders priority select trigger", async () => {
      renderTaskEdit(makeTask());

      await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());

      const combos = screen.getAllByRole("combobox");
      expect(combos.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("User Assignments", () => {
    it("renders MultiSelect for user assignment", () => {
      renderTaskEdit(makeTask());

      // Two MultiSelects: users + tags
      const multiSelects = screen.getAllByTestId("multi-select");
      expect(multiSelects.length).toBeGreaterThanOrEqual(1);
    });

    it("shows John Doe in MultiSelect options", () => {
      renderTaskEdit(makeTask());

      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  describe("File Attachments", () => {
    it("renders file uploader when task is provided", async () => {
      renderTaskEdit(makeTask());

      await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());

      expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
    });
  });

  describe("Dialog Actions", () => {
    it("calls onOpenChange(false) when cancel is clicked", async () => {
      const { onOpenChange } = renderTaskEdit(makeTask());

      await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());

      const cancelBtn = screen.getAllByRole("button").find((b) => /cancelar/i.test(b.textContent ?? ""));
      fireEvent.click(cancelBtn!);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls mutateAsync when update button is clicked", async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUpdateTask.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });

      renderTaskEdit(makeTask());

      await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());

      const updateBtn = screen.getAllByRole("button").find((b) => /actualizar/i.test(b.textContent ?? ""));
      fireEvent.click(updateBtn!);

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
    });
  });

  describe("Error Handling", () => {
    it("logs error to console when mutateAsync rejects", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockUpdateTask.mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error("Update failed")),
        isPending: false,
      });

      renderTaskEdit(makeTask());

      const updateBtn = screen.getAllByRole("button").find((b) => /actualizar/i.test(b.textContent ?? ""));
      fireEvent.click(updateBtn!);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
