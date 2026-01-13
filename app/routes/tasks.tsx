/**
 * Tasks page
 * Main page for tasks management
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsValue,
} from "~/components/ui/tabs";
import { TaskList } from "~/features/tasks/components/TaskList";
import { TaskForm } from "~/features/tasks/components/TaskForm";
import { TaskFilters } from "~/features/tasks/components/TaskFilters";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "~/features/tasks/hooks/useTasks";
import {
  Task,
  TaskStatus,
  TaskPriority,
} from "~/features/tasks/types/task.types";

export default function TasksPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("list");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: undefined,
    priority: undefined,
    assigned_to_id: undefined,
    search: "",
  });

  // Query hooks
  const {
    data: tasksData,
    loading,
    error,
    refetch,
  } = useTasks({
    ...filters,
    page: 1,
    page_size: 20,
  });

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const handleCreateTask = (data: any) => {
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateForm(false);
        refetch();
      },
    });
  };

  const handleUpdateTask = (data: any) => {
    if (!editingTask) return;

    updateTaskMutation.mutate(
      { id: editingTask.id, payload: data },
      {
        onSuccess: () => {
          setEditingTask(null);
          refetch();
        },
      }
    );
  };

  const handleDeleteTask = (task: Task) => {
    if (!confirm(t("tasks.deleteConfirm"))) return;

    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      assigned_to: undefined,
      search: "",
    });
    refetch();
  };

  const tasks = tasksData?.data || [];
  const total = tasksData?.total || 0;

  return (
    <PageLayout
      title={t("tasks.title")}
      description={t("tasks.description")}
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              {total} {t("tasks.tasks")}
            </Badge>
            <Button onClick={() => setShowCreateForm(true)}>
              {t("tasks.createTask")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          loading={loading}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">{t("tasks.list.title")}</TabsTrigger>
            <TabsTrigger value="form">{t("tasks.form.title")}</TabsTrigger>
            <TabsTrigger value="stats">{t("tasks.stats.title")}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <TaskList
              tasks={tasks}
              loading={loading}
              onRefresh={refetch}
              onTaskSelect={handleEditTask}
              onTaskEdit={handleUpdateTask}
              onTaskDelete={handleDeleteTask}
              onTaskComplete={(taskId, itemId) => {
                // Handle checklist item completion
              }}
            />
          </TabsContent>

          <TabsContent value="form" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <TaskForm
                task={editingTask}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingTask(null);
                }}
                loading={
                  createTaskMutation.isPending || updateTaskMutation.isPending
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("tasks.stats.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-center">
                      {total}
                    </div>
                    <div className="text-sm text-muted-foreground text-center">
                      {t("tasks.stats.total")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {t("tasks.stats.byStatus.title")}
                    </div>
                    <div className="space-y-2">
                      {Object.entries({
                        todo: tasks.filter((t) => t.status === "todo").length,
                        in_progress: tasks.filter(
                          (t) => t.status === "in_progress"
                        ).length,
                        done: tasks.filter((t) => t.status === "done").length,
                        cancelled: tasks.filter((t) => t.status === "cancelled")
                          .length,
                        on_hold: tasks.filter((t) => t.status === "on_hold")
                          .length,
                      }).map(([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">
                            {t(`tasks.status.${status}`)}
                          </span>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-sm font-medium">
                      {t("tasks.stats.byPriority.title")}
                    </div>
                    <div className="space-y-2">
                      {Object.entries({
                        low: tasks.filter((t) => t.priority === "low").length,
                        medium: tasks.filter((t) => t.priority === "medium")
                          .length,
                        high: tasks.filter((t) => t.priority === "high").length,
                        urgent: tasks.filter((t) => t.priority === "urgent")
                          .length,
                      }).map(([priority, count]) => (
                        <div
                          key={priority}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">
                            {t(`tasks.priority.${priority}`)}
                          </span>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
