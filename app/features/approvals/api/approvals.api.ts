/**
 * Approvals API functions
 * Provides API integration for approvals module
 * Following frontend-api.md rules
 */

import apiClient from "~/lib/api/client";
import type {
  StandardResponse,
  StandardListResponse,
} from "~/lib/api/types/common.types";
import type {
  ApprovalFlow,
  ApprovalFlowCreate,
  ApprovalFlowUpdate,
  ApprovalRequest,
  ApprovalRequestCreate,
  ApprovalRequestUpdate,
  ApprovalDecision,
  ApprovalFlowListParams,
  ApprovalRequestListParams,
} from "~/features/approvals/types/approval.types";

// Approval Flow API functions

/**
 * List approval flows with pagination and filters
 * GET /api/v1/approvals/flows
 * 
 * Requires: approvals.view permission
 */
export async function listApprovalFlows(
  params?: ApprovalFlowListParams
): Promise<StandardListResponse<ApprovalFlow>> {
  const response = await apiClient.get<StandardListResponse<ApprovalFlow>>("/approvals/flows", {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
      entity_type: params?.entity_type,
      is_active: params?.is_active,
      search: params?.search,
    },
  });
  return response.data;
}

/**
 * Get approval flow by ID
 * GET /api/v1/approvals/flows/{id}
 * 
 * Requires: approvals.view permission
 */
export async function getApprovalFlow(id: string): Promise<StandardResponse<ApprovalFlow>> {
  const response = await apiClient.get<StandardResponse<ApprovalFlow>>(`/approvals/flows/${id}`);
  return response.data;
}

/**
 * Create new approval flow
 * POST /api/v1/approvals/flows
 * 
 * Requires: approvals.manage permission
 */
export async function createApprovalFlow(
  payload: ApprovalFlowCreate
): Promise<StandardResponse<ApprovalFlow>> {
  const response = await apiClient.post<StandardResponse<ApprovalFlow>>("/approvals/flows", payload);
  return response.data;
}

/**
 * Update existing approval flow
 * PUT /api/v1/approvals/flows/{id}
 * 
 * Requires: approvals.manage permission
 */
export async function updateApprovalFlow(
  id: string,
  payload: ApprovalFlowUpdate
): Promise<StandardResponse<ApprovalFlow>> {
  const response = await apiClient.put<StandardResponse<ApprovalFlow>>(`/approvals/flows/${id}`, payload);
  return response.data;
}

/**
 * Delete approval flow
 * DELETE /api/v1/approvals/flows/{id}
 * 
 * Requires: approvals.manage permission
 */
export async function deleteApprovalFlow(id: string): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(`/approvals/flows/${id}`);
  return response.data;
}

// Approval Request API functions

/**
 * List approval requests with pagination and filters
 * GET /api/v1/approvals/requests
 * 
 * Requires: approvals.view permission
 */
export async function listApprovalRequests(
  params?: ApprovalRequestListParams
): Promise<StandardListResponse<ApprovalRequest>> {
  const response = await apiClient.get<StandardListResponse<ApprovalRequest>>("/approvals/requests", {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
      status: params?.status,
      requested_by: params?.requested_by,
      approver_id: params?.approver_id,
      entity_type: params?.entity_type,
      search: params?.search,
    },
  });
  return response.data;
}

/**
 * Get approval request by ID
 * GET /api/v1/approvals/requests/{id}
 * 
 * Requires: approvals.view permission
 */
export async function getApprovalRequest(id: string): Promise<StandardResponse<ApprovalRequest>> {
  const response = await apiClient.get<StandardResponse<ApprovalRequest>>(`/approvals/requests/${id}`);
  return response.data;
}

/**
 * Create new approval request
 * POST /api/v1/approvals/requests
 * 
 * Requires: approvals.view permission
 */
export async function createApprovalRequest(
  payload: ApprovalRequestCreate
): Promise<StandardResponse<ApprovalRequest>> {
  const response = await apiClient.post<StandardResponse<ApprovalRequest>>("/approvals/requests", payload);
  return response.data;
}

/**
 * Update existing approval request
 * PUT /api/v1/approvals/requests/{id}
 * 
 * Requires: approvals.manage permission
 */
export async function updateApprovalRequest(
  id: string,
  payload: ApprovalRequestUpdate
): Promise<StandardResponse<ApprovalRequest>> {
  const response = await apiClient.put<StandardResponse<ApprovalRequest>>(`/approvals/requests/${id}`, payload);
  return response.data;
}

/**
 * Delete approval request
 * DELETE /api/v1/approvals/requests/{id}
 * 
 * Requires: approvals.manage permission
 */
export async function deleteApprovalRequest(id: string): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(`/approvals/requests/${id}`);
  return response.data;
}

/**
 * Approve approval request
 * POST /api/v1/approvals/requests/{id}/approve
 * 
 * Requires: approvals.approve permission
 */
export async function approveRequest(
  id: string,
  payload: ApprovalDecision
): Promise<StandardResponse<ApprovalRequest>> {
  const response = await apiClient.post<StandardResponse<ApprovalRequest>>(
    `/approvals/requests/${id}/approve`,
    payload
  );
  return response.data;
}

/**
 * Reject approval request
 * POST /api/v1/approvals/requests/{id}/reject
 * 
 * Requires: approvals.approve permission
 */
export async function rejectRequest(
  id: string,
  payload: ApprovalDecision
): Promise<StandardResponse<ApprovalRequest>> {
  const response = await apiClient.post<StandardResponse<ApprovalRequest>>(
    `/approvals/requests/${id}/reject`,
    payload
  );
  return response.data;
}

/**
 * Delegate approval request
 * POST /api/v1/approvals/requests/{id}/delegate
 * 
 * Requires: approvals.delegate permission
 */
export async function delegateRequest(
  id: string,
  payload: ApprovalDecision
): Promise<StandardResponse<ApprovalRequest>> {
  const response = await apiClient.post<StandardResponse<ApprovalRequest>>(
    `/approvals/requests/${id}/delegate`,
    payload
  );
  return response.data;
}
