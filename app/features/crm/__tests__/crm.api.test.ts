import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "~/lib/api/client";
import { listLeads, listPipelines } from "../api/crm.api";

vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("crm.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls listPipelines with pagination params", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null },
    });

    await listPipelines({ page: 2, page_size: 10 });

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/crm/pipelines?page=2&page_size=10");
  });

  it("calls listLeads with status and pipeline filters", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null },
    });

    await listLeads({ page: 1, page_size: 20, status: "new", pipeline_id: "pipeline-1" });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/crm/leads?page=1&page_size=20&status=new&pipeline_id=pipeline-1",
    );
  });
});
