/**
 * Products hooks
 * TanStack Query hooks for Products module
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { StandardResponse } from "~/lib/api/types/common.types";
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductCategory,
  ProductCategoryCreate,
  ProductCategoryUpdate,
  ProductListParams,
  ProductVariantCreate,
  ProductVariantUpdate,
  ProductBarcodeCreate,
  ProductBarcodeUpdate,
  ProductBulkOperation,
  BarcodeLookupResult,
  ProductStats,
} from "../types/product.types";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  listVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  findByBarcode,
  listBarcodes,
  createBarcode,
  updateBarcode,
  deleteBarcode,
  getProductStats,
  bulkOperation,
  exportProducts,
  importProducts,
  searchProducts,
} from "../api/products.api";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, "categories"] as const,
  category: (id: string) => [...productKeys.categories(), id] as const,
  variants: (productId: string) => [...productKeys.detail(productId), "variants"] as const,
  barcodes: (productId: string) => [...productKeys.detail(productId), "barcodes"] as const,
  barcode: (barcode: string) => [...productKeys.all, "barcode", barcode] as const,
  stats: () => [...productKeys.all, "stats"] as const,
  search: (query: string, params?: ProductListParams) => [...productKeys.all, "search", query, params] as const,
};

/**
 * Products hooks
 */

/**
 * Hook for listing products with pagination and filters
 * @param params - Query parameters
 * @returns Query result with products list
 */
export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting a single product by ID
 * @param id - Product ID
 * @returns Query result with product details
 */
export function useProduct(id: string): ReturnType<typeof useQuery<StandardResponse<Product>>> {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for creating a new product
 * @returns Mutation result for product creation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCreate) => createProduct(payload),
    onSuccess: () => {
      // Invalidate products list cache
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate stats cache
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

/**
 * Hook for updating an existing product
 * @returns Mutation result for product update
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdate }) => 
      updateProduct(id, payload),
    onSuccess: (_, { id }) => {
      // Invalidate specific product cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      // Invalidate products list cache
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate stats cache
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

/**
 * Hook for deleting a product
 * @returns Mutation result for product deletion
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      // Invalidate products list cache
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate stats cache
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

/**
 * Categories hooks
 */

/**
 * Hook for listing all product categories
 * @returns Query result with categories list
 */
export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => listCategories(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for getting a single category by ID
 * @param id - Category ID
 * @returns Query result with category details
 */
export function useProductCategory(id: string): ReturnType<typeof useQuery<StandardResponse<ProductCategory>>> {
  return useQuery({
    queryKey: productKeys.category(id),
    queryFn: () => getCategory(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for creating a new category
 * @returns Mutation result for category creation
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCategoryCreate) => createCategory(payload),
    onSuccess: () => {
      // Invalidate categories list cache
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
    },
  });
}

/**
 * Hook for updating an existing category
 * @returns Mutation result for category update
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductCategoryUpdate }) => 
      updateCategory(id, payload),
    onSuccess: (_, { id }) => {
      // Invalidate specific category cache
      queryClient.invalidateQueries({ queryKey: productKeys.category(id) });
      // Invalidate categories list cache
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
    },
  });
}

/**
 * Hook for deleting a category
 * @returns Mutation result for category deletion
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      // Invalidate categories list cache
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
    },
  });
}

/**
 * Variants hooks
 */

/**
 * Hook for listing variants for a product
 * @param productId - Product ID
 * @returns Query result with variants list
 */
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: () => listVariants(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating a new product variant
 * @param productId - Product ID
 * @returns Mutation result for variant creation
 */
export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductVariantCreate) => createVariant(productId, payload),
    onSuccess: () => {
      // Invalidate variants cache for this product
      queryClient.invalidateQueries({ queryKey: productKeys.variants(productId) });
      // Invalidate product details cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Hook for updating an existing variant
 * @param productId - Product ID
 * @returns Mutation result for variant update
 */
export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: ProductVariantUpdate }) => 
      updateVariant(variantId, payload),
    onSuccess: () => {
      // Invalidate variants cache for this product
      queryClient.invalidateQueries({ queryKey: productKeys.variants(productId) });
      // Invalidate product details cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Hook for deleting a variant
 * @param productId - Product ID
 * @returns Mutation result for variant deletion
 */
export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => deleteVariant(variantId),
    onSuccess: () => {
      // Invalidate variants cache for this product
      queryClient.invalidateQueries({ queryKey: productKeys.variants(productId) });
      // Invalidate product details cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Barcodes hooks
 */

/**
 * Hook for finding product by barcode
 * @param barcode - Barcode string
 * @returns Query result with barcode lookup
 */
export function useFindByBarcode(barcode: string): ReturnType<typeof useQuery<StandardResponse<BarcodeLookupResult>>> {
  return useQuery({
    queryKey: productKeys.barcode(barcode),
    queryFn: () => findByBarcode(barcode),
    enabled: !!barcode,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for listing barcodes for a product
 * @param productId - Product ID
 * @returns Query result with barcodes list
 */
export function useProductBarcodes(productId: string) {
  return useQuery({
    queryKey: productKeys.barcodes(productId),
    queryFn: () => listBarcodes(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating a new barcode
 * @param productId - Product ID
 * @returns Mutation result for barcode creation
 */
export function useCreateBarcode(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductBarcodeCreate) => createBarcode(productId, payload),
    onSuccess: () => {
      // Invalidate barcodes cache for this product
      queryClient.invalidateQueries({ queryKey: productKeys.barcodes(productId) });
      // Invalidate product details cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Hook for updating an existing barcode
 * @param productId - Product ID
 * @returns Mutation result for barcode update
 */
export function useUpdateBarcode(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ barcodeId, payload }: { barcodeId: string; payload: ProductBarcodeUpdate }) => 
      updateBarcode(barcodeId, payload),
    onSuccess: () => {
      // Invalidate barcodes cache for this product
      queryClient.invalidateQueries({ queryKey: productKeys.barcodes(productId) });
      // Invalidate product details cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Hook for deleting a barcode
 * @param productId - Product ID
 * @returns Mutation result for barcode deletion
 */
export function useDeleteBarcode(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (barcodeId: string) => deleteBarcode(barcodeId),
    onSuccess: () => {
      // Invalidate barcodes cache for this product
      queryClient.invalidateQueries({ queryKey: productKeys.barcodes(productId) });
      // Invalidate product details cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Advanced operations hooks
 */

/**
 * Hook for getting product statistics
 * @returns Query result with product stats
 */
export function useProductStats(): ReturnType<typeof useQuery<StandardResponse<ProductStats>>> {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => getProductStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for performing bulk operations on products
 * @returns Mutation result for bulk operations
 */
export function useBulkOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductBulkOperation) => bulkOperation(payload),
    onSuccess: () => {
      // Invalidate all products caches
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      // Invalidate stats cache
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

/**
 * Hook for exporting products
 * @returns Mutation result for product export
 */
export function useExportProducts() {
  return useMutation({
    mutationFn: (params?: ProductListParams) => exportProducts(params),
  });
}

/**
 * Hook for importing products
 * @returns Mutation result for product import
 */
export function useImportProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importProducts(file),
    onSuccess: () => {
      // Invalidate all products caches
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      // Invalidate stats cache
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

/**
 * Hook for searching products
 * @param query - Search query
 * @param params - Additional search parameters
 * @returns Query result with search results
 */
export function useSearchProducts(query: string, params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.search(query, params),
    queryFn: () => searchProducts(query, params),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
