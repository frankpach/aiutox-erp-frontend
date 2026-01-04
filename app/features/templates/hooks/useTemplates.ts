/**
 * Templates hooks
 * Provides TanStack Query hooks for templates module
 * Following frontend-api.md rules
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listTemplates, 
  getTemplate, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  renderTemplate,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listVersions,
  getVersion,
} from "~/features/templates/api/templates.api";
import type { 
  TemplateCreate, 
  TemplateUpdate, 
  TemplateListParams,
  TemplateCategoryCreate,
  TemplateCategoryUpdate,
  TemplateRenderRequest,
  TemplateVersionListParams,
} from "~/features/templates/types/template.types";

// Templates Query hooks
export function useTemplates(params?: TemplateListParams) {
  return useQuery({
    queryKey: ["templates", params],
    queryFn: () => listTemplates(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => getTemplate(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id,
  });
}

// Templates Mutation hooks
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      // Invalidate templates list queries
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error) => {
      console.error("Failed to create template:", error);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TemplateUpdate }) =>
      updateTemplate(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific template and list queries
      queryClient.invalidateQueries({ queryKey: ["templates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error) => {
      console.error("Failed to update template:", error);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      // Invalidate templates list queries
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error) => {
      console.error("Failed to delete template:", error);
    },
  });
}

// Template Render hook
export function useRenderTemplate() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TemplateRenderRequest }) =>
      renderTemplate(id, payload),
    onError: (error) => {
      console.error("Failed to render template:", error);
    },
  });
}

// Template Categories Query hooks
export function useTemplateCategories() {
  return useQuery({
    queryKey: ["template-categories"],
    queryFn: () => listCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

// Template Categories Mutation hooks
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Invalidate categories list queries
      queryClient.invalidateQueries({ queryKey: ["template-categories"] });
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TemplateCategoryUpdate }) =>
      updateCategory(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate categories list queries
      queryClient.invalidateQueries({ queryKey: ["template-categories"] });
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      // Invalidate categories list queries
      queryClient.invalidateQueries({ queryKey: ["template-categories"] });
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
    },
  });
}

// Template Versions Query hooks
export function useTemplateVersions(id: string, params?: TemplateVersionListParams) {
  return useQuery({
    queryKey: ["template-versions", id, params],
    queryFn: () => listVersions(id, params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id,
  });
}

export function useTemplateVersion(id: string, version: number) {
  return useQuery({
    queryKey: ["template-versions", id, version],
    queryFn: () => getVersion(id, version),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id && !!version,
  });
}
