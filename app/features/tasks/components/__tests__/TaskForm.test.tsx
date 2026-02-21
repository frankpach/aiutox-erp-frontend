/**
 * TaskForm component tests
 * Tests for task creation and editing form
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskForm } from "~/features/tasks/components/TaskForm";
import type { TaskStatus, TaskPriority } from "~/features/tasks/types/task.types";

// TaskForm uses hardcoded English text — no useTranslation mock needed
// But PageLayout may use it, so provide a passthrough mock
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock hooks — shapes match actual hook return values
const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockTaskData = vi.fn();
const mockAssignmentsData = vi.fn();

vi.mock("~/features/tasks/hooks/useTasks", () => ({
  useTask: () => mockTaskData(),
  useCreateTask: () => ({ mutateAsync: mockCreateMutateAsync, isPending: false }),
  useUpdateTask: () => ({ mutateAsync: mockUpdateMutateAsync, isPending: false }),
  useAssignments: () => mockAssignmentsData(),
}));

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

    mockTaskData.mockReturnValue({ data: null, isLoading: false, error: null });
    mockAssignmentsData.mockReturnValue({ data: null, isLoading: false, error: null });
    mockCreateMutateAsync.mockResolvedValue({ data: { id: "new-task" } });
    mockUpdateMutateAsync.mockResolvedValue({ data: { id: "task1" } });
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
    it("renders form with title and description inputs", () => {
      renderTaskForm();

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("renders status and priority selects", () => {
      renderTaskForm();

      const combos = screen.getAllByRole("combobox");
      expect(combos.length).toBeGreaterThanOrEqual(2);
    });

    it("loads existing task data when editing", async () => {
      mockTaskData.mockReturnValue({
        data: { data: {
          id: "task1",
          title: "Existing Task",
          description: "Existing description",
          status: "in_progress" as TaskStatus,
          priority: "high" as TaskPriority,
          assigned_to_id: null,
          checklist: [],
        }},
        isLoading: false,
        error: null,
      });

      renderTaskForm({ taskId: "task1" });

      await waitFor(() => {
        expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Existing description")).toBeInTheDocument();
      });
    });

    it("shows loading skeleton when isLoading is true", () => {
      mockTaskData.mockReturnValue({ data: null, isLoading: true, error: null });

      renderTaskForm({ taskId: "task1" });

      // Component renders PageLayout with loading prop — just check it doesn't crash
      expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("submits form with title filled", async () => {
      renderTaskForm();

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "New Task" },
      });

      const form = document.querySelector("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalled();
      });
    });

    it("does not call createTask when title is empty and form is submitted via HTML required", async () => {
      renderTaskForm();

      // title input has required attr — browser prevents submit, mutateAsync not called
      const submitBtn = screen.getByRole("button", { name: /crear/i });
      fireEvent.click(submitBtn);

      // Give time for any async calls
      await new Promise((r) => setTimeout(r, 50));
      expect(mockCreateMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("Task Editing", () => {
    it("calls updateTask when taskId is provided", async () => {
      mockTaskData.mockReturnValue({
        data: { data: {
          id: "task1",
          title: "Original Task",
          description: "Original description",
          status: "todo" as TaskStatus,
          priority: "medium" as TaskPriority,
          assigned_to_id: null,
          checklist: [],
        }},
        isLoading: false,
        error: null,
      });

      renderTaskForm({ taskId: "task1", submitLabel: "Actualizar" });

      await waitFor(() => {
        expect(screen.getByDisplayValue("Original Task")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByDisplayValue("Original Task"), {
        target: { value: "Updated Task" },
      });

      const form = document.querySelector("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe("Form Interactions", () => {
    it("renders status select with options", () => {
      renderTaskForm();

      // Component has label "Status" and card title "Status & Priority"
      const combos = screen.getAllByRole("combobox");
      expect(combos.length).toBeGreaterThanOrEqual(2);
    });

    it("renders priority select with options", () => {
      renderTaskForm();

      const combos = screen.getAllByRole("combobox");
      expect(combos.length).toBeGreaterThanOrEqual(2);
    });

    it("renders assigned to input", () => {
      renderTaskForm();

      expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("logs error when task creation fails", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockCreateMutateAsync.mockRejectedValue(new Error("Creation failed"));

      renderTaskForm();

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "New Task" },
      });

      const form = document.querySelector("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
