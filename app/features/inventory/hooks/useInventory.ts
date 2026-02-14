import { useQuery } from "@tanstack/react-query";

import { listStockMoves, listWarehouses } from "../api/inventory.api";
import type { InventoryListParams } from "../types/inventory.types";

export const inventoryKeys = {
  all: ["inventory"] as const,
  warehouses: (params?: InventoryListParams) => [...inventoryKeys.all, "warehouses", params] as const,
  stockMoves: (params?: InventoryListParams) => [...inventoryKeys.all, "stock-moves", params] as const,
};

export function useWarehouses(params?: InventoryListParams) {
  return useQuery({
    queryKey: inventoryKeys.warehouses(params),
    queryFn: () => listWarehouses(params),
  });
}

export function useStockMoves(params?: InventoryListParams) {
  return useQuery({
    queryKey: inventoryKeys.stockMoves(params),
    queryFn: () => listStockMoves(params),
  });
}
