/**
 * Approvals types for AiutoX ERP
 * Based on docs/40-modules/approvals.md
 */

// Approval Flow types
export interface ApprovalFlow {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  entity_type: string;
  steps: ApprovalStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Approval Flow creation payload
export interface ApprovalFlowCreate {
  name: string;
  description: string;
  entity_type: string;
  steps: ApprovalStep[];
  is_active?: boolean;
}

// Approval Flow update payload
export interface ApprovalFlowUpdate {
  name?: string;
  description?: string;
  entity_type?: string;
  steps?: ApprovalStep[];
  is_active?: boolean;
}

// Approval Step
export interface ApprovalStep {
  id: string;
  flow_id: string;
  step_number: number;
  name: string;
  approver_type: ApproverType;
  approver_config: ApproverConfig;
  conditions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Approver types
export type ApproverType = 
  | "user"
  | "role"
  | "department"
  | "custom";

// Approver configuration
export interface ApproverConfig {
  user_id?: string;
  role_id?: string;
  department_id?: string;
  custom_logic?: string;
  min_approvals?: number;
}

// Approval Request types
export interface ApprovalRequest {
  id: string;
  tenant_id: string;
  flow_id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  description: string;
  requested_by: string;
  current_step: number;
  status: ApprovalStatus;
  steps: ApprovalRequestStep[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Approval Request creation payload
export interface ApprovalRequestCreate {
  flow_id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

// Approval Request update payload
export interface ApprovalRequestUpdate {
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Approval Request Step
export interface ApprovalRequestStep {
  id: string;
  request_id: string;
  step_number: number;
  approver_id: string;
  approver_name: string;
  status: StepStatus;
  decision?: ApprovalDecision;
  comments?: string;
  decided_at?: string;
  created_at: string;
  updated_at: string;
}

// Approval Decision
export interface ApprovalDecision {
  action: "approve" | "reject" | "delegate";
  delegated_to?: string;
  comments?: string;
}

// Approval status values
export type ApprovalStatus = 
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired";

// Step status values
export type StepStatus = 
  | "pending"
  | "approved"
  | "rejected"
  | "skipped"
  | "delegated";

// Approval Flow list parameters
export interface ApprovalFlowListParams {
  page?: number;
  page_size?: number;
  entity_type?: string;
  is_active?: boolean;
  search?: string;
}

// Approval Request list parameters
export interface ApprovalRequestListParams {
  page?: number;
  page_size?: number;
  status?: ApprovalStatus;
  requested_by?: string;
  approver_id?: string;
  entity_type?: string;
  search?: string;
}

// Approval statistics
export interface ApprovalStats {
  total_flows: number;
  active_flows: number;
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  avg_approval_time: number;
}
