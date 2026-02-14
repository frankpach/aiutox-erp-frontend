import apiClient from "~/lib/api/client";
import type { StandardListResponse } from "~/lib/api/types/common.types";

import type { CrmListParams, Lead, Opportunity, Pipeline } from "../types/crm.types";

export async function listPipelines(
  params?: Pick<CrmListParams, "page" | "page_size">,
): Promise<StandardListResponse<Pipeline>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());

  const qs = searchParams.toString();
  const response = await apiClient.get<StandardListResponse<Pipeline>>(
    `/api/v1/crm/pipelines${qs ? `?${qs}` : ""}`,
  );
  return response.data;
}

export async function listLeads(
  params?: CrmListParams,
): Promise<StandardListResponse<Lead>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.pipeline_id) searchParams.append("pipeline_id", params.pipeline_id);

  const qs = searchParams.toString();
  const response = await apiClient.get<StandardListResponse<Lead>>(
    `/api/v1/crm/leads${qs ? `?${qs}` : ""}`,
  );
  return response.data;
}

export async function listOpportunities(
  params?: CrmListParams,
): Promise<StandardListResponse<Opportunity>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.pipeline_id) searchParams.append("pipeline_id", params.pipeline_id);

  const qs = searchParams.toString();
  const response = await apiClient.get<StandardListResponse<Opportunity>>(
    `/api/v1/crm/opportunities${qs ? `?${qs}` : ""}`,
  );
  return response.data;
}
