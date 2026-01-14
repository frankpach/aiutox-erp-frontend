/**
 * Tasks page
 * Main page for tasks management
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PageLayout } from "~/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TaskList } from "~/features/tasks/components/TaskList";
import { TaskBoard } from "~/features/tasks/components/TaskBoard";
import { TaskCalendar } from "~/features/tasks/components/TaskCalendar";
import { TaskInbox } from "~/features/tasks/components/TaskInbox";
import { TaskQuickAdd } from "~/features/tasks/components/TaskQuickAdd";
import { showToast } from "~/components/common/Toast";
import {
  useMyTasks,
  useUpdateTask,
  useDeleteTask,
} from "~/features/tasks/hooks/useTasks";
import type { Task } from "~/features/tasks/types/task.types";

export default function TasksPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("list");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    if (window.confirm(t("tasks.deleteConfirm"))) {
      deleteTaskMutation.mutate(task.id, {
        onSuccess: () => {
          showToast(t("tasks.deleteSuccess"), "success");
          refetch();
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
            onTaskCreated={() => {
              setIsQuickAddOpen(false);
              refetch();
            }}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="inbox">
                {t("tasks.tabs.inbox") || "Inbox"}
              </TabsTrigger>
              <TabsTrigger value="list">{t("tasks.tabs.list")}</TabsTrigger>
              <TabsTrigger value="board">{t("tasks.tabs.board")}</TabsTrigger>
              <TabsTrigger value="calendar">
                {t("tasks.tabs.calendar")}
              </TabsTrigger>
              <TabsTrigger value="stats">{t("tasks.tabs.stats")}</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-6">
              {/* Task Inbox */}
              <CardContent className="space-y-4">
                <TaskInbox onTaskProcessed={() => refetch()} />
              </CardContent>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              {/* Task List */}
              <CardContent className="space-y-4">
                <TaskList
                  tasks={tasks}
                  loading={loading}
                  onRefresh={refetch}
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

            <TabsContent value="board" className="mt-6">
              {/* Task Board */}
              <CardContent className="space-y-4">
                <TaskBoard
                  tasks={tasks}
                  loading={loading}
                  onRefresh={refetch}
                  onTaskSelect={handleEditTask}
                  onTaskEdit={handleUpdateTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskCreate={() => setIsQuickAddOpen(true)}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              {/* Task Calendar */}
              <CardContent className="space-y-4">
                <TaskCalendar
                  tasks={tasks}
                  loading={loading}
                  onRefresh={refetch}
                  onTaskSelect={handleEditTask}
                  onTaskEdit={handleUpdateTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskCreate={() => setIsQuickAddOpen(true)}
                />
              </CardContent>
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
    </ProtectedRoute>
  );
}
