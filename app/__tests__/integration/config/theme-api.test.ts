/**
 * Integration tests for Theme Configuration API calls
 *
 * Tests the integration between frontend API client and theme endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import axios from "axios";

// Mock axios BEFORE importing apiClient
// Use vi.hoisted to ensure mocks are set up before module imports
const mockAxiosCreate = vi.hoisted(() => vi.fn());

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof axios>("axios");
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    request: vi.fn(),
  };

  return {
    ...actual,
    default: {
      ...actual.default,
      create: mockAxiosCreate.mockReturnValue(mockAxiosInstance),
    },
  };
});

describe("Theme Configuration API Integration", () => {
  let apiClient: typeof import("~/lib/api/client").default;
  let mockAxiosInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create a fresh mock instance for each test
    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      request: vi.fn(),
    };

    // Configure mock to return our instance
    mockAxiosCreate.mockReturnValue(mockAxiosInstance);

    // Import apiClient after mocking axios
    apiClient = (await import("~/lib/api/client")).default;
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

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

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

      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(apiClient.get("/config/app_theme")).rejects.toMatchObject({
        response: {
          status: 403,
        },
      });
    });

    it("should handle network error", async () => {
      const mockError = new Error("Network Error");

      mockAxiosInstance.get.mockRejectedValue(mockError);

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

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

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

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

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

      mockAxiosInstance.post.mockRejectedValue(mockError);

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

      mockAxiosInstance.post.mockRejectedValue(mockError);

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

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

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

      mockAxiosInstance.put.mockRejectedValue(mockError);

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

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

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

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await apiClient.get("/config/app_theme");

      // Verify axios.create was called with correct baseURL
      expect(mockAxiosCreate).toHaveBeenCalledWith(
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

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await apiClient.get("/config/app_theme");

      expect(mockAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });
});




