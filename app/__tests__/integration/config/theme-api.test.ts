/**
 * Integration tests for Theme Configuration API calls
 *
 * Tests the integration between frontend API client and theme endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import apiClient from "~/lib/api/client";
import axios from "axios";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("Theme Configuration API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /config/app_theme", () => {
    it("should fetch theme configuration successfully", async () => {
      const mockResponse = {
        data: {
          data: {
            module: "app_theme",
            config: {
              primary_color: "#1976D2",
              secondary_color: "#DC004E",
              accent_color: "#FFC107",
              background_color: "#FFFFFF",
            },
          },
          meta: null,
          error: null,
        },
        status: 200,
        statusText: "OK",
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse),
        post: vi.fn(),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const response = await apiClient.get("/config/app_theme");

      expect(response.data.data.module).toBe("app_theme");
      expect(response.data.data.config.primary_color).toBe("#1976D2");
      expect(response.data.data.config.secondary_color).toBe("#DC004E");
    });

    it("should handle API error response", async () => {
      const mockError = {
        response: {
          status: 403,
          data: {
            error: {
              code: "AUTH_INSUFFICIENT_PERMISSIONS",
              message: "Insufficient permissions",
            },
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(mockError),
        post: vi.fn(),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(apiClient.get("/config/app_theme")).rejects.toMatchObject({
        response: {
          status: 403,
        },
      });
    });

    it("should handle network error", async () => {
      const mockError = new Error("Network Error");

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(mockError),
        post: vi.fn(),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(apiClient.get("/config/app_theme")).rejects.toThrow(
        "Network Error"
      );
    });

    it("should return default theme when no config exists", async () => {
      const mockResponse = {
        data: {
          data: {
            module: "app_theme",
            config: {
              primary_color: "#1976D2",
              secondary_color: "#DC004E",
              accent_color: "#FFC107",
              background_color: "#FFFFFF",
              surface_color: "#F5F5F5",
              text_primary: "#212121",
              text_secondary: "#757575",
            },
          },
          meta: null,
          error: null,
        },
        status: 200,
        statusText: "OK",
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse),
        post: vi.fn(),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const response = await apiClient.get("/config/app_theme");

      // Should have default colors
      expect(response.data.data.config.primary_color).toBeDefined();
      expect(response.data.data.config.secondary_color).toBeDefined();
      expect(response.data.data.config.background_color).toBeDefined();
    });
  });

  describe("POST /config/app_theme", () => {
    it("should create/update theme configuration successfully", async () => {
      const themeData = {
        primary_color: "#FF5733",
        secondary_color: "#E74C3C",
        accent_color: "#3498DB",
      };

      const mockResponse = {
        data: {
          data: {
            module: "app_theme",
            config: themeData,
          },
          meta: null,
          error: null,
        },
        status: 201,
        statusText: "Created",
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn(),
        post: vi.fn().mockResolvedValue(mockResponse),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const response = await apiClient.post("/config/app_theme", themeData);

      expect(response.status).toBe(201);
      expect(response.data.data.config.primary_color).toBe("#FF5733");
      expect(response.data.data.config.secondary_color).toBe("#E74C3C");
    });

    it("should handle validation error for invalid color format", async () => {
      const invalidThemeData = {
        primary_color: "blue", // Invalid - not hex format
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: "INVALID_COLOR_FORMAT",
              message: "Invalid color format for 'primary_color': must be #RRGGBB (got: blue)",
              details: {
                key: "primary_color",
                value: "blue",
                expected_format: "#RRGGBB",
              },
            },
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn(),
        post: vi.fn().mockRejectedValue(mockError),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(
        apiClient.post("/config/app_theme", invalidThemeData)
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: {
            error: {
              code: "INVALID_COLOR_FORMAT",
            },
          },
        },
      });
    });

    it("should handle permission error", async () => {
      const themeData = {
        primary_color: "#FF5733",
      };

      const mockError = {
        response: {
          status: 403,
          data: {
            error: {
              code: "AUTH_INSUFFICIENT_PERMISSIONS",
              message: "Insufficient permissions",
              details: {
                required_permission: "config.edit_theme",
              },
            },
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn(),
        post: vi.fn().mockRejectedValue(mockError),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(
        apiClient.post("/config/app_theme", themeData)
      ).rejects.toMatchObject({
        response: {
          status: 403,
          data: {
            error: {
              code: "AUTH_INSUFFICIENT_PERMISSIONS",
            },
          },
        },
      });
    });
  });

  describe("PUT /config/app_theme/{key}", () => {
    it("should update single theme property successfully", async () => {
      const mockResponse = {
        data: {
          data: {
            value: "#FF5733",
          },
          meta: null,
          error: null,
        },
        status: 200,
        statusText: "OK",
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const response = await apiClient.put("/config/app_theme/primary_color", {
        value: "#FF5733",
      });

      expect(response.status).toBe(200);
      expect(response.data.data.value).toBe("#FF5733");
    });

    it("should handle validation error for invalid color", async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: "INVALID_COLOR_FORMAT",
              message: "Invalid color format for 'primary_color': must be #RRGGBB",
            },
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(
        apiClient.put("/config/app_theme/primary_color", { value: "red" })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: {
            error: {
              code: "INVALID_COLOR_FORMAT",
            },
          },
        },
      });
    });

    it("should update non-color properties without validation", async () => {
      const mockResponse = {
        data: {
          data: {
            value: "/assets/logos/custom-logo.png",
          },
          meta: null,
          error: null,
        },
        status: 200,
        statusText: "OK",
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const response = await apiClient.put("/config/app_theme/logo_primary", {
        value: "/assets/logos/custom-logo.png",
      });

      expect(response.status).toBe(200);
      expect(response.data.data.value).toBe("/assets/logos/custom-logo.png");
    });
  });

  describe("API request format", () => {
    it("should send requests with correct base URL", async () => {
      const mockResponse = {
        data: {
          data: {
            module: "app_theme",
            config: {},
          },
        },
        status: 200,
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse),
        post: vi.fn(),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await apiClient.get("/config/app_theme");

      // Verify axios.create was called with correct baseURL
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining("/api/v1"),
        })
      );
    });

    it("should include Content-Type header", async () => {
      const mockResponse = {
        data: {
          data: {
            module: "app_theme",
            config: {},
          },
        },
        status: 200,
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse),
        post: vi.fn(),
        put: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await apiClient.get("/config/app_theme");

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });
});



