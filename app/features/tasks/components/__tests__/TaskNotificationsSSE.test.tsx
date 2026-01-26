import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TaskNotificationsSSE } from "~/features/tasks/components/TaskNotificationsSSE";

const { showToastMock, lastOnEventRef } = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  lastOnEventRef: {
    current: null as ((event: { type: string; data: Record<string, any> }) => void) | null,
  },
}));

vi.mock("~/components/common/Toast", () => ({
  showToast: showToastMock,
}));

vi.mock("~/hooks/useSSE", () => ({
  useSSE: ({ onEvent }: { onEvent?: (event: any) => void }) => {
    if (onEvent) {
      lastOnEventRef.current = onEvent;
    }
    return { isConnected: true };
  },
}));

vi.mock("date-fns", () => ({
  formatDistanceToNow: () => "hace 1 min",
}));

describe("TaskNotificationsSSE", () => {
  beforeEach(() => {
    showToastMock.mockReset();
    lastOnEventRef.current = null;
  });

  it("shows connected indicator when SSE is connected", () => {
    const { container } = render(<TaskNotificationsSSE />);
    expect(container.querySelector(".bg-green-500")).toBeTruthy();
  });

  it("increments unread count and shows notification on task event", async () => {
    render(<TaskNotificationsSSE />);

    if (lastOnEventRef.current) {
      act(() => {
        lastOnEventRef.current?.({
          type: "task.created",
          data: { title: "Tarea de prueba" },
        });
      });
    }

    const trigger = screen.getAllByRole("button")[0];
    act(() => {
      fireEvent.click(trigger);
    });

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("Tarea Creada")).toBeInTheDocument();
      expect(screen.getByText("Nueva tarea: Tarea de prueba")).toBeInTheDocument();
    });
  });

  it("marks all notifications as read", async () => {
    render(<TaskNotificationsSSE />);

    if (lastOnEventRef.current) {
      act(() => {
        lastOnEventRef.current?.({
          type: "task.overdue",
          data: { title: "Tarea vencida" },
        });
      });
    }

    const trigger = screen.getAllByRole("button")[0];
    act(() => {
      fireEvent.click(trigger);
    });

    const markAll = await screen.findByText("Marcar todas");
    act(() => {
      fireEvent.click(markAll);
    });

    await waitFor(() => {
      expect(screen.getByText("Todo leído")).toBeInTheDocument();
    });
  });

  it("clears all notifications", async () => {
    render(<TaskNotificationsSSE />);

    if (lastOnEventRef.current) {
      act(() => {
        lastOnEventRef.current?.({
          type: "task.assigned",
          data: { title: "Asignada" },
        });
      });
    }

    const trigger = screen.getAllByRole("button")[0];
    act(() => {
      fireEvent.click(trigger);
    });

    const clearButton = await screen.findByText("Limpiar");
    act(() => {
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(screen.getByText("No hay notificaciones")).toBeInTheDocument();
    });
  });
});
