/**
 * Products API
 * API functions for Products module
 */

import apiClient from "~/lib/api/client";
import type { StandardResponse, StandardListResponse } from "~/lib/api/types/common.types";
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductCategory,
  ProductCategoryCreate,
  ProductCategoryUpdate,
  ProductVariant,
  ProductVariantCreate,
  ProductVariantUpdate,
  ProductBarcode,
  ProductBarcodeCreate,
  ProductBarcodeUpdate,
  ProductListParams,
  BarcodeLookupResult,
  ProductStats,
  ProductBulkOperation,
} from "../types/product.types";

/**
 * Products API
 */

/**
 * List products with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<StandardListResponse<Product>>
 */
export async function listProducts(params?: ProductListParams): Promise<StandardListResponse<Product>> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
  if (params?.category_id) searchParams.append("category_id", params.category_id);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());
  if (params?.track_inventory !== undefined) searchParams.append("track_inventory", params.track_inventory.toString());

  const response = await apiClient.get<StandardListResponse<Product>>(
    `/api/v1/products?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * Get a single product by ID
 * @param id - Product ID
 * @returns Promise<StandardResponse<Product>>
 */
export async function getProduct(id: string): Promise<StandardResponse<Product>> {
  const response = await apiClient.get<StandardResponse<Product>>(`/api/v1/products/${id}`);
  return response.data;
}

/**
 * Create a new product
 * @param payload - Product creation data
 * @returns Promise<StandardResponse<Product>>
 */
export async function createProduct(payload: ProductCreate): Promise<StandardResponse<Product>> {
  const response = await apiClient.post<StandardResponse<Product>>("/api/v1/products", payload);
  return response.data;
}

/**
 * Update an existing product
 * @param id - Product ID
 * @param payload - Product update data
 * @returns Promise<StandardResponse<Product>>
 */
export async function updateProduct(id: string, payload: ProductUpdate): Promise<StandardResponse<Product>> {
  const response = await apiClient.patch<StandardResponse<Product>>(`/api/v1/products/${id}`, payload);
  return response.data;
}

/**
 * Delete a product (soft delete)
 * @param id - Product ID
 * @returns Promise<StandardResponse<void>>
 */
export async function deleteProduct(id: string): Promise<StandardResponse<void>> {
  const response = await apiClient.delete<StandardResponse<void>>(`/api/v1/products/${id}`);
  return response.data;
}

/**
 * Categories API
 */

/**
 * List all product categories
 * @returns Promise<StandardListResponse<ProductCategory>>
 */
export async function listCategories(): Promise<StandardListResponse<ProductCategory>> {
  const response = await apiClient.get<StandardListResponse<ProductCategory>>("/api/v1/products/categories");
  return response.data;
}

/**
 * Create a new product category
 * @param payload - Category creation data
 * @returns Promise<StandardResponse<ProductCategory>>
 */
export async function createCategory(payload: ProductCategoryCreate): Promise<StandardResponse<ProductCategory>> {
  const response = await apiClient.post<StandardResponse<ProductCategory>>("/api/v1/products/categories", payload);
  return response.data;
}

/**
 * Get a single category by ID
 * @param id - Category ID
 * @returns Promise<StandardResponse<ProductCategory>>
 */
export async function getCategory(id: string): Promise<StandardResponse<ProductCategory>> {
  const response = await apiClient.get<StandardResponse<ProductCategory>>(`/api/v1/products/categories/${id}`);
  return response.data;
}

/**
 * Update an existing category
 * @param id - Category ID
 * @param payload - Category update data
 * @returns Promise<StandardResponse<ProductCategory>>
 */
export async function updateCategory(id: string, payload: ProductCategoryUpdate): Promise<StandardResponse<ProductCategory>> {
  const response = await apiClient.patch<StandardResponse<ProductCategory>>(`/api/v1/products/categories/${id}`, payload);
  return response.data;
}

/**
 * Delete a category
 * @param id - Category ID
 * @returns Promise<StandardResponse<void>>
 */
export async function deleteCategory(id: string): Promise<StandardResponse<void>> {
  const response = await apiClient.delete<StandardResponse<void>>(`/api/v1/products/categories/${id}`);
  return response.data;
}

/**
 * Variants API
 */

/**
 * List variants for a product
 * @param productId - Product ID
 * @returns Promise<StandardListResponse<ProductVariant>>
 */
export async function listVariants(productId: string): Promise<StandardListResponse<ProductVariant>> {
  const response = await apiClient.get<StandardListResponse<ProductVariant>>(`/api/v1/products/${productId}/variants`);
  return response.data;
}

/**
 * Create a new product variant
 * @param productId - Product ID
 * @param payload - Variant creation data
 * @returns Promise<StandardResponse<ProductVariant>>
 */
export async function createVariant(productId: string, payload: ProductVariantCreate): Promise<StandardResponse<ProductVariant>> {
  const response = await apiClient.post<StandardResponse<ProductVariant>>(`/api/v1/products/${productId}/variants`, payload);
  return response.data;
}

/**
 * Update an existing variant
 * @param variantId - Variant ID
 * @param payload - Variant update data
 * @returns Promise<StandardResponse<ProductVariant>>
 */
export async function updateVariant(variantId: string, payload: ProductVariantUpdate): Promise<StandardResponse<ProductVariant>> {
  const response = await apiClient.patch<StandardResponse<ProductVariant>>(`/api/v1/products/variants/${variantId}`, payload);
  return response.data;
}

/**
 * Delete a variant
 * @param variantId - Variant ID
 * @returns Promise<StandardResponse<void>>
 */
export async function deleteVariant(variantId: string): Promise<StandardResponse<void>> {
  const response = await apiClient.delete<StandardResponse<void>>(`/api/v1/products/variants/${variantId}`);
  return response.data;
}

/**
 * Barcodes API
 */

/**
 * Find product by barcode
 * @param barcode - Barcode string
 * @returns Promise<StandardResponse<BarcodeLookupResult>>
 */
export async function findByBarcode(barcode: string): Promise<StandardResponse<BarcodeLookupResult>> {
  const response = await apiClient.get<StandardResponse<BarcodeLookupResult>>(`/api/v1/products/by-barcode/${barcode}`);
  return response.data;
}

/**
 * List barcodes for a product
 * @param productId - Product ID
 * @returns Promise<StandardListResponse<ProductBarcode>>
 */
export async function listBarcodes(productId: string): Promise<StandardListResponse<ProductBarcode>> {
  const response = await apiClient.get<StandardListResponse<ProductBarcode>>(`/api/v1/products/${productId}/barcodes`);
  return response.data;
}

/**
 * Create a new barcode
 * @param productId - Product ID
 * @param payload - Barcode creation data
 * @returns Promise<StandardResponse<ProductBarcode>>
 */
export async function createBarcode(productId: string, payload: ProductBarcodeCreate): Promise<StandardResponse<ProductBarcode>> {
  const response = await apiClient.post<StandardResponse<ProductBarcode>>(`/api/v1/products/${productId}/barcodes`, payload);
  return response.data;
}

/**
 * Update an existing barcode
 * @param barcodeId - Barcode ID
 * @param payload - Barcode update data
 * @returns Promise<StandardResponse<ProductBarcode>>
 */
export async function updateBarcode(barcodeId: string, payload: ProductBarcodeUpdate): Promise<StandardResponse<ProductBarcode>> {
  const response = await apiClient.patch<StandardResponse<ProductBarcode>>(`/api/v1/products/barcodes/${barcodeId}`, payload);
  return response.data;
}

/**
 * Delete a barcode
 * @param barcodeId - Barcode ID
 * @returns Promise<StandardResponse<void>>
 */
export async function deleteBarcode(barcodeId: string): Promise<StandardResponse<void>> {
  const response = await apiClient.delete<StandardResponse<void>>(`/api/v1/products/barcodes/${barcodeId}`);
  return response.data;
}

/**
 * Advanced operations API
 */

/**
 * Get product statistics
 * @returns Promise<StandardResponse<ProductStats>>
 */
export async function getProductStats(): Promise<StandardResponse<ProductStats>> {
  const response = await apiClient.get<StandardResponse<ProductStats>>("/api/v1/products/stats");
  return response.data;
}

/**
 * Perform bulk operations on products
 * @param payload - Bulk operation data
 * @returns Promise<StandardResponse<Product[]>>
 */
export async function bulkOperation(payload: ProductBulkOperation): Promise<StandardResponse<Product[]>> {
  const response = await apiClient.post<StandardResponse<Product[]>>("/api/v1/products/bulk", payload);
  return response.data;
}

/**
 * Export products
 * @param params - Export parameters
 * @returns Promise<Blob>
 */
export async function exportProducts(params?: ProductListParams): Promise<Blob> {
  const searchParams = new URLSearchParams();
  
  if (params?.category_id) searchParams.append("category_id", params.category_id);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());
  if (params?.track_inventory !== undefined) searchParams.append("track_inventory", params.track_inventory.toString());

  const response = await apiClient.get(`/api/v1/products/export?${searchParams.toString()}`, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * Import products
 * @param file - CSV/Excel file
 * @returns Promise<StandardResponse<{ imported: number; errors: string[] }>>
 */
export async function importProducts(file: File): Promise<StandardResponse<{ imported: number; errors: string[] }>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<StandardResponse<{ imported: number; errors: string[] }>>(
    "/api/v1/products/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

/**
 * Search products across all fields
 * @param query - Search query
 * @param params - Additional search parameters
 * @returns Promise<StandardListResponse<Product>>
 */
export async function searchProducts(query: string, params?: ProductListParams): Promise<StandardListResponse<Product>> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);
  
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
  if (params?.category_id) searchParams.append("category_id", params.category_id);
  if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());

  const response = await apiClient.get<StandardListResponse<Product>>(`/api/v1/products/search?${searchParams.toString()}`);
  return response.data;
}
