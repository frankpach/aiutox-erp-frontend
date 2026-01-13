/**
 * TaskList component
 * Displays a list of tasks with filters and actions
 */

import { useState } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTable } from "~/components/common/DataTable";
import { SearchBar } from "~/components/common/SearchBar";
import {
  Task,
  TaskStatus,
  TaskPriority,
  ChecklistItem,
} from "~/features/tasks/types/task.types";

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onRefresh?: () => void;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskComplete?: (taskId: string, itemId: string) => void;
  onTaskCreate?: () => void;
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  high: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-purple-100 text-purple-800 border-purple-200",
};

export function TaskList({
  tasks,
  loading,
  onRefresh,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskComplete,
  onTaskCreate,
}: TaskListProps) {
  const { t } = useTranslation();
  const dateLocale = t("common.locale") === "es" ? es : en;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: dateLocale });
  };

  const getStatusBadge = (status: TaskStatus) => {
    return (
      <Badge variant="outline" className={statusColors[status]}>
        {t(`tasks.status.${status}`)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    return (
      <Badge variant="outline" className={priorityColors[priority]}>
        {t(`tasks.priority.${priority}`)}
      </Badge>
    );
  };

  const columns = [
    {
      key: "title",
      header: t("tasks.title"),
      cell: (task) => <div className="font-medium">{task.title}</div>,
    },
    {
      key: "status",
      header: t("tasks.status.title"),
      cell: (task) => getStatusBadge(task.status),
    },
    {
      key: "priority",
      header: t("tasks.priority.title"),
      cell: (task) => getPriorityBadge(task.priority),
    },
    {
      key: "assigned_to",
      header: t("tasks.assignedTo"),
      cell: (task) => (
        <span className="text-sm">{task.assigned_to_id || "-"}</span>
      ),
    },
    {
      key: "due_date",
      header: t("tasks.dueDate"),
      cell: (task) => (
        <span className="text-sm">
          {task.due_date ? formatDate(task.due_date) : "-"}
        </span>
      ),
    },
    {
      key: "checklist",
      header: t("tasks.checklist.title"),
      cell: (task) => (
        <div className="space-y-2">
          {task.checklist.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) =>
                  onTaskComplete?.(task.id, item.id)
                }
                disabled={task.status === "done" || task.status === "cancelled"}
              />
              <span
                className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      cell: (task) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTaskSelect?.(task)}
          >
            {t("common.view")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTaskEdit?.(task)}
            disabled={task.status === "done" || task.status === "cancelled"}
          >
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
            <span>{t("tasks.loading")}</span>
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
        <h2 className="text-2xl font-bold">{t("tasks.title")}</h2>
        <div className="flex space-x-2">
          <Button onClick={onRefresh} disabled={loading}>
            {t("common.refresh")}
          </Button>
          <Button onClick={onTaskCreate}>{t("tasks.createTask")}</Button>
        </div>
      </div>

      {/* Search bar */}
      <SearchBar
        placeholder={t("tasks.search.placeholder")}
        onChange={(value) => {
          // Handle search
        }}
      />

      {/* Tasks table */}
      <DataTable
        columns={columns}
        data={tasks}
        pagination={{
          page: 1,
          pageSize: 20,
          total: tasks.length,
          onPageChange: () => {
            // Handle pagination
          },
        }}
      />
    </div>
  );
}
