/**
 * BoardViewWrapper component
 * Wrapper para BoardView que provee los statuses y handlers necesarios
 */

import { useMemo } from "react";
import { BoardView } from "./BoardView";
import { useUpdateTask } from "../hooks/useTasks";
import { showToast } from "~/components/common/Toast";
import type { Task } from "../types/task.types";

// Estados por defecto para el tablero
const defaultStatuses = [
  {
    id: "todo",
    name: "Por Hacer",
    type: "open" as const,
    color: "#6b7280",
    order: 0,
  },
  {
    id: "in_progress",
    name: "En Progreso",
    type: "in_progress" as const,
    color: "#3b82f6",
    order: 1,
  },
  {
    id: "review",
    name: "En Revisión",
    type: "in_progress" as const,
    color: "#8b5cf6",
    order: 2,
  },
  {
    id: "done",
    name: "Hecho",
    type: "closed" as const,
    color: "#22c55e",
    order: 3,
  },
  {
    id: "on_hold",
    name: "En Espera",
    type: "in_progress" as const,
    color: "#f59e0b",
    order: 4,
  },
  {
    id: "cancelled",
    name: "Cancelado",
    type: "closed" as const,
    color: "#ef4444",
    order: 5,
  },
];

interface BoardViewWrapperProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick?: (task: Task) => void;
  onRefresh?: () => void;
}

export function BoardViewWrapper({
  tasks,
  loading = false,
  onTaskClick,
  onRefresh,
}: BoardViewWrapperProps) {
  const updateTaskMutation = useUpdateTask();

  // Preparar tareas con status_id mapeado desde status
  const preparedTasks = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      // Asegurar que cada tarea tenga status_id
      status_id: task.status_id || task.status || "todo",
      // Asegurar board_order
      board_order: task.board_order ?? 0,
    }));
  }, [tasks]);

  // Handler para movimiento de tareas con actualización a DB
  const handleTaskMove = (
    taskId: string,
    newStatusId: string,
    newOrder: number
  ) => {
    // Validar que newStatusId es un TaskStatus válido
    const validStatuses = [
      "todo",
      "in_progress",
      "on_hold",
      "blocked",
      "review",
      "done",
      "cancelled",
    ];
    if (!validStatuses.includes(newStatusId)) {
      console.error("Invalid status:", newStatusId);
      showToast("Estado inválido", "error");
      return;
    }

    // Actualizar tarea en la base de datos
    updateTaskMutation.mutate(
      {
        id: taskId,
        payload: {
          status: newStatusId as Task["status"], // Cast a TaskStatus
          status_id: newStatusId,
          board_order: newOrder,
        },
      },
      {
        onSuccess: () => {
          showToast("Tarea movida exitosamente", "success");
          // Refrescar lista de tareas
          if (onRefresh) {
            onRefresh();
          }
        },
        onError: (error) => {
          console.error("Error moving task:", error);
          showToast("Error al mover la tarea", "error");
        },
      }
    );
  };

  // Handler para creación de tareas
  const handleCreateTask = (statusId: string) => {
    // TODO: Implementar creación de tarea con estado preseleccionado
    // Por ahora, este handler está preparado para futuras implementaciones
    showToast(`Crear tarea en estado: ${statusId}`, "info");
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tablero</h3>
        <div className="text-sm text-muted-foreground">
          Drag & drop para mover tareas entre estados
        </div>
      </div>

      <div className="h-[600px]">
        <BoardView
          tasks={preparedTasks}
          statuses={defaultStatuses}
          onTaskClick={onTaskClick}
          onTaskMove={handleTaskMove}
          onCreateTask={handleCreateTask}
          loading={loading}
        />
      </div>
    </div>
  );
}
