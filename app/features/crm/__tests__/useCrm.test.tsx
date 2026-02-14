import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQuery } from "@tanstack/react-query";
import { listLeads, listPipelines } from "../api/crm.api";
import { crmKeys, useLeads, usePipelines } from "../hooks/useCrm";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../api/crm.api", () => ({
  listPipelines: vi.fn(),
  listLeads: vi.fn(),
  listOpportunities: vi.fn(),
}));

describe("useCrm hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuery).mockReturnValue({} as never);
  });

  it("builds pipelines query key", () => {
    expect(crmKeys.pipelines({ page: 1, page_size: 20 })).toEqual([
      "crm",
      "pipelines",
      { page: 1, page_size: 20 },
    ]);
  });

  it("configures usePipelines query", async () => {
    const params = { page: 1, page_size: 20 };
    usePipelines(params);

    expect(useQuery).toHaveBeenCalledTimes(1);
    const config = vi.mocked(useQuery).mock.calls[0]?.[0] as { queryKey: unknown; queryFn?: () => Promise<unknown> };
    expect(config).toBeDefined();
    expect(config.queryKey).toEqual(crmKeys.pipelines(params));

    vi.mocked(listPipelines).mockResolvedValue({ data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null });
    await config.queryFn?.();
    expect(listPipelines).toHaveBeenCalledWith(params);
  });

  it("configures useLeads query with filters", async () => {
    const params = { page: 1, page_size: 20, status: "new", pipeline_id: "pipeline-1" };
    useLeads(params);

    expect(useQuery).toHaveBeenCalledTimes(1);
    const config = vi.mocked(useQuery).mock.calls[0]?.[0] as { queryKey: unknown; queryFn?: () => Promise<unknown> };
    expect(config).toBeDefined();
    expect(config.queryKey).toEqual(crmKeys.leads(params));

    vi.mocked(listLeads).mockResolvedValue({ data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null });
    await config.queryFn?.();
    expect(listLeads).toHaveBeenCalledWith(params);
  });
});
