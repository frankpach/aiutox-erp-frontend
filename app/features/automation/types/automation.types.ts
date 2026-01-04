/**
 * Automation types
 * Type definitions for Automation module
 */

import type { StandardResponse, StandardListResponse } from "~/lib/api/types/common.types";

// Automation Rule entity
export interface AutomationRule {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

// Automation rule creation payload
export interface AutomationRuleCreate {
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active?: boolean;
  priority?: number;
}

// Automation rule update payload
export interface AutomationRuleUpdate {
  name?: string;
  description?: string;
  trigger?: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions?: AutomationAction[];
  is_active?: boolean;
  priority?: number;
}

// Automation trigger schema
export interface AutomationTrigger {
  type: "event" | "schedule" | "manual";
  event_type?: string;
  entity_type?: string;
  schedule?: {
    type: "cron" | "interval";
    expression?: string;
    interval_seconds?: number;
    timezone?: string;
  };
}

// Automation condition schema
export interface AutomationCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "not_contains";
  value: any;
  logical_operator?: "and" | "or";
}

// Automation action schema
export interface AutomationAction {
  type: "send_notification" | "create_task" | "update_entity" | "send_webhook" | "publish_event";
  channel?: string;
  template?: string;
  recipients?: string[];
  entity_type?: string;
  entity_id?: string;
  data?: Record<string, any>;
  webhook_url?: string;
  event_type?: string;
  event_data?: Record<string, any>;
}

// Automation execution
export interface AutomationExecution {
  id: string;
  rule_id: string;
  trigger_data: Record<string, any>;
  status: "pending" | "running" | "completed" | "failed";
  result?: Record<string, any>;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

// Automation execution payload
export interface AutomationExecutionCreate {
  rule_id: string;
  trigger_data?: Record<string, any>;
}

// Automation list parameters
export interface AutomationRuleListParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  trigger_type?: string;
  search?: string;
}

// Automation list response
export type AutomationRuleListResponse = StandardListResponse<AutomationRule>;

// Automation execution list response
export type AutomationExecutionListResponse = StandardListResponse<AutomationExecution>;

// Automation statistics
export interface AutomationStats {
  total_rules: number;
  active_rules: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  pending_executions: number;
  executions_by_status: Record<string, number>;
  executions_by_day: Array<{
    date: string;
    count: number;
  }>;
  top_rules: Array<{
    rule_id: string;
    rule_name: string;
    execution_count: number;
    success_rate: number;
  }>;
}

// Automation test result
export interface AutomationTestResult {
  success: boolean;
  message: string;
  trigger_data?: Record<string, any>;
  conditions_result?: Array<{
    condition: AutomationCondition;
    result: boolean;
    error?: string;
  }>;
  actions_result?: Array<{
    action: AutomationAction;
    result: boolean;
    error?: string;
  }>;
}

// Automation validation errors
export interface AutomationValidationError {
  field: string;
  message: string;
  code: string;
}

// Automation operation result
export interface AutomationOperationResult {
  success: boolean;
  rule?: AutomationRule;
  execution?: AutomationExecution;
  errors?: AutomationValidationError[];
  warnings?: string[];
}
