import { useCallback } from "react";
import { useAuthStore } from "~/stores/authStore";
import apiClient, { scheduleProactiveRefresh } from "~/lib/api/client";
import type { TokenResponse } from "~/lib/api/types/auth.types";

interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface StandardResponse<T> {
  data: T;
  meta: null;
  error: null;
}

interface UserMeResponse {
      id: string;
      email: string;
      full_name: string | null;
  tenant_id: string;
  roles: string[];
  permissions: string[];
}

export function useAuth() {
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        // Login returns StandardResponse[TokenResponse]
        console.log("Attempting login to:", `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1/auth/login`);
        const loginResponse = await apiClient.post<
          StandardResponse<TokenResponse>
        >("/auth/login", credentials);
        const tokenData = loginResponse.data.data;

        // Store token in localStorage BEFORE calling /me endpoint
        // This ensures the axios interceptor can attach it to the request
        localStorage.setItem("auth_token", tokenData.access_token);
        localStorage.setItem("refresh_token", tokenData.refresh_token);

        // Get user info from /me endpoint
        const meResponse = await apiClient.get<StandardResponse<UserMeResponse>>(
          "/auth/me"
        );
        const userData = meResponse.data.data;

        // Map to User interface expected by authStore
        const user = {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          is_active: true, // /me endpoint requires authentication, so user is active
          tenant_id: userData.tenant_id,
          roles: userData.roles || [],
          permissions: userData.permissions || [],
        };

        // Store both tokens using setAuth (which handles localStorage)
        setAuth(user, tokenData.access_token, tokenData.refresh_token);

        // Schedule proactive token refresh
        scheduleProactiveRefresh(tokenData.access_token);

        // Fetch encryption secret after successful login
        try {
          const { useEncryptionStore } = await import("~/stores/encryptionStore");
          await useEncryptionStore.getState().fetchSecret();
        } catch (error) {
          // Log but don't fail login if secret fetch fails
          console.warn("Failed to fetch encryption secret after login:", error);
        }

        return { success: true };
      } catch (error) {
        // Log error for debugging
        console.error("Login error:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number; data?: unknown } };
          console.error("Login error status:", axiosError.response?.status);
          console.error("Login error data:", axiosError.response?.data);
        }
        return { success: false, error };
      }
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return {
    login,
    logout,
    isAuthenticated,
    user,
  };
}

