import { useQuery } from "@tanstack/react-query";

import { listLeads, listOpportunities, listPipelines } from "../api/crm.api";
import type { CrmListParams } from "../types/crm.types";

export const crmKeys = {
  all: ["crm"] as const,
  pipelines: (params?: Pick<CrmListParams, "page" | "page_size">) => [...crmKeys.all, "pipelines", params] as const,
  leads: (params?: CrmListParams) => [...crmKeys.all, "leads", params] as const,
  opportunities: (params?: CrmListParams) => [...crmKeys.all, "opportunities", params] as const,
};

export function usePipelines(params?: Pick<CrmListParams, "page" | "page_size">) {
  return useQuery({
    queryKey: crmKeys.pipelines(params),
    queryFn: () => listPipelines(params),
  });
}

export function useLeads(params?: CrmListParams) {
  return useQuery({
    queryKey: crmKeys.leads(params),
    queryFn: () => listLeads(params),
  });
}

export function useOpportunities(params?: CrmListParams) {
  return useQuery({
    queryKey: crmKeys.opportunities(params),
    queryFn: () => listOpportunities(params),
  });
}
