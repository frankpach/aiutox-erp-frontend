import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "~/lib/api/client";
import { listStockMoves, listWarehouses } from "../api/inventory.api";

vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("inventory.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls listWarehouses with pagination params", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null },
    });

    await listWarehouses({ page: 1, page_size: 20 });

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/inventory/warehouses?page=1&page_size=20");
  });

  it("calls listStockMoves without query string when params are empty", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null },
    });

    await listStockMoves();

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/inventory/stock-moves");
  });
});
