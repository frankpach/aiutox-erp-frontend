import { useCallback } from "react";
import { useAuthStore } from "~/stores/authStore";
import apiClient from "~/lib/api/client";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  data: {
    user: {
      id: string;
      email: string;
      full_name: string | null;
      is_active: boolean;
    };
    token: string;
  };
}

export function useAuth() {
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await apiClient.post<AuthResponse>(
          "/auth/login",
          credentials
        );
        const { user, token } = response.data.data;
        setAuth(user, token);
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

