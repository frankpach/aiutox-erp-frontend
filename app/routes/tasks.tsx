/**
 * Tasks page
 * Main page for tasks management
 */

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PageLayout } from "~/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TaskList } from "~/features/tasks/components/TaskList";
import { TaskCalendar } from "~/features/tasks/components/TaskCalendar";
import { TaskInbox } from "~/features/tasks/components/TaskInbox";
import { TaskQuickAdd } from "~/features/tasks/components/TaskQuickAdd";
import { TaskEdit } from "~/features/tasks/components/TaskEdit";
import { TaskAgendaView } from "~/features/tasks/components/TaskAgendaView";
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
        value: "agenda",
        label: t("tasks.tabs.agenda") || "Agenda",
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

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const handleUpdateTask = (data: Partial<Task>) => {
    if (!editingTask) return;

    updateTaskMutation.mutate(
      { id: editingTask.id, payload: data },
      {
        onSuccess: () => {
          setEditingTask(null);
          void refetch();
        },
      }
    );
  };

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
              setEditingTask(null);
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
                  <TaskList
                    tasks={tasks}
                    loading={loading}
                    onRefresh={() => void refetch()}
                    onTaskSelect={handleEditTask}
                    onTaskEdit={handleUpdateTask}
                    onTaskDelete={handleDeleteTask}
                    onTaskCreate={() => setIsQuickAddOpen(true)}
                    onTaskComplete={(_taskId, _itemId) => {
                      // Handle checklist item completion
                    }}
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

            {settings?.calendar_enabled !== false && (
              <TabsContent value="agenda" className="mt-6">
                {/* Task Agenda */}
                <CardContent className="space-y-4">
                  <TaskAgendaView
                    tasks={tasks}
                    loading={loading}
                    onTaskClick={handleEditTask}
                    _onTaskCreate={() => setIsQuickAddOpen(true)}
                  />
                </CardContent>
              </TabsContent>
            )}

            {settings?.stats_enabled !== false && (
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
                          }).map(([status, count]) => (
                            <div
                              key={status}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm">
                                {t(`tasks.statuses.${status}`)}
                              </span>
                              <span className="text-2xl font-bold">
                                {count}
                              </span>
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
                            low: tasks.filter((t) => t.priority === "low")
                              .length,
                            medium: tasks.filter((t) => t.priority === "medium")
                              .length,
                            high: tasks.filter((t) => t.priority === "high")
                              .length,
                            urgent: tasks.filter((t) => t.priority === "urgent")
                              .length,
                          }).map(([priority, count]) => (
                            <div
                              key={priority}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm">
                                {t(`tasks.priorities.${priority}`)}
                              </span>
                              <span className="text-2xl font-bold">
                                {count}
                              </span>
                            </div>
                          ))}
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
