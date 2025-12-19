/**
 * Common API response types
 *
 * Aligned with backend StandardResponse and StandardListResponse
 * from app/schemas/common.py
 */

/**
 * Standard API response wrapper
 */
export interface StandardResponse<T> {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Standard list response with pagination
 */
export interface StandardListResponse<T> {
  data: T[];
  meta?: PaginationMeta | Record<string, unknown>;
  message?: string;
}

