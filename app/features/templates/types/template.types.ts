/**
 * Templates types for AiutoX ERP
 * Based on docs/40-modules/templates.md
 */

// Template types
export interface Template {
  id: string;
  tenant_id: string;
  name: string;
  category_id: string;
  type: TemplateType;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

// Template creation payload
export interface TemplateCreate {
  name: string;
  category_id: string;
  type: TemplateType;
  subject?: string;
  content: string;
  variables?: string[];
  is_active?: boolean;
}

// Template update payload
export interface TemplateUpdate {
  name?: string;
  category_id?: string;
  type?: TemplateType;
  subject?: string;
  content?: string;
  variables?: string[];
  is_active?: boolean;
}

// Template types
export type TemplateType = 
  | "document"
  | "email"
  | "sms";

// Template category
export interface TemplateCategory {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Template category creation payload
export interface TemplateCategoryCreate {
  name: string;
  description: string;
}

// Template category update payload
export interface TemplateCategoryUpdate {
  name?: string;
  description?: string;
}

// Template version
export interface TemplateVersion {
  id: string;
  template_id: string;
  version: number;
  name: string;
  subject?: string;
  content: string;
  variables: string[];
  created_by: string;
  created_at: string;
}

// Template render context
export interface TemplateRenderContext {
  [key: string]: any;
}

// Template render request
export interface TemplateRenderRequest {
  context: TemplateRenderContext;
  format?: RenderFormat;
}

// Template render response
export interface TemplateRenderResponse {
  rendered: string;
  format: RenderFormat;
}

// Render formats
export type RenderFormat = 
  | "html"
  | "text"
  | "pdf";

// Template list parameters
export interface TemplateListParams {
  page?: number;
  page_size?: number;
  type?: TemplateType;
  category_id?: string;
  is_active?: boolean;
  search?: string;
}

// Template version list parameters
export interface TemplateVersionListParams {
  page?: number;
  page_size?: number;
}

// Template statistics
export interface TemplateStats {
  total_templates: number;
  active_templates: number;
  total_categories: number;
  templates_by_type: Record<TemplateType, number>;
  recent_usage: number;
}
