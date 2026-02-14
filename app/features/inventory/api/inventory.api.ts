import apiClient from "~/lib/api/client";
import type { StandardListResponse } from "~/lib/api/types/common.types";

import type { InventoryListParams, StockMove, Warehouse } from "../types/inventory.types";

export async function listWarehouses(
  params?: InventoryListParams,
): Promise<StandardListResponse<Warehouse>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());

  const qs = searchParams.toString();
  const response = await apiClient.get<StandardListResponse<Warehouse>>(
    `/api/v1/inventory/warehouses${qs ? `?${qs}` : ""}`,
  );
  return response.data;
}

export async function listStockMoves(
  params?: InventoryListParams,
): Promise<StandardListResponse<StockMove>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());

  const qs = searchParams.toString();
  const response = await apiClient.get<StandardListResponse<StockMove>>(
    `/api/v1/inventory/stock-moves${qs ? `?${qs}` : ""}`,
  );
  return response.data;
}
