import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQuery } from "@tanstack/react-query";

import { listStockMoves, listWarehouses } from "../api/inventory.api";
import { inventoryKeys, useStockMoves, useWarehouses } from "../hooks/useInventory";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../api/inventory.api", () => ({
  listWarehouses: vi.fn(),
  listStockMoves: vi.fn(),
}));

describe("useInventory hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuery).mockReturnValue({} as never);
  });

  it("builds warehouses query key", () => {
    expect(inventoryKeys.warehouses({ page: 1, page_size: 20 })).toEqual([
      "inventory",
      "warehouses",
      { page: 1, page_size: 20 },
    ]);
  });

  it("configures useWarehouses query", async () => {
    const params = { page: 1, page_size: 20 };
    useWarehouses(params);

    expect(useQuery).toHaveBeenCalledTimes(1);
    const config = vi.mocked(useQuery).mock.calls[0]?.[0] as { queryKey: unknown; queryFn?: () => Promise<unknown> };
    expect(config).toBeDefined();
    expect(config.queryKey).toEqual(inventoryKeys.warehouses(params));

    vi.mocked(listWarehouses).mockResolvedValue({ data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null });
    await config.queryFn?.();
    expect(listWarehouses).toHaveBeenCalledWith(params);
  });

  it("configures useStockMoves query", async () => {
    const params = { page: 1, page_size: 20 };
    useStockMoves(params);

    expect(useQuery).toHaveBeenCalledTimes(1);
    const config = vi.mocked(useQuery).mock.calls[0]?.[0] as { queryKey: unknown; queryFn?: () => Promise<unknown> };
    expect(config).toBeDefined();
    expect(config.queryKey).toEqual(inventoryKeys.stockMoves(params));

    vi.mocked(listStockMoves).mockResolvedValue({ data: [], meta: { total: 0, page: 1, page_size: 20, total_pages: 0 }, error: null });
    await config.queryFn?.();
    expect(listStockMoves).toHaveBeenCalledWith(params);
  });
});
