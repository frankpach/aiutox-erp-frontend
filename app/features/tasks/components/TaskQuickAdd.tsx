/**
 * TaskQuickAdd component
 * Quick task creation form for rapid task capture
 */

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
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
import { useTags } from "~/features/tags/hooks/useTags";
import type { TaskCreate, TaskStatus, TaskPriority } from "../types/task.types";
import { cn } from "~/lib/utils";

interface TaskQuickAddProps {
  onTaskCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialDueDate?: Date | string | null;
  initialStartDate?: Date | string | null;
  initialEndDate?: Date | string | null;
  initialAllDay?: boolean;
  defaultMode?: TaskFormMode;
  onFormReset?: () => void;
}

export type TaskFormMode = "task" | "event";

const DATE_INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

const toDateTimeLocalValue = (value?: Date | string | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return format(date, DATE_INPUT_FORMAT);
};

const toUTCISOString = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

export function TaskQuickAdd({
  onTaskCreated,
  open,
  onOpenChange,
  initialDueDate,
  initialStartDate,
  initialEndDate,
  initialAllDay,
  defaultMode = "task",
  onFormReset,
}: TaskQuickAddProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const createTask = useCreateTask();
  const { user } = useAuthStore();
  const { users } = useUsers({ page_size: 100 }); // Obtener usuarios para el MultiSelect
  const { data: tagList = [] } = useTags();

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
    start_at: "",
    end_at: "",
    all_day: false,
    tag_ids: [],
    color_override: "",
    assigned_to_id: null,
  });

  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [checklistItems, setChecklistItems] = useState<
    { id: string; title: string }[]
  >([]);
  const [mode, setMode] = useState<TaskFormMode>(defaultMode);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !initialDueDate || mode !== "task") {
      return;
    }

    const date =
      typeof initialDueDate === "string"
        ? new Date(initialDueDate)
        : initialDueDate;

    if (Number.isNaN(date.getTime())) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      due_date: format(date, DATE_INPUT_FORMAT),
    }));
  }, [initialDueDate, isOpen, mode]);

  useEffect(() => {
    if (!isOpen || mode !== "event") {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      start_at: toDateTimeLocalValue(initialStartDate) || prev.start_at,
      end_at: toDateTimeLocalValue(initialEndDate) || prev.end_at,
      all_day: initialAllDay ?? prev.all_day ?? false,
    }));
  }, [initialStartDate, initialEndDate, initialAllDay, isOpen, mode]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setMode(defaultMode);
  }, [defaultMode, isOpen]);

  const resetFormState = () => {
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      start_at: "",
      end_at: "",
      all_day: false,
      tag_ids: [],
      color_override: "",
      assigned_to_id: null,
    });
    setAssignedUserIds([]);
    setChecklistItems([]);
    setMode(defaultMode);
    setFormError(null);
  };

  const handleClose = (openState: boolean) => {
    setOpen(openState);
    if (!openState) {
      resetFormState();
      onFormReset?.();
    }
  };

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
    setFormError(null);

    if (mode === "event") {
      if (!formData.start_at || !formData.end_at) {
        setFormError(
          t("tasks.errors.eventTimesRequired") ||
            "Debes indicar inicio y fin para un evento"
        );
        return;
      }
      if (new Date(formData.end_at) < new Date(formData.start_at)) {
        setFormError(
          t("tasks.errors.invalidEventRange") ||
            "La hora de fin debe ser posterior al inicio"
        );
        return;
      }
    }

    try {
      const basePayload: TaskCreate = {
        ...(formData as TaskCreate),
        color_override: formData.color_override || undefined,
        tag_ids: formData.tag_ids?.length ? formData.tag_ids : undefined,
      };

      const payload: TaskCreate =
        mode === "event"
          ? {
              ...basePayload,
              due_date: undefined,
              start_at: toUTCISOString(formData.start_at)!,
              end_at: toUTCISOString(formData.end_at)!,
              all_day: Boolean(formData.all_day),
            }
          : {
              ...basePayload,
              due_date: toUTCISOString(formData.due_date),
              start_at: undefined,
              end_at: undefined,
              all_day: false,
            };

      const response = await createTask.mutateAsync(payload);
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

      resetFormState();
      handleClose(false);
      onTaskCreated?.();
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  const isLoading = createTask.isPending;
  const isEventMode = mode === "event";

  const modeTabs = useMemo(
    () => [
      { key: "task" as TaskFormMode, label: t("tasks.type.task") || "Tarea" },
      {
        key: "event" as TaskFormMode,
        label: t("tasks.type.event") || "Evento",
      },
    ],
    [t]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("tasks.type.title") || "Tipo"}
            </Label>
            <div className="inline-flex rounded-xl bg-muted/60 p-1 text-sm font-medium">
              {modeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    if (mode === tab.key) return;
                    setMode(tab.key);
                    setFormError(null);
                    setFormData((prev) => ({
                      ...prev,
                      ...(tab.key === "task"
                        ? { start_at: "", end_at: "", all_day: false }
                        : { due_date: "" }),
                    }));
                  }}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1 transition",
                    mode === tab.key
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

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

          {isEventMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quick-all-day">
                  {t("calendar.events.allDay")}
                </Label>
                <Switch
                  id="quick-all-day"
                  checked={Boolean(formData.all_day)}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, all_day: checked })
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="quick-start-at"
                    className="block text-sm font-medium mb-2"
                  >
                    {t("calendar.labels.start")}
                  </label>
                  <Input
                    id="quick-start-at"
                    type="datetime-local"
                    value={formData.start_at ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, start_at: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="quick-end-at"
                    className="block text-sm font-medium mb-2"
                  >
                    {t("calendar.labels.end")}
                  </label>
                  <Input
                    id="quick-end-at"
                    type="datetime-local"
                    value={formData.end_at ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, end_at: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="quick-due-date"
                className="block text-sm font-medium mb-2"
              >
                {t("tasks.dueDate")}
              </label>
              <Input
                id="quick-due-date"
                type="datetime-local"
                value={formData.due_date ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
          )}

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

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("tags.title") || "Tags"}
              </label>
              <MultiSelect
                options={tagList.map((tag) => ({
                  value: tag.id,
                  label: tag.name,
                }))}
                selected={formData.tag_ids || []}
                onChange={(values) =>
                  setFormData({ ...formData, tag_ids: values })
                }
                placeholder={t("tags.select") || "Seleccionar tags"}
                label={t("tags.title") || "Tags"}
              />
            </div>

            <div>
              <label
                htmlFor="quick-color-override"
                className="block text-sm font-medium mb-2"
              >
                {t("tasks.colorOverride") || "Color override"}
              </label>
              <Input
                id="quick-color-override"
                type="color"
                value={formData.color_override || "#023E87"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    color_override: e.target.value,
                  })
                }
                className="h-10 w-20 p-1"
              />
            </div>
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

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
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
