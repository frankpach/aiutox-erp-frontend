/**
 * Tasks page
 * Main page for tasks management
 */

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PageLayout } from "~/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TaskAdvancedFilter } from "~/features/tasks/components/TaskList";
import { TaskCalendar } from "~/features/tasks/components/TaskCalendar";
import { TaskInbox } from "~/features/tasks/components/TaskInbox";
import { TaskQuickAdd } from "~/features/tasks/components/TaskQuickAdd";
import { TaskEdit } from "~/features/tasks/components/TaskEdit";
import { BoardViewWrapper } from "~/features/tasks/components/BoardViewWrapper";
import { showToast } from "~/components/common/Toast";
import {
  useMyTasks,
  useUpdateTask,
  useDeleteTask,
  useTaskModuleSettings,
} from "~/features/tasks/hooks/useTasks";
import type { Task } from "~/features/tasks/types/task.types";

export default function TasksPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("list");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { data: settingsData } = useTaskModuleSettings();
  const settings = settingsData?.data;

  const tabs = useMemo(
    () => [
      {
        value: "inbox",
        label: t("tasks.tabs.inbox") || "Inbox",
        enabled: settings?.inbox_enabled ?? true,
      },
      {
        value: "list",
        label: t("tasks.tabs.list"),
        enabled: settings?.list_enabled ?? true,
      },
      {
        value: "board-pro",
        label: t("tasks.tabs.taskBoard"),
        enabled: settings?.board_enabled ?? true,
      },
      {
        value: "calendar",
        label: t("tasks.tabs.calendar"),
        enabled: settings?.calendar_enabled ?? true,
      },
            {
        value: "stats",
        label: t("tasks.tabs.stats"),
        enabled: settings?.stats_enabled ?? true,
      },
    ],
    [settings, t]
  );

  const enabledTabs = useMemo(() => tabs.filter((tab) => tab.enabled), [tabs]);

  useEffect(() => {
    if (!enabledTabs.length) {
      return;
    }

    const isActiveEnabled = enabledTabs.some((tab) => tab.value === activeTab);
    if (!isActiveEnabled) {
      setActiveTab(enabledTabs[0]?.value ?? "list");
    }
  }, [activeTab, enabledTabs]);

  // Query hooks
  const {
    data: tasksData,
    isLoading: loading,
    error,
    refetch,
  } = useMyTasks({
    page: 1,
    page_size: 20,
  });

  // @ts-expect-error - Will be used when task editing is implemented
  const _updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = (task: Task) => {
    if (window.confirm(t("tasks.deleteConfirm"))) {
      deleteTaskMutation.mutate(task.id, {
        onSuccess: () => {
          showToast(t("tasks.deleteSuccess"), "success");
          void refetch();
        },
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const tasks = tasksData?.data || [];
  const total = tasksData?.meta?.total || tasks.length;

  return (
    <ProtectedRoute>
      <PageLayout
        title={t("tasks.title")}
        description={t("tasks.description")}
        loading={loading}
        error={error}
      >
        <div className="space-y-6">
          {/* TaskQuickAdd Modal */}
          <TaskQuickAdd
            open={isQuickAddOpen}
            onOpenChange={setIsQuickAddOpen}
            defaultMode="task"
            onTaskCreated={() => {
              setIsQuickAddOpen(false);
              void refetch();
            }}
          />

          <TaskEdit
            task={editingTask}
            open={Boolean(editingTask)}
            onOpenChange={(open) => {
              if (!open) {
                setEditingTask(null);
              }
            }}
            onTaskUpdated={() => {
              // No cerrar el modal automáticamente, solo refrescar los datos
              void refetch();
            }}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="grid w-full"
              style={{
                gridTemplateColumns: `repeat(${Math.max(
                  enabledTabs.length,
                  1
                )}, minmax(0, 1fr))`,
              }}
            >
              {enabledTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {settings?.inbox_enabled !== false && (
              <TabsContent value="inbox" className="mt-6">
                {/* Task Inbox */}
                <CardContent className="space-y-4">
                  <TaskInbox onTaskProcessed={() => void refetch()} />
                </CardContent>
              </TabsContent>
            )}

            {settings?.list_enabled !== false && (
              <TabsContent value="list" className="mt-6">
                {/* Task List */}
                <CardContent className="space-y-4">
                  <TaskAdvancedFilter
                    tasks={tasks}
                    loading={loading}
                    onRefresh={() => void refetch()}
                    onTaskDelete={handleDeleteTask}
                    onTaskCreate={() => setIsQuickAddOpen(true)}
                  />
                </CardContent>
              </TabsContent>
            )}

            {settings?.board_enabled !== false && (
              <TabsContent value="board-pro" className="mt-6">
                {/* Board Pro - Advanced Kanban */}
                <CardContent className="space-y-4">
                  <BoardViewWrapper
                    tasks={tasks}
                    loading={loading}
                    onTaskClick={handleEditTask}
                    onRefresh={() => void refetch()}
                  />
                </CardContent>
              </TabsContent>
            )}

            {settings?.calendar_enabled !== false && (
              <TabsContent value="calendar" className="mt-6">
                {/* Task Calendar */}
                <CardContent className="space-y-4">
                  <TaskCalendar
                    tasks={tasks}
                    loading={loading}
                    onRefresh={() => void refetch()}
                    onTaskClick={handleEditTask}
                    onTaskCreate={() => setIsQuickAddOpen(true)}
                  />
                </CardContent>
              </TabsContent>
            )}

            
            {settings?.stats_enabled !== false && (
              <TabsContent value="stats" className="mt-6">
                <Card className="bg-linear-to-br from-primary/5 via-card to-secondary/5 border-primary/20">
                  <CardHeader className="bg-linear-to-r from-primary/10 to-secondary/10 border-b border-primary/10 p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="h-4 w-4 rounded-full bg-linear-to-r from-primary to-secondary" />
                      {t("tasks.stats.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg" />
                          <div className="relative bg-linear-to-r from-primary to-secondary text-transparent bg-clip-text text-3xl font-bold text-center">
                            {total}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-center text-foreground/80">
                          {t("tasks.stats.total")}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {t("tasks.stats.byStatus.title")}
                        </div>
                        <div className="space-y-2">
                          {Object.entries({
                            todo: tasks.filter((t) => t.status === "todo")
                              .length,
                            in_progress: tasks.filter(
                              (t) => t.status === "in_progress"
                            ).length,
                            done: tasks.filter((t) => t.status === "done")
                              .length,
                            cancelled: tasks.filter(
                              (t) => t.status === "cancelled"
                            ).length,
                            on_hold: tasks.filter((t) => t.status === "on_hold")
                              .length,
                          }).map(([status, count]) => {
                            const statusColors = {
                              todo: "bg-gray-500/10 text-gray-700 border-gray-500/20",
                              in_progress: "bg-blue-500/10 text-blue-700 border-blue-500/20",
                              done: "bg-green-500/10 text-green-700 border-green-500/20",
                              cancelled: "bg-red-500/10 text-red-700 border-red-500/20",
                              on_hold: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
                            };
                            return (
                              <div
                                key={status}
                                className="flex justify-between items-center p-1.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <Badge variant="outline" className={`text-xs ${statusColors[status as keyof typeof statusColors]}`}>
                                  {t(`tasks.statuses.${status}`)}
                                </Badge>
                                <span className="text-lg font-bold text-foreground">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          {t("tasks.stats.byPriority.title")}
                        </div>
                        <div className="space-y-2">
                          {Object.entries({
                            low: tasks.filter((t) => t.priority === "low")
                              .length,
                            medium: tasks.filter((t) => t.priority === "medium")
                              .length,
                            high: tasks.filter((t) => t.priority === "high")
                              .length,
                            urgent: tasks.filter((t) => t.priority === "urgent")
                              .length,
                          }).map(([priority, count]) => {
                            const priorityColors = {
                              low: "bg-green-500/10 text-green-700 border-green-500/20",
                              medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
                              high: "bg-orange-500/10 text-orange-700 border-orange-500/20",
                              urgent: "bg-red-500/10 text-red-700 border-red-500/20",
                            };
                            return (
                              <div
                                key={priority}
                                className="flex justify-between items-center p-1.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <Badge variant="outline" className={`text-xs ${priorityColors[priority as keyof typeof priorityColors]}`}>
                                  {t(`tasks.priorities.${priority}`)}
                                </Badge>
                                <span className="text-lg font-bold text-foreground">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
