/**
 * Product types
 * Type definitions for Products module
 */

import type { StandardListResponse } from "~/lib/api/types/common.types";

// Product list parameters
export interface ProductListParams {
  page?: number;
  page_size?: number;
  category_id?: string;
  search?: string;
  is_active?: boolean;
  track_inventory?: boolean;
}

// Base Product entity
export interface Product {
  id: string;
  tenant_id: string;
  category_id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  currency: string;
  weight?: number;
  dimensions?: ProductDimensions;
  track_inventory: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ProductCategory;
  variants?: ProductVariant[];
  barcodes?: ProductBarcode[];
}

// Product creation payload
export interface ProductCreate {
  category_id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  currency: string;
  weight?: number;
  dimensions?: ProductDimensions;
  track_inventory: boolean;
  is_active?: boolean;
}

// Product update payload
export interface ProductUpdate {
  category_id?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  currency?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  track_inventory?: boolean;
  is_active?: boolean;
}

// Product dimensions
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string; // cm, in, etc.
}

// Product category
export interface ProductCategory {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product category creation payload
export interface ProductCategoryCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

// Product category update payload
export interface ProductCategoryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Product variant
export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  attributes: Record<string, string | number>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product variant creation payload
export interface ProductVariantCreate {
  sku: string;
  name: string;
  price: number;
  cost: number;
  attributes: Record<string, string | number>;
  is_active?: boolean;
}

// Product variant update payload
export interface ProductVariantUpdate {
  sku?: string;
  name?: string;
  price?: number;
  cost?: number;
  attributes?: Record<string, string | number>;
  is_active?: boolean;
}

// Product barcode
export interface ProductBarcode {
  id: string;
  tenant_id: string;
  product_id: string;
  variant_id?: string;
  barcode: string;
  barcode_type: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Product barcode creation payload
export interface ProductBarcodeCreate {
  barcode: string;
  barcode_type: string;
  is_primary?: boolean;
  variant_id?: string;
}

// Product barcode update payload
export interface ProductBarcodeUpdate {
  barcode?: string;
  barcode_type?: string;
  is_primary?: boolean;
  variant_id?: string;
}

// Product list parameters
export interface ProductListParams {
  page?: number;
  page_size?: number;
  category_id?: string;
  search?: string;
  is_active?: boolean;
  track_inventory?: boolean;
}

// Product list response
export type ProductListResponse = StandardListResponse<Product>;

// Category list response
export type CategoryListResponse = StandardListResponse<ProductCategory>;

// Variant list response
export type VariantListResponse = StandardListResponse<ProductVariant>;

// Barcode list response
export type BarcodeListResponse = StandardListResponse<ProductBarcode>;

// Product search result
export interface ProductSearchResult {
  product: Product;
  variant?: ProductVariant;
  match_type: "product" | "variant" | "barcode";
  match_score: number;
}

// Barcode lookup result
export interface BarcodeLookupResult {
  product: Product;
  variant?: ProductVariant;
  barcode: ProductBarcode;
}

// Product inventory info
export interface ProductInventory {
  product_id: string;
  variant_id?: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_total: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  last_updated: string;
}

// Product statistics
export interface ProductStats {
  total_products: number;
  active_products: number;
  total_categories: number;
  active_categories: number;
  total_variants: number;
  active_variants: number;
  total_barcodes: number;
  low_stock_products: number;
  out_of_stock_products: number;
}

// Product bulk operations
export interface ProductBulkOperation {
  operation: "update" | "delete" | "activate" | "deactivate";
  product_ids: string[];
  data?: Partial<ProductUpdate>;
}

// Product import/export
export interface ProductImport {
  sku: string;
  name: string;
  category_name: string;
  description?: string;
  price: number;
  cost: number;
  currency: string;
  weight?: number;
  dimensions?: ProductDimensions;
  track_inventory?: boolean;
  is_active?: boolean;
}

export interface ProductExport {
  id: string;
  sku: string;
  name: string;
  category_name: string;
  description?: string;
  price: number;
  cost: number;
  currency: string;
  weight?: number;
  dimensions?: ProductDimensions;
  track_inventory: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product filter options
export interface ProductFilterOptions {
  categories: ProductCategory[];
  price_range: {
    min: number;
    max: number;
  };
  weight_range: {
    min: number;
    max: number;
  };
  has_variants: boolean;
  has_barcodes: boolean;
  inventory_status: "in_stock" | "low_stock" | "out_of_stock" | "all";
}

// Product validation errors
export interface ProductValidationError {
  field: string;
  message: string;
  code: string;
}

// Product operation result
export interface ProductOperationResult {
  success: boolean;
  product?: Product;
  errors?: ProductValidationError[];
  warnings?: string[];
}
