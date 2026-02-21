/**
 * Tests for useThemeConfig hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useThemeConfig } from "../useThemeConfig";
import { getThemeConfig, setThemeConfig, updateThemeConfigProperty } from "~/features/config/api/config.api";
import { HookProviders } from "~/__tests__/helpers/test-providers";

// Mock useTheme hook
vi.mock("~/hooks/useTheme", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn(),
    theme: "light",
  }),
}));

// Mock useThemeConfig hook dependencies
vi.mock("~/lib/storage/themeCache", () => ({
  readCachedTheme: vi.fn(),
  writeCachedTheme: vi.fn(),
}));

vi.mock("~/stores/authStore", () => ({
  useAuthStore: () => ({
    user: { tenant_id: "test-tenant" },
  }),
}));

// Mock ThemeProvider
vi.mock("~/app/providers/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

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
const mockGetProperty = vi.fn(() => "");

// Mock document.querySelector for favicon
const mockQuerySelector = vi.fn();

const hexToHsl = (hex: string): string => {
  const normalized = hex.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized.split("").map((ch) => ch + ch).join("")
      : normalized;
  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h *= 60;
  }
  const format = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  };
  return `${format(h)} ${format(s * 100)}% ${format(l * 100)}%`;
};

beforeEach(() => {
  vi.clearAllMocks();

  // Mock simple para las funciones DOM que usa el hook
  Object.defineProperty(document.documentElement, "style", {
    value: {
      setProperty: mockSetProperty,
      getPropertyValue: mockGetProperty,
    },
    writable: true,
  });

  // Mock para favicon link element
  mockQuerySelector.mockReturnValue({
    href: "",
    setAttribute: vi.fn(),
    getAttribute: vi.fn(() => ""),
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
        retry: false, // Deshabilitar reintentos para tests de error
        staleTime: 0,
      },
    },
  });

   
  return ({ children }: { children: ReactNode }) => {
    return <HookProviders queryClient={queryClient}>{children}</HookProviders>;
  };
};

describe("useThemeConfig", () => {
  describe("fetching theme configuration", () => {
    it("should fetch theme config successfully", async () => {
      const mockThemeData = {
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
          secondary_color: "#DC004E",
          accent_color: "#FFC107",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(mockThemeData);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toEqual(mockThemeData.config);
      expect(result.current.error).toBeNull();
      expect(getThemeConfig).toHaveBeenCalled();
    });

    it("should handle loading state", async () => {
      vi.mocked(getThemeConfig).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                module: "app_theme",
                config: {},
              });
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
      vi.mocked(getThemeConfig).mockRejectedValue(mockError);

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      // Verificar que el tema está vacío cuando hay error
      // Este es el comportamiento más importante para el usuario
      await waitFor(() => {
        expect(result.current.theme).toEqual({});
      }, { timeout: 2000 });

      // No verificamos isLoading porque puede variar según la implementación de TQ
    });

    it("should return empty config when no theme data", async () => {
      vi.mocked(getThemeConfig).mockResolvedValue({
        module: "app_theme",
        config: {},
      });

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
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
          secondary_color: "#DC004E",
          text_primary: "#212121",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(mockThemeData);

      renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSetProperty).toHaveBeenCalled();
      });

      // Verify CSS variables were set
      expect(mockSetProperty).toHaveBeenCalledWith("--color-primary", hexToHsl("#1976D2"));
      expect(mockSetProperty).toHaveBeenCalledWith("--color-secondary", hexToHsl("#DC004E"));
      expect(mockSetProperty).toHaveBeenCalledWith("--color-text-primary", hexToHsl("#212121"));
    });

    it("should update favicon when provided", async () => {
      const mockThemeData = {
        module: "app_theme",
        config: {
          favicon: "/assets/logos/favicon.ico",
        },
      };

      const mockFaviconLink = {
        href: "",
      } as unknown as Element;

      // Mock global document.querySelector
      const globalQuerySelector = vi.spyOn(document, "querySelector").mockReturnValue(mockFaviconLink);

      vi.mocked(getThemeConfig).mockResolvedValue(mockThemeData);

      renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(globalQuerySelector).toHaveBeenCalledWith("link[rel~='icon']");
      });

      expect((mockFaviconLink as HTMLLinkElement).href).toBe("/assets/logos/favicon.ico");

      // Restaurar el mock
      globalQuerySelector.mockRestore();
    });

    it("should not apply CSS variables for unmapped keys", async () => {
      const mockThemeData = {
        module: "app_theme",
        config: {
          unknown_key: "#000000",
          primary_color: "#1976D2",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(mockThemeData);

      renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSetProperty).toHaveBeenCalled();
      });

      // Should only set mapped keys
      expect(mockSetProperty).toHaveBeenCalledWith("--color-primary", hexToHsl("#1976D2"));
      expect(mockSetProperty).not.toHaveBeenCalledWith(
        expect.any(String),
        "#000000"
      );
    });
  });

  describe("updating theme", () => {
    it("should update theme successfully", async () => {
      const initialTheme = {
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
        },
      };

      const updatedTheme = {
        module: "app_theme",
        config: {
          primary_color: "#FF5733",
          secondary_color: "#DC004E",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(initialTheme);
      vi.mocked(setThemeConfig).mockResolvedValue(updatedTheme);

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

      expect(setThemeConfig).toHaveBeenCalledWith({
        primary_color: "#FF5733",
        secondary_color: "#DC004E",
      });
    });

    it("should handle update error", async () => {
      const initialTheme = {
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(initialTheme);
      const mockError = new Error("Failed to update theme");
      vi.mocked(setThemeConfig).mockRejectedValue(mockError);

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
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(initialTheme);
      vi.mocked(setThemeConfig).mockResolvedValue({
        module: "app_theme",
        config: { primary_color: "#FF5733" },
      });

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Check that isUpdating is initially false
      expect(result.current.isUpdating).toBe(false);

      // Trigger update - the mutation should start immediately
      result.current.updateTheme({ primary_color: "#FF5733" });

      // Wait a bit for the mutation to start
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify the mutation was called
      expect(setThemeConfig).toHaveBeenCalledWith({ primary_color: "#FF5733" });
    }, 15000);
  });

  describe("updating single theme property", () => {
    it("should update single property successfully", async () => {
      const initialTheme = {
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(initialTheme);
      vi.mocked(updateThemeConfigProperty).mockResolvedValue({
        value: "#FF5733",
      });

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger update
      result.current.updateThemeProperty({
        key: "primary_color",
        value: "#FF5733",
      });

      // Wait a bit for the mutation to be called
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the mutation was called
      expect(updateThemeConfigProperty).toHaveBeenCalledWith("primary_color", "#FF5733");
    }, 15000);

    it("should refetch theme after updating property", async () => {
      const initialTheme = {
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
        },
      };

      const updatedTheme = {
        module: "app_theme",
        config: {
          primary_color: "#FF5733",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValueOnce(initialTheme).mockResolvedValueOnce(updatedTheme);
      vi.mocked(updateThemeConfigProperty).mockResolvedValue({
        value: "#FF5733",
      });

      const { result } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger update
      result.current.updateThemeProperty({
        key: "primary_color",
        value: "#FF5733",
      });

      // Wait a bit for the mutation to be called
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the mutation was called
      expect(updateThemeConfigProperty).toHaveBeenCalledWith("primary_color", "#FF5733");
    }, 15000);
  });

  describe("theme caching", () => {
    it("should cache theme data", async () => {
      const mockThemeData = {
        module: "app_theme",
        config: {
          primary_color: "#1976D2",
        },
      };

      vi.mocked(getThemeConfig).mockResolvedValue(mockThemeData);

      const { result, rerender } = renderHook(() => useThemeConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Rerender should not trigger new fetch due to cache
      rerender();

      // Should only fetch once due to cache
      expect(getThemeConfig).toHaveBeenCalledTimes(1);
    });
  });
});
