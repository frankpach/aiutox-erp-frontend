/**
 * TaskBoard component
 * Kanban board for tasks organized by status
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { TaskQuickAdd } from "./TaskQuickAdd";
import type { Task, TaskStatus } from "../types/task.types";

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskCreate?: () => void;
  loading?: boolean;
}

const statusOrder: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
  "on_hold",
  "cancelled",
];

export function TaskBoard({
  tasks,
  onTaskClick,
  onTaskCreate,
  loading,
}: TaskBoardProps) {
  const { t } = useTranslation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const statusColors: Record<TaskStatus, string> = {
    todo: "bg-gray-100 text-gray-800 border-gray-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    done: "bg-green-100 text-green-800 border-green-200",
    on_hold: "bg-orange-100 text-orange-800 border-orange-200",
    cancelled: "bg-gray-300 text-gray-800 border-gray-400",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t("locale") === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      // TODO: Implement status update via mutation
      console.error(`Move task ${draggedTask.id} to ${status}`);
    }
    setDraggedTask(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Tablero de Tareas</h2>
        <Button onClick={() => setIsQuickAddOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
          Crear Tarea
        </Button>
      </div>

      {/* TaskQuickAdd Modal */}
      <TaskQuickAdd
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onTaskCreated={() => {
          setIsQuickAddOpen(false);
          onTaskCreate?.();
        }}
      />

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full">
          {statusOrder.map((status) => {
            const statusTasks = getTasksByStatus(status);
            return (
              <div
                key={status}
                className="w-80 flex-shrink-0 bg-muted/30 rounded-lg p-4"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[status]}>
                      {t(`tasks.statuses.${status}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {statusTasks.length}
                    </span>
                  </div>
                </div>

                <div
                  className="space-y-3 overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 250px)" }}
                >
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-32 bg-muted rounded animate-pulse"
                        />
                      ))}
                    </div>
                  ) : statusTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Sin tareas</p>
                    </div>
                  ) : (
                    statusTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        onClick={() => onTaskClick?.(task)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm font-medium line-clamp-2">
                              {task.title}
                            </CardTitle>
                            <Badge
                              variant="secondary"
                              className={priorityColors[task.priority]}
                            >
                              {t(`tasks.priorities.${task.priority}`)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {task.due_date && (
                              <span>{formatDate(task.due_date)}</span>
                            )}
                            {task.checklist && task.checklist.length > 0 && (
                              <span>
                                {
                                  task.checklist.filter((c) => c.completed)
                                    .length
                                }
                                /{task.checklist.length}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
