/**
 * Automation API
 * API functions for Automation module
 */

import apiClient from "~/lib/api/client";
import type { StandardResponse, StandardListResponse } from "~/lib/api/types/common.types";
import type {
  AutomationRule,
  AutomationRuleCreate,
  AutomationRuleUpdate,
  AutomationExecution,
  AutomationExecutionCreate,
  AutomationRuleListParams,
  AutomationRuleListResponse,
  AutomationExecutionListResponse,
  AutomationStats,
  AutomationTestResult,
  AutomationOperationResult,
} from "../types/automation.types";

/**
 * Automation Rules API
 */

/**
 * List automation rules with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<StandardListResponse<AutomationRule>>
 */
export async function listAutomationRules(params?: AutomationRuleListParams): Promise<StandardListResponse<AutomationRule>> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
  if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());
  if (params?.trigger_type) searchParams.append("trigger_type", params.trigger_type);
  if (params?.search) searchParams.append("search", params.search);

  const response = await apiClient.get<StandardListResponse<AutomationRule>>(
    `/api/v1/automation/rules?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * Get a single automation rule by ID
 * @param id - Rule ID
 * @returns Promise<StandardResponse<AutomationRule>>
 */
export async function getAutomationRule(id: string): Promise<StandardResponse<AutomationRule>> {
  const response = await apiClient.get<StandardResponse<AutomationRule>>(`/api/v1/automation/rules/${id}`);
  return response.data;
}

/**
 * Create a new automation rule
 * @param payload - Rule creation data
 * @returns Promise<StandardResponse<AutomationRule>>
 */
export async function createAutomationRule(payload: AutomationRuleCreate): Promise<StandardResponse<AutomationRule>> {
  const response = await apiClient.post<StandardResponse<AutomationRule>>("/api/v1/automation/rules", payload);
  return response.data;
}

/**
 * Update an existing automation rule
 * @param id - Rule ID
 * @param payload - Rule update data
 * @returns Promise<StandardResponse<AutomationRule>>
 */
export async function updateAutomationRule(id: string, payload: AutomationRuleUpdate): Promise<StandardResponse<AutomationRule>> {
  const response = await apiClient.put<StandardResponse<AutomationRule>>(`/api/v1/automation/rules/${id}`, payload);
  return response.data;
}

/**
 * Delete an automation rule
 * @param id - Rule ID
 * @returns Promise<StandardResponse<void>>
 */
export async function deleteAutomationRule(id: string): Promise<StandardResponse<void>> {
  const response = await apiClient.delete<StandardResponse<void>>(`/api/v1/automation/rules/${id}`);
  return response.data;
}

/**
 * Execute an automation rule
 * @param id - Rule ID
 * @param payload - Execution payload
 * @returns Promise<StandardResponse<AutomationExecution>>
 */
export async function executeAutomationRule(id: string, payload: AutomationExecutionCreate): Promise<StandardResponse<AutomationExecution>> {
  const response = await apiClient.post<StandardResponse<AutomationExecution>>(`/api/v1/automation/rules/${id}/execute`, payload);
  return response.data;
}

/**
 * List executions for a rule
 * @param id - Rule ID
 * @param params - Query parameters for pagination
 * @returns Promise<StandardListResponse<AutomationExecution>>
 */
export async function listAutomationExecutions(id: string, params?: { page?: number; page_size?: number }): Promise<StandardListResponse<AutomationExecution>> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());

  const response = await apiClient.get<StandardListResponse<AutomationExecution>>(
    `/api/v1/automation/rules/${id}/executions?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * Get a single execution by ID
 * @param id - Execution ID
 * @returns Promise<StandardResponse<AutomationExecution>>
 */
export async function getAutomationExecution(id: string): Promise<StandardResponse<AutomationExecution>> {
  const response = await apiClient.get<StandardResponse<AutomationExecution>>(`/api/v1/automation/executions/${id}`);
  return response.data;
}

/**
 * Test an automation rule
 * @param id - Rule ID
 * @param triggerData - Test trigger data
 * @returns Promise<StandardResponse<AutomationTestResult>>
 */
export async function testAutomationRule(id: string, triggerData?: Record<string, any>): Promise<StandardResponse<AutomationTestResult>> {
  const response = await apiClient.post<StandardResponse<AutomationTestResult>>(
    `/api/v1/automation/rules/${id}/test`,
    { trigger_data: triggerData }
  );
  return response.data;
}

/**
 * Get automation statistics
 * @returns Promise<StandardResponse<AutomationStats>>
 */
export async function getAutomationStats(): Promise<StandardResponse<AutomationStats>> {
  const response = await apiClient.get<StandardResponse<AutomationStats>>("/api/v1/automation/stats");
  return response.data;
}

/**
 * Enable an automation rule
 * @param id - Rule ID
 * @returns Promise<StandardResponse<AutomationRule>>
 */
export async function enableAutomationRule(id: string): Promise<StandardResponse<AutomationRule>> {
  const response = await apiClient.post<StandardResponse<AutomationRule>>(`/api/v1/automation/rules/${id}/enable`);
  return response.data;
}

/**
 * Disable an automation rule
 * @param id - Rule ID
 * @returns Promise<StandardResponse<AutomationRule>>
 */
export async function disableAutomationRule(id: string): Promise<StandardResponse<AutomationRule>> {
  const response = await apiClient.post<StandardResponse<AutomationRule>>(`/api/v1/automation/rules/${id}/disable`);
  return response.data;
}

/**
 * Clone an automation rule
 * @param id - Rule ID
 * @param payload - Cloned rule data
 * @returns Promise<StandardResponse<AutomationRule>>
 */
export async function cloneAutomationRule(id: string, payload: { name: string; description?: string }): Promise<StandardResponse<AutomationRule>> {
  const response = await apiClient.post<StandardResponse<AutomationRule>>(`/api/v1/automation/rules/${id}/clone`, payload);
  return response.data;
}

/**
 * Get available trigger types
 * @returns Promise<StandardResponse<Array<{ type: string; description: string; entity_types: string[] }>>>
 */
export async function getTriggerTypes(): Promise<StandardResponse<Array<{ type: string; description: string; entity_types: string[] }>>> {
  const response = await apiClient.get<StandardResponse<Array<{ type: string; description: string; entity_types: string[] }>>>("/api/v1/automation/trigger-types");
  return response.data;
}

/**
 * Get available action types
 * @returns Promise<StandardResponse<Array<{ type: string; description: string; required_fields: string[] }>>>
 */
export async function getActionTypes(): Promise<StandardResponse<Array<{ type: string; description: string; required_fields: string[] }>>> {
  const response = await apiClient.get<StandardResponse<Array<{ type: string; description: string; required_fields: string[] }>>>("/api/v1/automation/action-types");
  return response.data;
}

/**
 * Get available condition operators
 * @returns Promise<StandardResponse<Array<{ operator: string; description: string; value_types: string[] }>>>
 */
export async function getConditionOperators(): Promise<StandardResponse<Array<{ operator: string; description: string; value_types: string[] }>>> {
  const response = await apiClient.get<StandardResponse<Array<{ operator: string; description: string; value_types: string[] }>>>("/api/v1/automation/condition-operators");
  return response.data;
}

/**
 * Validate automation rule configuration
 * @param payload - Rule configuration to validate
 * @returns Promise<StandardResponse<AutomationOperationResult>>
 */
export async function validateAutomationRule(payload: AutomationRuleCreate | AutomationRuleUpdate): Promise<StandardResponse<AutomationOperationResult>> {
  const response = await apiClient.post<StandardResponse<AutomationOperationResult>>("/api/v1/automation/rules/validate", payload);
  return response.data;
}
