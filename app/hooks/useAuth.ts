import { useCallback } from "react";
import { useAuthStore } from "~/stores/authStore";
import apiClient from "~/lib/api/client";
import type { TokenResponse } from "~/lib/api/types/auth.types";

interface LoginCredentials {
  email: string;
  password: string;
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
        const loginResponse = await apiClient.post<
          StandardResponse<TokenResponse>
        >("/auth/login", credentials);
        const tokenData = loginResponse.data.data;

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
        return { success: true };
      } catch (error) {
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

