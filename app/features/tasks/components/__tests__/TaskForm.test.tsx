/**
 * TaskForm component tests
 * Tests for task creation and editing form
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskForm } from "~/features/tasks/components/TaskForm";
import type { TaskStatus, TaskPriority } from "~/features/tasks/types/task.types";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.createTask": "Create Task",
        "tasks.editTask": "Edit Task",
        "tasks.title": "Title",
        "tasks.description": "Description",
        "tasks.status": "Status",
        "tasks.priority": "Priority",
        "tasks.assignedTo": "Assigned to",
        "tasks.dueDate": "Due date",
        "tasks.tags": "Tags",
        "tasks.checklist.title": "Checklist",
        "tasks.create": "Create",
        "tasks.update": "Update",
        "tasks.cancel": "Cancel",
        "tasks.loading": "Loading...",
        "tasks.title.required": "Title is required",
        "tasks.status.todo": "To Do",
        "tasks.status.in_progress": "In Progress",
        "tasks.status.done": "Done",
        "tasks.priority.low": "Low",
        "tasks.priority.medium": "Medium",
        "tasks.priority.high": "High",
        "tasks.priority.urgent": "Urgent",
        "validation.required": "This field is required",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.loading": "Loading...",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock React Router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock hooks
const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockTask = vi.fn();
const mockAssignments = vi.fn();

vi.mock("~/features/tasks/hooks/useTasks", () => ({
  useTask: () => mockTask(),
  useCreateTask: () => mockCreateTask(),
  useUpdateTask: () => mockUpdateTask(),
  useAssignments: () => mockAssignments(),
}));

// Mock users and tags hooks
vi.mock("~/features/users/hooks/useUsers", () => ({
  useUsers: () => ({
    data: [
      { id: "user1", name: "John Doe", email: "john@example.com" },
      { id: "user2", name: "Jane Smith", email: "jane@example.com" },
    ],
    isLoading: false,
  }),
}));

vi.mock("~/features/tags/hooks/useTags", () => ({
  useTags: () => ({
    data: [
      { id: "tag1", name: "Urgent", color: "#FF0000" },
      { id: "tag2", name: "Important", color: "#0000FF" },
    ],
    isLoading: false,
  }),
}));

// Mock PageLayout
vi.mock("~/components/layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("TaskForm component", () => {
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
  });

  const renderTaskForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TaskForm
          submitLabel="Crear"
          {...props}
        />
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("renders form fields correctly", () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderTaskForm();

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument();
    });

    it("loads existing task data when editing", async () => {
      const existingTask = {
        id: "task1",
        title: "Existing Task",
        description: "Existing description",
        status: "in_progress" as TaskStatus,
        priority: "high" as TaskPriority,
        assigned_to: "user1",
        tags: ["tag1"],
        checklist: [],
      };

      mockTask.mockReturnValue({
        data: existingTask,
        isLoading: false,
        error: null,
      });

      renderTaskForm({ taskId: "task1" });

      await waitFor(() => {
        expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Existing description")).toBeInTheDocument();
      });
    });

    it("shows loading state", () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderTaskForm({ taskId: "task1" });

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("validates required title field", async () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      mockCreateTask.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      });

      renderTaskForm();

      // Try to submit without title
      // Find submit button by type="submit" instead of name
      const submitButton = screen.getAllByRole('button')[1]; // Get second button (submit)
      expect(submitButton).toBeInTheDocument();
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it("submits successfully with valid data", async () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const mockMutateAsync = vi.fn().mockResolvedValue({
        data: { id: "new-task", title: "New Task" },
      });

      mockCreateTask.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderTaskForm();

      // Fill form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "New Task" },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "Task description" },
      });

      // Submit form
      // Find submit button by type="submit" instead of name
      const submitButton = screen.getAllByRole('button')[1]; // Get second button (submit)
      expect(submitButton).toBeInTheDocument();
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          title: "New Task",
          description: "Task description",
          status: "todo",
          priority: "medium",
          assigned_to: null,
          tags: [],
          checklist: [],
        });
      });
    });
  });

  describe("Task Editing", () => {
    it("updates existing task successfully", async () => {
      const existingTask = {
        id: "task1",
        title: "Original Task",
        description: "Original description",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assigned_to: "user1",
        tags: ["tag1"],
        checklist: [],
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

      renderTaskForm({ taskId: "task1", submitLabel: "Actualizar" });

      await waitFor(() => {
        expect(screen.getByDisplayValue("Original Task")).toBeInTheDocument();
      });

      // Update title
      fireEvent.change(screen.getByLabelText(/título/i), {
        target: { value: "Updated Task" },
      });

      // Submit form
      const submitButton = screen.getByText(/actualizar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith("task1", {
          title: "Updated Task",
          description: "Original description",
          status: "todo",
          priority: "medium",
          assigned_to: "user1",
          tags: ["tag1"],
          checklist: [],
        });
      });
    });
  });

  describe("Form Interactions", () => {
    it("handles status selection", async () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderTaskForm();

      // Open status dropdown
      const statusSelect = screen.getByLabelText(/estado/i);
      fireEvent.click(statusSelect);

      // Select different status
      const inProgressOption = screen.getByText(/en progreso/i);
      fireEvent.click(inProgressOption);

      expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    });

    it("handles priority selection", async () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderTaskForm();

      // Open priority dropdown
      const prioritySelect = screen.getByLabelText(/prioridad/i);
      fireEvent.click(prioritySelect);

      // Select high priority
      const highPriorityOption = screen.getByText(/alta/i);
      fireEvent.click(highPriorityOption);

      expect(screen.getByText(/alta/i)).toBeInTheDocument();
    });

    it("handles user assignment", async () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderTaskForm();

      // Open assignee dropdown
      const assigneeSelect = screen.getByLabelText(/asignado a/i);
      fireEvent.click(assigneeSelect);

      // Select user
      const userOption = screen.getByText(/John Doe/i);
      fireEvent.click(userOption);

      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when task loading fails", () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Failed to load task"),
      });

      renderTaskForm({ taskId: "task1" });

      expect(screen.getByText(/failed to load task/i)).toBeInTheDocument();
    });

    it("displays error message when task creation fails", async () => {
      mockTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      mockCreateTask.mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error("Creation failed")),
        isPending: false,
      });

      renderTaskForm();

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "New Task" },
      });

      // Find submit button by type="submit" instead of name
      const submitButton = screen.getAllByRole('button')[1]; // Get second button (submit)
      expect(submitButton).toBeInTheDocument();
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/creation failed/i)).toBeInTheDocument();
      });
    });
  });
});
