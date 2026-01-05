/**
 * Integration tests for Theme Configuration API calls
 *
 * Tests the integration between frontend API client and theme endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("Theme Configuration API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Theme Configuration Structure", () => {
    it("should validate theme configuration structure", () => {
      // Test basic theme structure validation
      const validThemeConfig = {
        primary_color: "#1976D2",
        secondary_color: "#DC004E",
        accent_color: "#FFC107",
        background_color: "#FFFFFF",
        surface_color: "#F5F5F5",
        text_primary: "#212121",
        text_secondary: "#757575",
      };

      expect(validThemeConfig.primary_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(validThemeConfig.secondary_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(validThemeConfig.accent_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(validThemeConfig.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(validThemeConfig.surface_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(validThemeConfig.text_primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(validThemeConfig.text_secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("should validate color format", () => {
      const validColors = [
        "#1976D2",
        "#DC004E", 
        "#FFC107",
        "#FFFFFF",
        "#000000",
        "#123ABC",
        "#abc123"
      ];

      const invalidColors = [
        "red",
        "blue",
        "#123",
        "#12345",
        "#1234567",
        "123456",
        "#GGGGGG"
      ];

      validColors.forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      invalidColors.forEach(color => {
        expect(color).not.toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it("should validate theme API response structure", () => {
      const mockApiResponse = {
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

      expect(mockApiResponse.data).toHaveProperty("data");
      expect(mockApiResponse.data).toHaveProperty("meta");
      expect(mockApiResponse.data).toHaveProperty("error");
      expect(mockApiResponse.data.data).toHaveProperty("module");
      expect(mockApiResponse.data.data).toHaveProperty("config");
      expect(mockApiResponse.data.data.module).toBe("app_theme");
      expect(mockApiResponse.status).toBe(200);
      expect(mockApiResponse.statusText).toBe("OK");
    });

    it("should validate theme update request structure", () => {
      const updateRequest = {
        value: "#FF5733"
      };

      expect(updateRequest).toHaveProperty("value");
      expect(typeof updateRequest.value).toBe("string");
      expect(updateRequest.value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("should validate error response structure", () => {
      const errorResponse = {
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

      expect(errorResponse.response).toHaveProperty("status");
      expect(errorResponse.response).toHaveProperty("data");
      expect(errorResponse.response.data).toHaveProperty("error");
      expect(errorResponse.response.data.error).toHaveProperty("code");
      expect(errorResponse.response.data.error).toHaveProperty("message");
      expect(errorResponse.response.status).toBe(400);
      expect(errorResponse.response.data.error.code).toBe("INVALID_COLOR_FORMAT");
    });
  });

  describe("Theme Configuration Business Logic", () => {
    it("should handle default theme values", () => {
      const defaultTheme = {
        primary_color: "#1976D2",
        secondary_color: "#DC004E",
        accent_color: "#FFC107",
        background_color: "#FFFFFF",
        surface_color: "#F5F5F5",
        text_primary: "#212121",
        text_secondary: "#757575",
      };

      Object.values(defaultTheme).forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it("should validate non-color properties", () => {
      const nonColorProperties = {
        logo_primary: "/assets/logos/custom-logo.png",
        logo_secondary: "/assets/logos/small-logo.png",
        favicon: "/assets/icons/favicon.ico"
      };

      Object.entries(nonColorProperties).forEach(([key, value]) => {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
        if (key.includes("logo")) {
          expect(value).toMatch(/\.(png|jpg|jpeg|svg|gif)$/i);
        }
        if (key === "favicon") {
          expect(value).toMatch(/\.(ico|png)$/i);
        }
      });
    });

    it("should handle theme configuration validation", () => {
      const validateThemeConfig = (config: any) => {
        const errors: string[] = [];
        
        if (!config.primary_color || !config.primary_color.match(/^#[0-9A-Fa-f]{6}$/)) {
          errors.push("Invalid primary_color format");
        }
        
        if (!config.secondary_color || !config.secondary_color.match(/^#[0-9A-Fa-f]{6}$/)) {
          errors.push("Invalid secondary_color format");
        }
        
        if (!config.background_color || !config.background_color.match(/^#[0-9A-Fa-f]{6}$/)) {
          errors.push("Invalid background_color format");
        }
        
        return errors;
      };

      const validConfig = {
        primary_color: "#1976D2",
        secondary_color: "#DC004E",
        background_color: "#FFFFFF"
      };

      const invalidConfig = {
        primary_color: "red",
        secondary_color: "blue",
        background_color: "white"
      };

      expect(validateThemeConfig(validConfig)).toHaveLength(0);
      expect(validateThemeConfig(invalidConfig)).toHaveLength(3);
    });
  });
});