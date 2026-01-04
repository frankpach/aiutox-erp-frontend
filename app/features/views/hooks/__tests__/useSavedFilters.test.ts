/**
 * Tests for useSavedFilters hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSavedFilters } from "../useSavedFilters";
import * as savedFiltersApi from "../../api/savedFilters.api";
import type { SavedFilter, FilterOperator } from "../../types/savedFilter.types";

// Mock the API module
vi.mock("../../api/savedFilters.api");

describe("useSavedFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useSavedFilters("users", false));

    expect(result.current.filters).toEqual([]);
    expect(result.current.defaultFilter).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should load filters automatically when autoLoad is true", async () => {
    const mockFilters: SavedFilter[] = [
      {
        id: "1",
        tenant_id: "tenant-1",
        name: "Test Filter",
        description: null,
        module: "users",
        filters: { email: { operator: "contains", value: "test" } },
        is_default: false,
        is_shared: false,
        created_by: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ];

    vi.mocked(savedFiltersApi.getSavedFilters).mockResolvedValue({
      data: mockFilters,
      meta: {
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      error: null,
    });

    const { result } = renderHook(() => useSavedFilters("users", true));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(result.current.filters).toEqual(mockFilters);
    });

    // The hook calls listFilters with only module, API has defaults for page and page_size
    expect(savedFiltersApi.getSavedFilters).toHaveBeenCalledWith({
      module: "users",
    });
  });

  it("should handle errors when loading filters", async () => {
    const error = new Error("Failed to load filters");
    vi.mocked(savedFiltersApi.getSavedFilters).mockRejectedValue(error);

    const { result } = renderHook(() => useSavedFilters("users", true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.filters).toEqual([]);
  });

  it("should create a filter", async () => {
    const mockFilter: SavedFilter = {
      id: "1",
      tenant_id: "tenant-1",
      name: "New Filter",
      description: null,
      module: "users",
      filters: { email: { operator: "eq", value: "test@example.com" } },
      is_default: false,
      is_shared: false,
      created_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };

    vi.mocked(savedFiltersApi.createSavedFilter).mockResolvedValue({
      data: mockFilter,
      meta: null,
      error: null,
    });

    const { result } = renderHook(() => useSavedFilters("users", false));

    const filterData = {
      name: "New Filter",
      module: "users",
      filters: { email: { operator: "eq" as FilterOperator, value: "test@example.com" } },
    };

    let created: SavedFilter | null = null;
    await act(async () => {
      created = await result.current.createFilter(filterData);
    });

    expect(created).toEqual(mockFilter);
    expect(savedFiltersApi.createSavedFilter).toHaveBeenCalledWith(filterData);
    // Check that the filter was added to local state
    expect(result.current.filters).toContainEqual(mockFilter);
  });

  it("should get default filter for a module", async () => {
    const mockFilters: SavedFilter[] = [
      {
        id: "1",
        tenant_id: "tenant-1",
        name: "Default Filter",
        description: null,
        module: "users",
        filters: {},
        is_default: true,
        is_shared: false,
        created_by: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "2",
        tenant_id: "tenant-1",
        name: "Other Filter",
        description: null,
        module: "users",
        filters: {},
        is_default: false,
        is_shared: false,
        created_by: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ];

    vi.mocked(savedFiltersApi.getSavedFilters).mockResolvedValue({
      data: mockFilters,
      meta: {
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      error: null,
    });

    const { result } = renderHook(() => useSavedFilters("users", true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const defaultFilter = result.current.getDefaultFilter("users");
    expect(defaultFilter).toEqual(mockFilters[0]);
    expect(defaultFilter?.is_default).toBe(true);
  });

  it("should get my filters (not shared)", async () => {
    const mockFilters: SavedFilter[] = [
      {
        id: "1",
        tenant_id: "tenant-1",
        name: "My Filter",
        description: null,
        module: "users",
        filters: {},
        is_default: false,
        is_shared: false,
        created_by: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "2",
        tenant_id: "tenant-1",
        name: "Shared Filter",
        description: null,
        module: "users",
        filters: {},
        is_default: false,
        is_shared: true,
        created_by: "user-2",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ];

    vi.mocked(savedFiltersApi.getSavedFilters).mockResolvedValue({
      data: mockFilters,
      meta: {
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      error: null,
    });

    const { result } = renderHook(() => useSavedFilters("users", true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock current user ID
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("user-1");

    const myFilters = result.current.getMyFilters("users");
    expect(myFilters).toHaveLength(1);
    expect(myFilters[0].is_shared).toBe(false);
  });
});


