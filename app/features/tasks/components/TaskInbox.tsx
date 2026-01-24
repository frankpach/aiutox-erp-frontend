/**
 * TaskInbox component
 * Specialized view for quick task capture and triage processing
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InboxIcon,
  PlusSignIcon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { useMyTasks, useCreateTask, useUpdateTask } from "../hooks/useTasks";
import { useAuthStore } from "~/stores/authStore";
import type { TaskCreate } from "../types/task.types";

interface TaskInboxProps {
  onTaskProcessed?: () => void;
}

export function TaskInbox({ onTaskProcessed }: TaskInboxProps) {
  const { t } = useTranslation();
  const { data: tasksData, refetch } = useMyTasks({ page_size: 50 });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const currentUser = useAuthStore((state) => state.user);

  const tasks = tasksData?.data || [];

  // Filter tasks that need triage (new tasks without proper classification)
  const tasksNeedingTriage = tasks.filter(
    (task) =>
      task.status === "todo" &&
      (!task.assigned_to_id || task.priority === "medium")
  );

  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Quick capture - parse text into task
  const handleQuickCapture = async () => {
    if (!quickCaptureText.trim()) return;

    try {
      const taskData: Partial<TaskCreate> = {
        title: quickCaptureText.trim(),
        status: "todo",
        priority: "medium",
        description: `Capturado desde Inbox: ${new Date().toLocaleString()}`,
      };

      await createTask.mutateAsync(taskData as TaskCreate);
      setQuickCaptureText("");
      void refetch();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Process selected tasks with bulk action
  const handleBulkAction = async () => {
    if (selectedTasks.length === 0 || !bulkAction) return;

    setIsProcessing(true);
    try {
      const promises = selectedTasks.map((taskId) => {
        const updateData: Record<string, unknown> = {};

        switch (bulkAction) {
          case "assign_me":
            // ✅ FIXED: Use current user ID
            updateData.assigned_to_id = currentUser?.id;
            break;
          case "priority_high":
            updateData.priority = "high";
            break;
          case "priority_low":
            updateData.priority = "low";
            break;
          case "priority_urgent":
            updateData.priority = "urgent";
            break;
          case "in_progress":
            updateData.status = "in_progress";
            break;
          case "done":
            updateData.status = "done";
            break;
          case "on_hold":
            updateData.status = "on_hold";
            break;
          case "cancelled":
            updateData.status = "cancelled";
            break;
          default:
            return Promise.resolve();
        }

        return updateTask.mutateAsync({ id: taskId, payload: updateData });
      });

      await Promise.all(promises);
      setSelectedTasks([]);
      setBulkAction("");
      void refetch();
      onTaskProcessed?.();
    } catch (error) {
      console.error("Error processing bulk action:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Select all tasks
  const selectAllTasks = () => {
    setSelectedTasks(tasksNeedingTriage.map((task) => task.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTasks([]);
  };

  return (
    <div className="space-y-4">
      {/* Quick Capture Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={InboxIcon} size={18} />
            {t("tasks.inbox.title") || "Captura Rápida"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex gap-2">
            <Input
              placeholder={
                t("tasks.inbox.placeholder") ||
                "Escribe una tarea rápida y presiona Enter..."
              }
              value={quickCaptureText}
              onChange={(e) => setQuickCaptureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleQuickCapture();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={() => void handleQuickCapture()}
              disabled={!quickCaptureText.trim() || createTask.isPending}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("tasks.inbox.description") ||
              "Captura ideas y tareas rápidamente. Usa Enter para crear, Shift+Enter para nueva línea."}
          </p>
        </CardContent>
      </Card>

      {/* Triage Section with Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Triage Card */}
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} />
                  {t("tasks.inbox.triage") || "Triage de Tareas"}
                  <Badge variant="secondary" className="text-xs">
                    {tasksNeedingTriage.length}{" "}
                    {t("tasks.inbox.pending") || "pendientes"}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  {selectedTasks.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        {t("common.clear") || "Limpiar"} ({selectedTasks.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={selectAllTasks}>
                        {t("common.selectAll") || "Seleccionar todas"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Bulk Actions */}
              {selectedTasks.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="text-sm font-medium">
                    {selectedTasks.length}{" "}
                    {t("tasks.inbox.selected") || "tareas seleccionadas"}:
                  </span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue
                        placeholder={
                          t("tasks.inbox.bulkAction") || "Acción masiva..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_me">
                        {t("tasks.inbox.assignMe") || "Asignarme"}
                      </SelectItem>
                      <SelectItem value="priority_high">
                        {t("tasks.priorities.high") || "Prioridad Alta"}
                      </SelectItem>
                      <SelectItem value="priority_urgent">
                        {t("tasks.priorities.urgent") || "Prioridad Urgente"}
                      </SelectItem>
                      <SelectItem value="priority_low">
                        {t("tasks.priorities.low") || "Prioridad Baja"}
                      </SelectItem>
                      <SelectItem value="in_progress">
                        {t("tasks.statuses.in_progress") || "En Progreso"}
                      </SelectItem>
                      <SelectItem value="done">
                        {t("tasks.statuses.done") || "Completada"}
                      </SelectItem>
                      <SelectItem value="on_hold">
                        {t("tasks.statuses.on_hold") || "En Pausa"}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("tasks.statuses.cancelled") || "Cancelada"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => void handleBulkAction()}
                    disabled={!bulkAction || isProcessing}
                  >
                    {isProcessing
                      ? t("common.processing") || "Procesando..."
                      : t("common.apply") || "Aplicar"}
                  </Button>
                </div>
              )}

              {/* Tasks List */}
              <div className="space-y-2">
                {tasksNeedingTriage.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HugeiconsIcon icon={CheckmarkBadge01Icon} size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{t("tasks.inbox.noTasks") || "No hay tareas pendientes de triage"}</p>
                  </div>
                ) : (
                  tasksNeedingTriage.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{task.status}</Badge>
                          <Badge variant="outline">{task.priority}</Badge>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full lg:w-72">
          <div className="space-y-3">
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold">
                  {tasksNeedingTriage.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("tasks.inbox.needingTriage") || "Pendientes de triage"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold">{selectedTasks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("tasks.inbox.selected") || "tareas seleccionadas"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold">
                  {tasks.filter((t) => t.status === "done").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("tasks.inbox.completedToday") || "Completadas hoy"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
