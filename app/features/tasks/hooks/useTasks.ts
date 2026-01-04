/**
 * Tasks hooks
 * Provides TanStack Query hooks for tasks module
 * Following frontend-api.md rules
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask, 
  createChecklistItem, 
  updateChecklistItem, 
  deleteChecklistItem,
  createWorkflow,
  executeWorkflow,
} from "~/features/tasks/api/tasks.api";
import type { 
  TaskCreate, 
  TaskUpdate, 
  TaskListParams, 
  ChecklistItem, 
  WorkflowCreate, 
  WorkflowExecute 
} from "~/features/tasks/types/task.types";

// Query hooks
export function useTasks(params?: TaskListParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => listTasks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => getTask(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate tasks list queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdate }) =>
      updateTask(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific task and list queries
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      // Invalidate tasks list queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
    },
  });
}

export function useChecklistMutations() {
  const queryClient = useQueryClient();
  
  const createItem = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Omit<ChecklistItem, "id" | "completed_at"> }) =>
      createChecklistItem(taskId, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific task and list queries
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to create checklist item:", error);
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ taskId, itemId, payload }: { taskId: string; itemId: string; payload: Partial<ChecklistItem> }) =>
      updateChecklistItem(taskId, itemId, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific task and list queries
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to update checklist item:", error);
    },
  });

  const deleteItem = useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) =>
      deleteChecklistItem(taskId, itemId),
    onSuccess: (_, variables) => {
      // Invalidate specific task and list queries
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to delete checklist item:", error);
    },
  });

  return {
    createItem,
    updateItem,
    deleteItem,
  };
}

export function useWorkflowMutations() {
  const queryClient = useQueryClient();
  
  const createWorkflow = useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      // Invalidate workflows list queries
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (error) => {
      console.error("Failed to create workflow:", error);
    },
  });

  const executeWorkflow = useMutation({
    mutationFn: ({ workflowId, payload }: { workflowId: string; payload: WorkflowExecute }) =>
      executeWorkflow(workflowId, payload),
    onSuccess: () => {
      // Invalidate workflows and tasks queries
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to execute workflow:", error);
    },
  });

  return {
    createWorkflow,
    executeWorkflow,
  };
}
