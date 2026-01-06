/**
 * Tasks tests
 * Basic unit tests for Tasks module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskList } from "~/features/tasks/components/TaskList";
import { Task, TaskStatus, TaskPriority } from "~/features/tasks/types/task.types";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.loading": "Cargando tareas...",
        "tasks.noTasks": "No hay tareas",
        "tasks.createTask": "Crear Tarea",
        "tasks.title": "Tareas",
        "tasks.description": "Gestiona tus tareas y proyectos",
        "tasks.refresh": "Actualizar",
        "common.edit": "Editar",
        "common.delete": "Eliminar",
        "common.view": "Ver",
        "common.refresh": "Actualizar",
        "common.actions": "Acciones",
        "tasks.status.todo": "Por hacer",
        "tasks.status.in_progress": "En progreso",
        "tasks.status.done": "Completado",
        "tasks.status.title": "Estado",
        "tasks.priority.low": "Baja",
        "tasks.priority.medium": "Media",
        "tasks.priority.high": "Alta",
        "tasks.priority.urgent": "Urgente",
        "tasks.priority.title": "Prioridad",
        "tasks.assignedTo": "Asignado a",
        "tasks.dueDate": "Fecha de vencimiento",
        "tasks.checklist.title": "Checklist",
        "tasks.search.placeholder": "Buscar tareas...",
        "common.locale": "es",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock date-fns/locale
vi.mock("date-fns/locale", () => ({
  es: {},
  enUS: {},
}));

// Mock date-fns format
vi.mock("date-fns", () => ({
  format: (date: Date, formatStr: string, options?: any) => "15/01/2025",
}));

// Mock data
const mockTasks: Task[] = [
  {
    id: "1",
    tenant_id: "tenant-1",
    title: "Test Task 1",
    description: "Test description",
    assigned_to: "user-1",
    created_by: "user-1",
    status: "todo",
    priority: "high",
    due_date: "2025-01-15T00:00:00Z",
    checklist: [
      { id: "1", text: "Item 1", completed: false },
      { id: "2", text: "Item 2", completed: true, completed_at: "2025-01-01T00:00:00Z" },
    ],
    metadata: { category: "development" },
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    tenant_id: "tenant-1",
    title: "Test Task 2",
    description: "Another test description",
    assigned_to: "user-2",
    created_by: "user-1",
    status: "in_progress",
    priority: "medium",
    due_date: "2025-01-20T00:00:00Z",
    checklist: [],
    metadata: { category: "design" },
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
];

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

describe("Tasks Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();
  });

  describe("TaskList", () => {
    it("renders loading state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={[]} loading={true} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Cargando tareas...")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={[]} loading={false} />
        </QueryClientProvider>
      );

      expect(screen.getByText("No hay tareas")).toBeInTheDocument();
    });

    it("renders tasks list", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={mockTasks} loading={false} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    });

    it("calls onRefresh when refresh button is clicked", async () => {
      const onRefresh = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={mockTasks} onRefresh={onRefresh} />
        </QueryClientProvider>
      );

      const refreshButton = screen.getByText("Actualizar");
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("calls onTaskCreate when create button is clicked", async () => {
      const onTaskCreate = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={[]} onTaskCreate={onTaskCreate} />
        </QueryClientProvider>
      );

      const createButton = screen.getByText("Crear Tarea");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(onTaskCreate).toHaveBeenCalledTimes(1);
      });
    });

    it("calls onTaskEdit when edit button is clicked", async () => {
      const onTaskEdit = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={mockTasks} onTaskEdit={onTaskEdit} />
        </QueryClientProvider>
      );

      const editButtons = screen.getAllByText("Editar");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(onTaskEdit).toHaveBeenCalledWith(mockTasks[0]);
      });
    });

    it("calls onTaskDelete when delete button is clicked", async () => {
      const onTaskDelete = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={mockTasks} onTaskDelete={onTaskDelete} />
        </QueryClientProvider>
      );

      const deleteButtons = screen.getAllByText("Eliminar");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(onTaskDelete).toHaveBeenCalledWith(mockTasks[0]);
      });
    });

    it("calls onTaskComplete when checklist item is toggled", async () => {
      const onTaskComplete = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <TaskList tasks={mockTasks} onTaskComplete={onTaskComplete} />
        </QueryClientProvider>
      );

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(onTaskComplete).toHaveBeenCalledWith("1", "1");
      });
    });
  });

  describe("Task Status and Priority", () => {
    it("has correct task status values", () => {
      const statuses: TaskStatus[] = [
        "todo", "in_progress", "done", "cancelled", "on_hold"
      ];

      expect(statuses).toHaveLength(5);
      expect(statuses).toContain("todo");
      expect(statuses).toContain("done");
    });

    it("has correct task priority values", () => {
      const priorities: TaskPriority[] = [
        "low", "medium", "high", "urgent"
      ];

      expect(priorities).toHaveLength(4);
      expect(priorities).toContain("low");
      expect(priorities).toContain("urgent");
    });
  });

  describe("Task Data Structure", () => {
    it("has required task fields", () => {
      const task = mockTasks[0];

      expect(task).toHaveProperty("id");
      expect(task).toHaveProperty("tenant_id");
      expect(task).toHaveProperty("title");
      expect(task).toHaveProperty("description");
      expect(task).toHaveProperty("assigned_to");
      expect(task).toHaveProperty("created_by");
      expect(task).toHaveProperty("status");
      expect(task).toHaveProperty("priority");
      expect(task).toHaveProperty("checklist");
      expect(task).toHaveProperty("created_at");
      expect(task).toHaveProperty("updated_at");
    });

    it("has correct checklist structure", () => {
      const checklist = mockTasks[0].checklist[0];

      expect(checklist).toHaveProperty("id");
      expect(checklist).toHaveProperty("text");
      expect(checklist).toHaveProperty("completed");
      expect(checklist.completed).toBe(false);
    });

    it("has completed checklist item with timestamp", () => {
      const completedItem = mockTasks[0].checklist[1];

      expect(completedItem.completed).toBe(true);
      expect(completedItem).toHaveProperty("completed_at");
      expect(completedItem.completed_at).toBe("2025-01-01T00:00:00Z");
    });
  });
});
