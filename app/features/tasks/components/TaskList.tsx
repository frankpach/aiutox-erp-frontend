/**
 * TaskList component
 * Displays a list of tasks with filters and actions
 */

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DataTable } from "~/components/common/DataTable";
import { SearchBar } from "~/components/common/SearchBar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { TaskEdit } from "./TaskEdit";
import { TaskView } from "./TaskView";
import { useAuthStore } from "~/stores/authStore";
import { useTaskAssignments, useChecklistMutations } from "../hooks/useTasks";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskAssignment,
} from "~/features/tasks/types/task.types";

interface TaskListProps {
  tasks: Task[];
  assignments?: Record<string, TaskAssignment[]>; // taskId -> assignments
  loading?: boolean;
  onRefresh?: () => void;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskComplete?: (taskId: string, itemId: string) => void;
  onTaskCreate?: () => void;
  onFilterBySourceModule?: (sourceModule: string | null) => void;
  onFilterChange?: (filters: TaskFilters) => void;
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  sourceModule?: string;
  assignedToId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200",
  blocked: "bg-red-100 text-red-800 border-red-200",
  review: "bg-purple-100 text-purple-800 border-purple-200",
  done: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  high: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-purple-100 text-purple-800 border-purple-200",
};

export function TaskList({
  tasks,
  assignments,
  loading,
  onRefresh,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskComplete,
  onTaskCreate,
  onFilterBySourceModule,
  onFilterChange,
}: TaskListProps) {
  const { t, language } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);

  const dateLocale = language === "es" ? es : enUS;

  // Obtener asignaciones con nombres de usuarios
  const taskIds = tasks.map((task) => task.id);
  const { assignments: assignmentsWithUsers } = useTaskAssignments(taskIds);

  // Hook para mutaciones de checklist
  const { updateItem: updateChecklistItem } = useChecklistMutations();

  // Manejar cambio de estado de checklist item
  const handleChecklistItemChange = (
    taskId: string,
    itemId: string,
    completed: boolean
  ) => {
    updateChecklistItem.mutate({
      itemId,
      payload: { completed },
    });
  };

  const [filters, setFilters] = useState<TaskFilters>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Verificar si el usuario puede editar una tarea terminada
  const canEditCompletedTask = (task: Task): boolean => {
    if (!currentUser) return false;

    // Si no está terminada, se puede editar
    if (task.status !== "done" && task.status !== "cancelled") {
      return true;
    }

    // Si está terminada, solo el creador puede editar
    return task.created_by_id === currentUser.id;
  };

  const filteredTasks = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.sourceModule && task.source_module !== filters.sourceModule)
      return false;
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (
      filters.dueDateFrom &&
      task.due_date &&
      new Date(task.due_date) < new Date(filters.dueDateFrom)
    )
      return false;
    if (
      filters.dueDateTo &&
      task.due_date &&
      new Date(task.due_date) > new Date(filters.dueDateTo)
    )
      return false;
    return true;
  });

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  };

  const handleTaskUpdated = () => {
    setIsEditOpen(false);
    setEditingTask(null);
    onRefresh?.();
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
    setIsViewOpen(true);
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof TaskFilters] !== undefined &&
      filters[key as keyof TaskFilters] !== ""
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: dateLocale });
  };

  const getStatusBadge = (status: TaskStatus) => {
    return (
      <Badge variant="outline" className={statusColors[status]}>
        {t(`tasks.statuses.${status}` as any)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    return (
      <Badge variant="outline" className={priorityColors[priority]}>
        {t(`tasks.priorities.${priority}` as any)}
      </Badge>
    );
  };

  const _getAssignmentIndicator = (task: Task) => {
    const taskAssignments = assignments?.[task.id] || [];
    if (taskAssignments.length === 0) {
      return <span className="text-sm text-muted-foreground">-</span>;
    }

    return (
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="text-xs">
          {taskAssignments.length}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {taskAssignments.length > 1
            ? t("tasks.assigned.plural")
            : t("tasks.assigned.singular")}
        </span>
      </div>
    );
  };

  const _getSourceModuleBadge = (task: Task) => {
    if (!task.source_module) return null;

    const moduleColors: Record<string, string> = {
      projects: "bg-purple-100 text-purple-800 border-purple-200",
      workflows: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };

    return (
      <Badge
        variant="outline"
        className={
          moduleColors[task.source_module] || "bg-gray-100 text-gray-800"
        }
      >
        {task.source_module}
      </Badge>
    );
  };

  const columns = [
    {
      key: "title",
      header: t("tasks.title"),
      cell: (task: Task) => <div className="font-medium">{task.title}</div>,
    },
    {
      key: "status",
      header: t("tasks.status.title" as any),
      cell: (task: Task) => getStatusBadge(task.status),
    },
    {
      key: "priority",
      header: t("tasks.priority.title" as any),
      cell: (task: Task) => getPriorityBadge(task.priority),
    },
    {
      key: "assigned_to",
      header: t("tasks.assignedTo"),
      cell: (task: Task) => {
        const taskAssignments = assignmentsWithUsers[task.id] || [];

        if (taskAssignments.length === 0) {
          return <span className="text-sm">-</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {taskAssignments.map((assignment) => (
              <Badge
                key={assignment.id}
                variant="secondary"
                className="text-xs"
              >
                {assignment.userName}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: "due_date",
      header: t("tasks.dueDate"),
      cell: (task: Task) => (
        <span className="text-sm">
          {task.due_date ? formatDate(task.due_date) : "-"}
        </span>
      ),
    },
    {
      key: "checklist",
      header: t("tasks.checklist.title" as any),
      cell: (task: Task) => (
        <div className="space-y-2">
          {task.checklist?.map((item: any) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) =>
                  handleChecklistItemChange(task.id, item.id, !!checked)
                }
                disabled={task.status === "done" || task.status === "cancelled"}
              />
              <span
                className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {item.title}
              </span>
            </div>
          )) || (
            <span className="text-sm text-muted-foreground">
              {t("tasks.checklist.noItems")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      cell: (task: Task) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewTask(task)}
          >
            {t("common.view")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditTask(task)}
            disabled={task.status === "done" || task.status === "cancelled"}
          >
            <HugeiconsIcon icon={Edit01Icon} size={14} className="mr-1" />
            {t("common.edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTaskDelete?.(task)}
            disabled={task.status === "done" || task.status === "cancelled"}
            className="text-destructive hover:text-destructive"
          >
            {t("common.delete")}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary" />
            <span>{t("tasks.loading" as any)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">{t("tasks.noTasks")}</div>
          <Button onClick={onTaskCreate}>{t("tasks.createTask")}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {filteredTasks.length} {t("tasks.stats.total")}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onRefresh} disabled={loading}>
            {t("common.refresh" as any)}
          </Button>
          <Button onClick={onTaskCreate}>{t("tasks.createTask")}</Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="border-0 shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("tasks.advancedFilters")}</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t("tasks.clearFilters")}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>{t("tasks.status.title" as any)}</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange({
                    status: value === "all" ? undefined : (value as TaskStatus),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("tasks.filterAllStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("tasks.all")}</SelectItem>
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

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label>{t("tasks.priority.title" as any)}</Label>
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  handleFilterChange({
                    priority:
                      value === "all" ? undefined : (value as TaskPriority),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("tasks.filterAllPriorities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("tasks.all")}</SelectItem>
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

            {/* Source Module Filter */}
            <div className="space-y-2">
              <Label>{t("tasks.sourceModule")}</Label>
              <Select
                value={filters.sourceModule || "all"}
                onValueChange={(value) =>
                  handleFilterChange({
                    sourceModule: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("tasks.filterAllModules")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("tasks.all")}</SelectItem>
                  <SelectItem value="projects">
                    {t("tasks.modules.projects")}
                  </SelectItem>
                  <SelectItem value="workflows">
                    {t("tasks.modules.workflows")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date Range */}
            <div className="space-y-2">
              <Label>{t("tasks.dueDateRange")}</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dueDateFrom || ""}
                  onChange={(e) =>
                    handleFilterChange({ dueDateFrom: e.target.value })
                  }
                  placeholder={t("tasks.from")}
                />
                <Input
                  type="date"
                  value={filters.dueDateTo || ""}
                  onChange={(e) =>
                    handleFilterChange({ dueDateTo: e.target.value })
                  }
                  placeholder={t("tasks.to")}
                />
              </div>
            </div>

            {/* Assigned To Filter */}
            <div className="space-y-2 md:col-span-2">
              <Label>{t("tasks.assignedTo")}</Label>
              <Input
                value={filters.assignedToId || ""}
                onChange={(e) =>
                  handleFilterChange({ assignedToId: e.target.value })
                }
                placeholder={t("tasks.filterAssignedToPlaceholder")}
              />
            </div>
          </div>

          {/* Active Filters Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.status && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Estado: {t(`tasks.statuses.${filters.status}` as any)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => handleFilterChange({ status: undefined })}
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={12} />
                  </Button>
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Prioridad: {t(`tasks.priorities.${filters.priority}` as any)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => handleFilterChange({ priority: undefined })}
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={12} />
                  </Button>
                </Badge>
              )}
              {filters.sourceModule && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Módulo: {filters.sourceModule}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() =>
                      handleFilterChange({ sourceModule: undefined })
                    }
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={12} />
                  </Button>
                </Badge>
              )}
              {(filters.dueDateFrom || filters.dueDateTo) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Fechas: {filters.dueDateFrom || "..."} -{" "}
                  {filters.dueDateTo || "..."}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() =>
                      handleFilterChange({
                        dueDateFrom: undefined,
                        dueDateTo: undefined,
                      })
                    }
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={12} />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search bar */}
      <SearchBar
        placeholder={t("tasks.searchPlaceholder")}
        onChange={(value) => handleFilterChange({ search: value })}
      />

      {/* Tasks table */}
      <DataTable
        columns={columns}
        data={filteredTasks}
        pagination={{
          page: 1,
          pageSize: 20,
          total: filteredTasks.length,
          onPageChange: () => {
            // Handle pagination
          },
        }}
        inCard={false}
      />

      {/* Task Edit Modal */}
      <TaskEdit
        task={editingTask}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onTaskUpdated={handleTaskUpdated}
      />

      {/* Task View Modal */}
      <TaskView
        task={viewingTask}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
    </div>
  );
}
