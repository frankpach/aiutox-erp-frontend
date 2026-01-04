/**
 * Task types for AiutoX ERP
 * Based on docs/40-modules/tasks.md
 */

// Base task types
export interface Task {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  assigned_to: string;
  created_by: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  checklist: ChecklistItem[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Task creation payload
export interface TaskCreate {
  title: string;
  description: string;
  assigned_to: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  checklist?: ChecklistItem[];
  metadata?: Record<string, any>;
}

// Task update payload
export interface TaskUpdate {
  title?: string;
  description?: string;
  assigned_to?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  checklist?: ChecklistItem[];
  metadata?: Record<string, any>;
}

// Task list parameters
export interface TaskListParams {
  page?: number;
  page_size?: number;
  status?: TaskStatus;
  assigned_to?: string;
  created_by?: string;
  priority?: TaskPriority;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

// Checklist item
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completed_at?: string;
}

// Workflow types
export interface Workflow {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  definition: WorkflowDefinition;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Workflow creation payload
export interface WorkflowCreate {
  name: string;
  description: string;
  definition: WorkflowDefinition;
  is_active?: boolean;
}

// Workflow update payload
export interface WorkflowUpdate {
  name?: string;
  description?: string;
  definition?: WorkflowDefinition;
  is_active?: boolean;
}

// Workflow definition
export interface WorkflowDefinition {
  steps: WorkflowStep[];
}

// Workflow step
export interface WorkflowStep {
  step_number: number;
  name: string;
  status: string;
  transitions: string[];
  conditions?: Record<string, any>;
}

// Workflow execution payload
export interface WorkflowExecute {
  workflow_id: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

// Task and workflow list parameters
export interface TaskWorkflowListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Task statistics
export interface TaskStats {
  total_tasks: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  overdue_count: number;
  completed_today: number;
}

// Task status values
export type TaskStatus = 
  | "todo"
  | "in_progress"
  | "done"
  | "cancelled"
  | "on_hold";

// Task priority values
export type TaskPriority = 
  | "low"
  | "medium"
  | "high"
  | "urgent";
