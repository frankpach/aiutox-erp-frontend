/**
 * Tests for authStore - Refresh Token functionality
 *
 * Note: These tests must run sequentially (not concurrently) because they share
 * the same Zustand store with persist middleware, which can cause race conditions.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../authStore";
import apiClient from "../../lib/api/client";
import type { RefreshTokenResponse } from "../../lib/api/types/auth.types";

// Mock apiClient
vi.mock("../../lib/api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("authStore - Refresh Token", () => {
  beforeEach(() => {
    // Clear store and localStorage before each test
    useAuthStore.getState().clearAuth();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("setAuth", () => {
    it("should store both access token and refresh token", () => {
      const user = {
        id: "1",
        email: "test@example.com",
        full_name: "Test User",
        is_active: true,
      };
      const accessToken = "access_token_123";
      const refreshToken = "refresh_token_456";

      useAuthStore.getState().setAuth(user, accessToken, refreshToken);

      const state = useAuthStore.getState();
      expect(state.token).toBe(accessToken);
      expect(state.refreshToken).toBe(refreshToken);
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem("auth_token")).toBe(accessToken);
      // Refresh token is now stored in httpOnly cookie, not localStorage
      // It's kept in state for backward compatibility but not stored in localStorage
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });

  describe("setRefreshToken", () => {
    it("should update refresh token in store", () => {
      const newRefreshToken = "new_refresh_token_789";

      useAuthStore.getState().setRefreshToken(newRefreshToken);

      const state = useAuthStore.getState();
      expect(state.refreshToken).toBe(newRefreshToken);
      // Refresh token is now stored in httpOnly cookie, not localStorage
      // It's kept in state for backward compatibility but not stored in localStorage
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });

  // Run refreshAccessToken tests sequentially to avoid state/mock interference
  // The persist middleware and shared store can cause race conditions in parallel execution
  describe.sequential("refreshAccessToken", () => {
    it("should refresh access token successfully", async () => {
      // Ensure we start with a completely clean state
      useAuthStore.getState().clearAuth();
      localStorageMock.clear();
      vi.clearAllMocks();
      const refreshToken = "refresh_token_456";
      const newAccessToken = "new_access_token_789";

      // Ensure clean state
      useAuthStore.getState().clearAuth();
      localStorageMock.clear();

      // Set refresh token first
      useAuthStore.getState().setRefreshToken(refreshToken);

      // Verify refresh token is set in state
      expect(useAuthStore.getState().refreshToken).toBe(refreshToken);
      // Refresh token is now stored in httpOnly cookie, not localStorage
      // It's kept in state for backward compatibility but not stored in localStorage
      expect(localStorage.getItem("refresh_token")).toBeNull();

      // Mock successful refresh response
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          access_token: newAccessToken,
          token_type: "bearer",
        } as RefreshTokenResponse,
      });

      const result = await useAuthStore.getState().refreshAccessToken();

      // Verify result
      expect(result).toBe(newAccessToken);

      // Verify state was updated
      const state = useAuthStore.getState();
      expect(state.token).toBe(newAccessToken);

      // Verify localStorage was updated
      expect(localStorage.getItem("auth_token")).toBe(newAccessToken);

      // Verify API was called correctly
      expect(apiClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refresh_token: refreshToken,
      });
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it("should return null if no refresh token exists", async () => {
      // Ensure clean state - no refresh token
      useAuthStore.getState().clearAuth();
      localStorageMock.clear();
      vi.clearAllMocks(); // Clear any previous mock calls

      // Verify no refresh token exists
      expect(useAuthStore.getState().refreshToken).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();

      const result = await useAuthStore.getState().refreshAccessToken();

      expect(result).toBeNull();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("should clear auth and return null if refresh fails", async () => {
      const refreshToken = "invalid_refresh_token";
      useAuthStore.getState().setRefreshToken(refreshToken);

      // Set initial auth state
      useAuthStore.getState().setAuth(
        {
          id: "1",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
        },
        "old_token",
        refreshToken
      );

      // Mock failed refresh response
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Token expired"));

      const result = await useAuthStore.getState().refreshAccessToken();

      expect(result).toBeNull();
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });

  describe("clearAuth", () => {
    it("should clear both tokens and user data", () => {
      // Set initial auth state
      useAuthStore.getState().setAuth(
        {
          id: "1",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
        },
        "access_token",
        "refresh_token"
      );

      // Clear auth
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });
});




