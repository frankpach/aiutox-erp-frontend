/**
 * Tasks API helpers for E2E setup/teardown.
 */

import { getAdminToken } from "./api-helpers";

const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:8000";

type TaskCreatePayload = {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to_id?: string | null;
  due_date?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  all_day?: boolean;
};

async function resolveToken(token?: string): Promise<string> {
  return token || (await getAdminToken());
}

export async function createTaskViaApi(
  payload: TaskCreatePayload,
  token?: string
) {
  const accessToken = await resolveToken(token);
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create task: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function deleteTaskViaApi(taskId: string, token?: string) {
  const accessToken = await resolveToken(token);
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(`Failed to delete task: ${JSON.stringify(error)}`);
  }
}

export async function createChecklistItemViaApi(
  taskId: string,
  payload: { title: string; order?: number },
  token?: string
) {
  const accessToken = await resolveToken(token);
  const response = await fetch(
    `${API_BASE_URL}/api/v1/tasks/${taskId}/checklist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create checklist item: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function listTasksViaApi(token?: string) {
  const accessToken = await resolveToken(token);
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to list tasks: ${JSON.stringify(error)}`);
  }

  return response.json();
}
