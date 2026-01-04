/**
 * Tests for useThemeConfig hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useThemeConfig } from "../useThemeConfig";
import apiClient from "~/lib/api/client";

// Mock apiClient
vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock config API
vi.mock("~/features/config/api/config.api", () => ({
  getThemeConfig: vi.fn(),
  setThemeConfig: vi.fn(),
  updateThemeConfigProperty: vi.fn(),
}));

// Mock document.documentElement.style.setProperty
const mockSetProperty = vi.fn();
const mockGetProperty = vi.fn();

// Mock document.querySelector for favicon
const mockQuerySelector = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Reset DOM mocks
  Object.defineProperty(document, "documentElement", {
    value: {
      style: {
        setProperty: mockSetProperty,
        getPropertyValue: mockGetProperty,
      },
    },
    writable: true,
  });

  Object.defineProperty(document, "querySelector", {
    value: mockQuerySelector,
    writable: true,
  });

  // Mock favicon link element
  mockQuerySelector.mockReturnValue({
    href: "",
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Helper to create QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) => {
    // Use createElement to avoid JSX in .ts file
    const React = require("react");
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useThemeConfig", () => {
  describe("fetching theme configuration", () => {
    it("should fetch theme config successfully", async () => {
      const mockThemeData = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
            secondary_color: "#DC004E",
            accent_color: "#FFC107",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockThemeData,
      } as any);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toEqual(mockThemeData.data.config);
      expect(result.current.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith("/config/app_theme");
    });

    it("should handle loading state", async () => {
      vi.mocked(apiClient.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: {
                  data: {
                    module: "app_theme",
                    config: {},
                  },
                },
              } as any);
            }, 100);
          })
      );

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should handle fetch error", async () => {
      const mockError = new Error("Failed to fetch theme");
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.theme).toEqual({});
      expect(result.current.isLoading).toBe(false);
    });

    it("should return empty config when no theme data", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          data: {
            module: "app_theme",
            config: {},
          },
        },
      } as any);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toEqual({});
    });
  });

  describe("applying theme to CSS", () => {
    it("should apply theme colors to CSS variables", async () => {
      const mockThemeData = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
            secondary_color: "#DC004E",
            text_primary: "#212121",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockThemeData,
      } as any);

      renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSetProperty).toHaveBeenCalled();
      });

      // Verify CSS variables were set
      expect(mockSetProperty).toHaveBeenCalledWith("--color-primary", "#1976D2");
      expect(mockSetProperty).toHaveBeenCalledWith("--color-secondary", "#DC004E");
      expect(mockSetProperty).toHaveBeenCalledWith("--color-text-primary", "#212121");
    });

    it("should update favicon when provided", async () => {
      const mockThemeData = {
        data: {
          module: "app_theme",
          config: {
            favicon: "/assets/logos/favicon.ico",
          },
        },
      };

      const mockFaviconLink = {
        href: "",
      };

      mockQuerySelector.mockReturnValue(mockFaviconLink);

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockThemeData,
      } as any);

      renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockQuerySelector).toHaveBeenCalledWith("link[rel~='icon']");
      });

      expect(mockFaviconLink.href).toBe("/assets/logos/favicon.ico");
    });

    it("should not apply CSS variables for unmapped keys", async () => {
      const mockThemeData = {
        data: {
          module: "app_theme",
          config: {
            unknown_key: "#000000",
            primary_color: "#1976D2",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockThemeData,
      } as any);

      renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSetProperty).toHaveBeenCalled();
      });

      // Should only set mapped keys
      expect(mockSetProperty).toHaveBeenCalledWith("--color-primary", "#1976D2");
      expect(mockSetProperty).not.toHaveBeenCalledWith(
        expect.any(String),
        "#000000"
      );
    });
  });

  describe("updating theme", () => {
    it("should update theme successfully", async () => {
      const initialTheme = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
          },
        },
      };

      const updatedTheme = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#FF5733",
            secondary_color: "#DC004E",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: initialTheme,
      } as any);

      vi.mocked(apiClient.post).mockResolvedValue({
        data: updatedTheme,
      } as any);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update theme
      const newConfig = {
        primary_color: "#FF5733",
        secondary_color: "#DC004E",
      };

      result.current.updateTheme(newConfig);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(apiClient.post).toHaveBeenCalledWith("/config/app_theme", newConfig);
    });

    it("should handle update error", async () => {
      const initialTheme = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: initialTheme,
      } as any);

      const mockError = new Error("Failed to update theme");
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.updateTheme({ primary_color: "#FF5733" });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      // Theme should remain unchanged on error
      expect(result.current.theme.primary_color).toBe("#1976D2");
    });

    it("should show updating state during mutation", async () => {
      const initialTheme = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: initialTheme,
      } as any);

      // Mock setThemeConfig function
      const { setThemeConfig } = await import("~/features/config/api/config.api");
      vi.mocked(setThemeConfig).mockResolvedValue({
        module: "app_theme",
        config: { primary_color: "#FF5733" },
      } as any);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Use act to wrap the state update
      await act(async () => {
        result.current.updateTheme({ primary_color: "#FF5733" });
      });

      // Wait for the mutation to complete
      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      // Verify the theme was updated successfully
      expect(result.current.theme.primary_color).toBe("#FF5733");
    });
  });

  describe("updating single theme property", () => {
    it("should update single property successfully", async () => {
      const initialTheme = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: initialTheme,
      } as any);

      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          value: "#FF5733",
        },
      } as any);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.updateThemeProperty({
        key: "primary_color",
        value: "#FF5733",
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(apiClient.put).toHaveBeenCalledWith("/config/app_theme/primary_color", {
        value: "#FF5733",
      });
    });

    it("should refetch theme after updating property", async () => {
      const initialTheme = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
          },
        },
      };

      const updatedTheme = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#FF5733",
          },
        },
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({
          data: initialTheme,
        } as any)
        .mockResolvedValueOnce({
          data: updatedTheme,
        } as any);

      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          value: "#FF5733",
        },
      } as any);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.updateThemeProperty({
        key: "primary_color",
        value: "#FF5733",
      });

      await waitFor(() => {
        // Should refetch after update
        expect(apiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("theme caching", () => {
    it("should cache theme data", async () => {
      const mockThemeData = {
        data: {
          module: "app_theme",
          config: {
            primary_color: "#1976D2",
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockThemeData,
      } as any);

      const { result, rerender } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Rerender should not trigger new fetch due to cache
      rerender();

      // Should only fetch once due to cache
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });
});

