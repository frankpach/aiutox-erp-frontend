/**
 * Task Form Component
 * Form for creating and editing tasks
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { 
  ArrowLeftIcon,
  PlugIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTask, useCreateTask, useUpdateTask } from "~/features/tasks/hooks/useTasks";
import type { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority, ChecklistItem } from "~/features/tasks/types/task.types";

interface TaskFormProps {
  taskId?: string;
}

export function TaskForm({ taskId }: TaskFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: taskResponse, isLoading, error } = useTask(taskId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const task = taskResponse?.data;

  const [formData, setFormData] = useState<TaskCreate>({
    title: "",
    description: "",
    assigned_to: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    checklist: [],
  });

  const [checklistItems, setChecklistItems] = useState<string[]>([""]);

  useEffect(() => {
    if (task && taskId) {
      setFormData({
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || "",
        checklist: task.checklist || [],
      });
      setChecklistItems(task.checklist?.map(item => item.text) || []);
    }
  }, [task, taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        checklist: checklistItems.map((text, index) => ({
          id: task?.checklist?.[index]?.id || `new-${index}`,
          text,
          completed: false,
        })),
      };

      if (taskId) {
        await updateTask.mutateAsync({ taskId, data: submitData });
      } else {
        await createTask.mutateAsync(submitData);
      }
      
      navigate("/tasks");
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, ""]);
  };

  const updateChecklistItem = (index: number, value: string) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const removeChecklistItem = (index: number) => {
    const newItems = checklistItems.filter((_, i) => i !== index);
    setChecklistItems(newItems);
  };

  const isLoadingData = isLoading || createTask.isPending || updateTask.isPending;

  if (isLoadingData) {
    return (
      <PageLayout title={taskId ? "Edit Task" : "Create Task"} loading>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={taskId ? "Edit Task" : "Create Task"}
      breadcrumbs={[
        { label: "Tasks", href: "/tasks" },
        { label: taskId ? "Edit Task" : "Create Task" }
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To *
                  </label>
                  <Input
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="Enter assignee"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Checklist</CardTitle>
                <Button type="button" variant="outline" onClick={addChecklistItem}>
                  <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      placeholder="Enter checklist item"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeChecklistItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {checklistItems.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No checklist items. Add items above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/tasks")}>
              <HugeiconsIcon icon={ArrowLeftIcon} size={16} className="mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoadingData}>
              <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
              {isLoadingData ? "Saving..." : (taskId ? "Update Task" : "Create Task")}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
