/**
 * Tasks API functions
 * Provides API integration for tasks module
 * Following frontend-api.md rules
 */

import apiClient from "~/lib/api/client";
import type {
  StandardResponse,
  StandardListResponse,
} from "~/lib/api/types/common.types";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListParams,
  ChecklistItem,
  Workflow,
  WorkflowCreate,
  WorkflowUpdate,
  WorkflowExecute,
  TaskWorkflowListParams,
} from "~/features/tasks/types/task.types";

/**
 * List tasks with pagination and filters
 * GET /api/v1/tasks
 *
 * Requires: tasks.view permission
 */
export async function listTasks(
  params?: TaskListParams
): Promise<StandardListResponse<Task>> {
  const response = await apiClient.get<StandardListResponse<Task>>("/tasks", {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
      status: params?.status,
      assigned_to_id: params?.assigned_to_id,
      created_by_id: params?.created_by_id,
      priority: params?.priority,
      due_date_from: params?.due_date_from,
      due_date_to: params?.due_date_to,
      search: params?.search,
    },
  });
  return response.data;
}

/**
 * Get task by ID
 * GET /api/v1/tasks/{id}
 *
 * Requires: tasks.view permission
 */
export async function getTask(id: string): Promise<StandardResponse<Task>> {
  const response = await apiClient.get<StandardResponse<Task>>(`/tasks/${id}`);
  return response.data;
}

/**
 * Create new task
 * POST /api/v1/tasks
 *
 * Requires: tasks.create permission
 */
export async function createTask(
  payload: TaskCreate
): Promise<StandardResponse<Task>> {
  const response = await apiClient.post<StandardResponse<Task>>(
    "/tasks",
    payload
  );
  return response.data;
}

/**
 * Update existing task
 * PUT /api/v1/tasks/{id}
 *
 * Requires: tasks.edit permission
 */
export async function updateTask(
  id: string,
  payload: TaskUpdate
): Promise<StandardResponse<Task>> {
  const response = await apiClient.put<StandardResponse<Task>>(
    `/tasks/${id}`,
    payload
  );
  return response.data;
}

/**
 * Delete task
 * DELETE /api/v1/tasks/{id}
 *
 * Requires: tasks.delete permission
 */
export async function deleteTask(id: string): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(
    `/tasks/${id}`
  );
  return response.data;
}

/**
 * Add checklist item to task
 * POST /api/v1/tasks/{id}/checklist
 *
 * Requires: tasks.edit permission
 */
export async function createChecklistItem(
  taskId: string,
  payload: Omit<ChecklistItem, "id" | "completed_at">
): Promise<StandardResponse<ChecklistItem>> {
  const response = await apiClient.post<StandardResponse<ChecklistItem>>(
    `/tasks/${taskId}/checklist`,
    payload
  );
  return response.data;
}

/**
 * Update checklist item
 * PUT /api/v1/tasks/{id}/checklist/{item_id}
 *
 * Requires: tasks.edit permission
 */
export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  payload: Partial<ChecklistItem>
): Promise<StandardResponse<ChecklistItem>> {
  const response = await apiClient.put<StandardResponse<ChecklistItem>>(
    `/tasks/${taskId}/checklist/${itemId}`,
    payload
  );
  return response.data;
}

/**
 * Delete checklist item
 * DELETE /api/v1/tasks/{id}/checklist/{item_id}
 *
 * Requires: tasks.edit permission
 */
export async function deleteChecklistItem(
  taskId: string,
  itemId: string
): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(
    `/tasks/${taskId}/checklist/${itemId}`
  );
  return response.data;
}

/**
 * Create workflow
 * POST /api/v1/tasks/workflows
 *
 * Requires: workflows.manage permission
 */
export async function createWorkflow(
  payload: WorkflowCreate
): Promise<StandardResponse<Workflow>> {
  const response = await apiClient.post<StandardResponse<Workflow>>(
    "/tasks/workflows",
    payload
  );
  return response.data;
}

/**
 * Execute workflow
 * POST /api/v1/tasks/workflows/{workflow_id}/execute
 *
 * Requires: workflows.manage permission
 */
export async function executeWorkflow(
  workflowId: string,
  payload: WorkflowExecute
): Promise<StandardResponse<any>> {
  const response = await apiClient.post<StandardResponse<any>>(
    `/tasks/workflows/${workflowId}/execute`,
    payload
  );
  return response.data;
}
