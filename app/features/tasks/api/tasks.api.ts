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
  TaskAssignment,
  TaskAssignmentCreate,
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
      priority: params?.priority,
    },
  });
  return response.data;
}

/**
 * List my tasks (visible to current user)
 * GET /api/v1/tasks/my-tasks
 *
 * Requires: tasks.view permission
 */
export async function listMyTasks(
  params?: TaskListParams
): Promise<StandardListResponse<Task>> {
  const response = await apiClient.get<StandardListResponse<Task>>(
    "/tasks/my-tasks",
    {
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        status: params?.status,
        priority: params?.priority,
      },
    }
  );
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
 * Requires: tasks.manage permission
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
 * Requires: tasks.manage permission
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
 * Requires: tasks.manage permission
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
 * Requires: tasks.manage permission
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
 * PUT /api/v1/tasks/checklist/{item_id}
 *
 * Requires: tasks.manage permission
 */
export async function updateChecklistItem(
  itemId: string,
  payload: Partial<ChecklistItem>
): Promise<StandardResponse<ChecklistItem>> {
  const response = await apiClient.put<StandardResponse<ChecklistItem>>(
    `/tasks/checklist/${itemId}`,
    payload
  );
  return response.data;
}

/**
 * Delete checklist item
 * DELETE /api/v1/tasks/checklist/{item_id}
 *
 * Requires: tasks.manage permission
 */
export async function deleteChecklistItem(
  itemId: string
): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(
    `/tasks/checklist/${itemId}`
  );
  return response.data;
}

/**
 * List checklist items for a task
 * GET /api/v1/tasks/{id}/checklist
 *
 * Requires: tasks.view permission
 */
export async function listChecklistItems(
  taskId: string
): Promise<StandardListResponse<ChecklistItem>> {
  const response = await apiClient.get<StandardListResponse<ChecklistItem>>(
    `/tasks/${taskId}/checklist`
  );
  return response.data;
}

/**
 * Create task assignment
 * POST /api/v1/tasks/{task_id}/assignments
 *
 * Requires: tasks.assign permission
 */
export async function createAssignment(
  taskId: string,
  assignment: TaskAssignmentCreate
): Promise<StandardResponse<TaskAssignment>> {
  const response = await apiClient.post<StandardResponse<TaskAssignment>>(
    `/tasks/${taskId}/assignments`,
    assignment
  );
  return response.data;
}

/**
 * List task assignments
 * GET /api/v1/tasks/{task_id}/assignments
 *
 * Requires: tasks.view permission
 */
export async function listAssignments(
  taskId: string
): Promise<StandardListResponse<TaskAssignment>> {
  const response = await apiClient.get<StandardListResponse<TaskAssignment>>(
    `/tasks/${taskId}/assignments`
  );
  return response.data;
}

/**
 * Delete task assignment
 * DELETE /api/v1/tasks/assignments/{assignment_id}
 *
 * Requires: tasks.assign permission
 */
export async function deleteAssignment(
  assignmentId: string
): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(
    `/tasks/assignments/${assignmentId}`
  );
  return response.data;
}

/**
 * Get agenda items
 * GET /api/v1/tasks/agenda
 *
 * Requires: tasks.agenda.view permission
 */
export async function getAgenda(params?: {
  start_date?: string;
  end_date?: string;
  sources?: string;
}): Promise<StandardListResponse<Record<string, any>>> {
  const response = await apiClient.get<
    StandardListResponse<Record<string, any>>
  >("/tasks/agenda", {
    params: {
      start_date: params?.start_date,
      end_date: params?.end_date,
      sources: params?.sources,
    },
  });
  return response.data;
}

/**
 * Get calendar sources
 * GET /api/v1/tasks/calendar-sources
 *
 * Requires: tasks.agenda.view permission
 */
export async function getCalendarSources(): Promise<
  StandardResponse<Record<string, any>>
> {
  const response = await apiClient.get<StandardResponse<Record<string, any>>>(
    "/tasks/calendar-sources"
  );
  return response.data;
}

/**
 * Update calendar sources preferences
 * PUT /api/v1/tasks/calendar-sources
 *
 * Requires: tasks.agenda.manage permission
 */
export async function updateCalendarSources(
  preferences: Record<string, any>
): Promise<StandardResponse<Record<string, any>>> {
  const response = await apiClient.put<StandardResponse<Record<string, any>>>(
    "/tasks/calendar-sources",
    preferences
  );
  return response.data;
}

/**
 * Get saved views
 * GET /api/v1/tasks/views
 *
 * Requires: tasks.agenda.view permission
 */
export async function getViews(): Promise<
  StandardListResponse<Record<string, any>>
> {
  const response =
    await apiClient.get<StandardListResponse<Record<string, any>>>(
      "/tasks/views"
    );
  return response.data;
}

/**
 * Create saved view
 * POST /api/v1/tasks/views
 *
 * Requires: tasks.agenda.manage permission
 */
export async function createView(
  viewData: Record<string, any>
): Promise<StandardResponse<Record<string, any>>> {
  const response = await apiClient.post<StandardResponse<Record<string, any>>>(
    "/tasks/views",
    viewData
  );
  return response.data;
}
