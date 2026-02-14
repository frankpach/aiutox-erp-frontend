export interface InventoryListParams {
  page?: number;
  page_size?: number;
}

export interface Warehouse {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMove {
  id: string;
  tenant_id: string;
  product_id: string;
  from_location_id?: string | null;
  to_location_id?: string | null;
  quantity: string | number;
  unit_cost?: string | number | null;
  move_type: string;
  reference?: string | null;
  created_by?: string | null;
  created_at: string;
}
