/**
 * TaskEdit component
 * Task editing form for updating existing tasks
 */

import { useState, useEffect } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useUpdateTask } from "../hooks/useTasks";
import { useUsers } from "~/features/users/hooks/useUsers";
import { useAuthStore } from "~/stores/authStore";
import {
  createAssignment,
  deleteAssignment,
  listAssignments,
} from "../api/tasks.api";
import { MultiSelect } from "~/components/ui/multi-select";
import type {
  Task,
  TaskUpdate,
  TaskStatus,
  TaskPriority,
} from "../types/task.types";

interface TaskEditProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
}

export function TaskEdit({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
}: TaskEditProps) {
  const { t } = useTranslation();
  const updateTask = useUpdateTask();
  const { users } = useUsers({ page_size: 100 });
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<Partial<TaskUpdate>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    assigned_to_id: null,
  });

  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [assignedGroupIds, setAssignedGroupIds] = useState<string[]>([]);

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || "",
        assigned_to_id: task.assigned_to_id,
      });

      // Cargar asignaciones existentes
      loadExistingAssignments(task.id);
    }
  }, [task]);

  const loadExistingAssignments = async (taskId: string) => {
    try {
      const response = await listAssignments(taskId);
      const userIds = response.data
        .filter((a) => a.assigned_to_id)
        .map((a) => a.assigned_to_id!);
      const groupIds = response.data
        .filter((a) => a.assigned_to_group_id)
        .map((a) => a.assigned_to_group_id!);

      setAssignedUserIds(userIds);
      setAssignedGroupIds(groupIds);
    } catch (error) {
      console.error("Error al cargar asignaciones:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task) return;

    try {
      await updateTask.mutateAsync({
        id: task.id,
        payload: formData as TaskUpdate,
      });

      // Sincronizar asignaciones de usuarios
      const existingAssignments = await listAssignments(task.id);
      const existingUserIds = existingAssignments.data
        .filter((a) => a.assigned_to_id)
        .map((a) => a.assigned_to_id!);
      const existingGroupIds = existingAssignments.data
        .filter((a) => a.assigned_to_group_id)
        .map((a) => a.assigned_to_group_id!);

      // Eliminar asignaciones que ya no están seleccionadas
      for (const assignment of existingAssignments.data) {
        if (
          assignment.assigned_to_id &&
          !assignedUserIds.includes(assignment.assigned_to_id)
        ) {
          await deleteAssignment(task.id, assignment.id);
        }
        if (
          assignment.assigned_to_group_id &&
          !assignedGroupIds.includes(assignment.assigned_to_group_id)
        ) {
          await deleteAssignment(task.id, assignment.id);
        }
      }

      // Crear nuevas asignaciones de usuarios
      for (const userId of assignedUserIds) {
        if (!existingUserIds.includes(userId)) {
          await createAssignment(task.id, {
            task_id: task.id,
            assigned_to_id: userId,
            created_by_id: user?.id || "",
          });
        }
      }

      // Crear nuevas asignaciones de grupos
      for (const groupId of assignedGroupIds) {
        if (!existingGroupIds.includes(groupId)) {
          await createAssignment(task.id, {
            task_id: task.id,
            assigned_to_group_id: groupId,
            created_by_id: user?.id || "",
          });
        }
      }

      onOpenChange(false);
      onTaskUpdated?.();
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const isLoading = updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Edit01Icon} size={20} />
            {t("tasks.editTask")}
          </DialogTitle>
          <DialogDescription>
            {t("tasks.editTaskDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium mb-2"
            >
              {t("tasks.title")} *
            </label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={t("tasks.titlePlaceholder")}
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium mb-2"
            >
              {t("tasks.description")}
            </label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t("tasks.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-status"
                className="block text-sm font-medium mb-2"
              >
                {t("tasks.status.title" as any)}
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as TaskStatus })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    {t("tasks.statuses.todo")}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {t("tasks.statuses.inProgress")}
                  </SelectItem>
                  <SelectItem value="done">
                    {t("tasks.statuses.done")}
                  </SelectItem>
                  <SelectItem value="on_hold">
                    {t("tasks.statuses.onHold")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("tasks.statuses.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="edit-priority"
                className="block text-sm font-medium mb-2"
              >
                {t("tasks.priority.title" as any)}
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as TaskPriority })
                }
              >
                <SelectTrigger id="edit-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    {t("tasks.priorities.low")}
                  </SelectItem>
                  <SelectItem value="medium">
                    {t("tasks.priorities.medium")}
                  </SelectItem>
                  <SelectItem value="high">
                    {t("tasks.priorities.high")}
                  </SelectItem>
                  <SelectItem value="urgent">
                    {t("tasks.priorities.urgent")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-due-date"
              className="block text-sm font-medium mb-2"
            >
              {t("tasks.dueDate")}
            </label>
            <Input
              id="edit-due-date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("tasks.assignedTo")}
            </label>
            <MultiSelect
              options={users.map((u) => ({
                value: u.id,
                label: `${u.first_name} ${u.last_name}`.trim() || u.email,
              }))}
              selected={assignedUserIds}
              onChange={setAssignedUserIds}
              placeholder="Seleccionar responsables..."
              label="Asignar responsables"
            />
          </div>

          {/* Placeholder para asignaciones a grupos - futuro cuando exista módulo Groups */}
          <div className="opacity-60">
            <label className="block text-sm font-medium mb-2">
              Asignar a Grupos (Próximamente)
            </label>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <p>
                Las asignaciones a grupos estarán disponibles cuando el módulo
                Groups esté implementado.
              </p>
              <p className="text-xs mt-1">
                Esta característica permitirá asignar tareas a equipos
                completos.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.saving") : t("tasks.updateTask")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
