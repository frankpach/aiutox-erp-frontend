/**
 * TaskQuickAdd component
 * Quick task creation form for rapid task capture
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
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
  DialogTrigger,
} from "~/components/ui/dialog";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { X } from "lucide-react";
import { useCreateTask } from "../hooks/useTasks";
import { useUsers } from "~/features/users/hooks/useUsers";
import { createAssignment, createChecklistItem } from "../api/tasks.api";
import { useAuthStore } from "~/stores/authStore";
import { MultiSelect } from "~/components/ui/multi-select";
import type { TaskCreate, TaskStatus, TaskPriority } from "../types/task.types";

interface TaskQuickAddProps {
  onTaskCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskQuickAdd({
  onTaskCreated,
  open,
  onOpenChange,
}: TaskQuickAddProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const createTask = useCreateTask();
  const { user } = useAuthStore();
  const { users } = useUsers({ page_size: 100 }); // Obtener usuarios para el MultiSelect

  console.log("Users loaded in TaskQuickAdd:", users);
  console.log("Users count:", users?.length || 0);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const [formData, setFormData] = useState<Partial<TaskCreate>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    assigned_to_id: null,
  });

  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [checklistItems, setChecklistItems] = useState<
    { id: string; title: string }[]
  >([]);

  const handleAddChecklistItem = () => {
    setChecklistItems([
      ...checklistItems,
      { id: Date.now().toString(), title: "" },
    ]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
  };

  const handleChecklistItemChange = (id: string, title: string) => {
    setChecklistItems(
      checklistItems.map((item) => (item.id === id ? { ...item, title } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await createTask.mutateAsync(formData as TaskCreate);
      const taskId = response.data.id;

      // Crear asignaciones de usuarios si se seleccionaron
      if (assignedUserIds.length > 0 && user?.id) {
        await Promise.all(
          assignedUserIds.map((userId) =>
            createAssignment(taskId, {
              task_id: taskId,
              assigned_to_id: userId,
              created_by_id: user.id,
            })
          )
        );
      }

      // Crear items de checklist si se agregaron
      if (checklistItems.length > 0) {
        await Promise.all(
          checklistItems
            .filter((item) => item.title.trim() !== "")
            .map((item) =>
              createChecklistItem(taskId, {
                title: item.title,
                completed: false,
              })
            )
        );
      }

      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: "",
        assigned_to_id: null,
      });
      setAssignedUserIds([]);
      setChecklistItems([]);
      setOpen(false);
      onTaskCreated?.();
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  const isLoading = createTask.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
            {t("tasks.quickAdd")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("tasks.quickAdd")}</DialogTitle>
          <DialogDescription>
            {t("tasks.quickAddDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="quick-title"
              className="block text-sm font-medium mb-2"
            >
              {t("tasks.title")} *
            </label>
            <Input
              id="quick-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={t("tasks.quickAddPlaceholder")}
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="quick-description"
              className="block text-sm font-medium mb-2"
            >
              {t("tasks.description")}
            </label>
            <Textarea
              id="quick-description"
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
                htmlFor="quick-status"
                className="block text-sm font-medium mb-2"
              >
                {t("tasks.status.title")}
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as TaskStatus })
                }
              >
                <SelectTrigger id="quick-status">
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
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="quick-priority"
                className="block text-sm font-medium mb-2"
              >
                {t("tasks.priority.title")}
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as TaskPriority })
                }
              >
                <SelectTrigger id="quick-priority">
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
              htmlFor="quick-due-date"
              className="block text-sm font-medium mb-2"
            >
              {t("tasks.dueDate")}
            </label>
            <Input
              id="quick-due-date"
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

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("tasks.checklist.title")}
            </label>
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex gap-2">
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      handleChecklistItemChange(item.id, e.target.value)
                    }
                    placeholder="Item de checklist..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddChecklistItem}
                className="w-full"
              >
                + Agregar item
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.saving") : t("tasks.createTask")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
