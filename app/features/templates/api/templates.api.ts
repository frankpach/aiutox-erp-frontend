/**
 * Templates API functions
 * Provides API integration for templates module
 * Following frontend-api.md rules
 */

import apiClient from "~/lib/api/client";
import type {
  StandardResponse,
  StandardListResponse,
} from "~/lib/api/types/common.types";
import type {
  Template,
  TemplateCreate,
  TemplateUpdate,
  TemplateCategory,
  TemplateCategoryCreate,
  TemplateCategoryUpdate,
  TemplateVersion,
  TemplateRenderRequest,
  TemplateRenderResponse,
  TemplateListParams,
  TemplateVersionListParams,
} from "~/features/templates/types/template.types";

// Templates API functions

/**
 * List templates with pagination and filters
 * GET /api/v1/templates
 * 
 * Requires: templates.view permission
 */
export async function listTemplates(
  params?: TemplateListParams
): Promise<StandardListResponse<Template>> {
  const response = await apiClient.get<StandardListResponse<Template>>("/templates", {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
      type: params?.type,
      category_id: params?.category_id,
      is_active: params?.is_active,
      search: params?.search,
    },
  });
  return response.data;
}

/**
 * Get template by ID
 * GET /api/v1/templates/{id}
 * 
 * Requires: templates.view permission
 */
export async function getTemplate(id: string): Promise<StandardResponse<Template>> {
  const response = await apiClient.get<StandardResponse<Template>>(`/templates/${id}`);
  return response.data;
}

/**
 * Create new template
 * POST /api/v1/templates
 * 
 * Requires: templates.manage permission
 */
export async function createTemplate(
  payload: TemplateCreate
): Promise<StandardResponse<Template>> {
  const response = await apiClient.post<StandardResponse<Template>>("/templates", payload);
  return response.data;
}

/**
 * Update existing template
 * PUT /api/v1/templates/{id}
 * 
 * Requires: templates.manage permission
 */
export async function updateTemplate(
  id: string,
  payload: TemplateUpdate
): Promise<StandardResponse<Template>> {
  const response = await apiClient.put<StandardResponse<Template>>(`/templates/${id}`, payload);
  return response.data;
}

/**
 * Delete template
 * DELETE /api/v1/templates/{id}
 * 
 * Requires: templates.manage permission
 */
export async function deleteTemplate(id: string): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(`/templates/${id}`);
  return response.data;
}

/**
 * Render template with context
 * POST /api/v1/templates/{id}/render
 * 
 * Requires: templates.render permission
 */
export async function renderTemplate(
  id: string,
  payload: TemplateRenderRequest
): Promise<StandardResponse<TemplateRenderResponse>> {
  const response = await apiClient.post<StandardResponse<TemplateRenderResponse>>(
    `/templates/${id}/render`,
    payload
  );
  return response.data;
}

// Template Categories API functions

/**
 * List template categories
 * GET /api/v1/templates/categories
 * 
 * Requires: templates.view permission
 */
export async function listCategories(): Promise<StandardListResponse<TemplateCategory>> {
  const response = await apiClient.get<StandardListResponse<TemplateCategory>>("/templates/categories");
  return response.data;
}

/**
 * Create new template category
 * POST /api/v1/templates/categories
 * 
 * Requires: templates.manage permission
 */
export async function createCategory(
  payload: TemplateCategoryCreate
): Promise<StandardResponse<TemplateCategory>> {
  const response = await apiClient.post<StandardResponse<TemplateCategory>>("/templates/categories", payload);
  return response.data;
}

/**
 * Update template category
 * PUT /api/v1/templates/categories/{id}
 * 
 * Requires: templates.manage permission
 */
export async function updateCategory(
  id: string,
  payload: TemplateCategoryUpdate
): Promise<StandardResponse<TemplateCategory>> {
  const response = await apiClient.put<StandardResponse<TemplateCategory>>(`/templates/categories/${id}`, payload);
  return response.data;
}

/**
 * Delete template category
 * DELETE /api/v1/templates/categories/{id}
 * 
 * Requires: templates.manage permission
 */
export async function deleteCategory(id: string): Promise<StandardResponse<null>> {
  const response = await apiClient.delete<StandardResponse<null>>(`/templates/categories/${id}`);
  return response.data;
}

// Template Versions API functions

/**
 * List template versions
 * GET /api/v1/templates/{id}/versions
 * 
 * Requires: templates.view permission
 */
export async function listVersions(
  id: string,
  params?: TemplateVersionListParams
): Promise<StandardListResponse<TemplateVersion>> {
  const response = await apiClient.get<StandardListResponse<TemplateVersion>>(`/templates/${id}/versions`, {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 20,
    },
  });
  return response.data;
}

/**
 * Get specific template version
 * GET /api/v1/templates/{id}/versions/{version}
 * 
 * Requires: templates.view permission
 */
export async function getVersion(
  id: string,
  version: number
): Promise<StandardResponse<TemplateVersion>> {
  const response = await apiClient.get<StandardResponse<TemplateVersion>>(
    `/templates/${id}/versions/${version}`
  );
  return response.data;
}
