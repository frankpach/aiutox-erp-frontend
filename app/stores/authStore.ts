import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RefreshTokenResponse } from "../lib/api/types/auth.types";
import apiClient from "../lib/api/client";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  tenant_id?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  refreshAccessToken: () => Promise<string | null>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("refresh_token", refreshToken);
        set({ user, token, refreshToken, isAuthenticated: true });
      },
      setRefreshToken: (refreshToken) => {
        localStorage.setItem("refresh_token", refreshToken);
        set({ refreshToken });
      },
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          return null;
        }

        try {
          const response = await apiClient.post<RefreshTokenResponse>(
            "/auth/refresh",
            { refresh_token: refreshToken }
          );

          const { access_token } = response.data;
          localStorage.setItem("auth_token", access_token);
          set({ token: access_token });
          return access_token;
        } catch {
          // Refresh token expired or invalid - clear auth
          get().clearAuth();
          return null;
        }
      },
      clearAuth: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

