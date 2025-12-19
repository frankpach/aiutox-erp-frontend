import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { RefreshTokenResponse } from "./types/auth.types";
import { useAuthStore } from "../../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Queue for pending requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Refresh access token using refresh token
 * Updates both localStorage and authStore for consistency
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    return null;
  }

  try {
    // Create a new axios instance without interceptors to avoid infinite loop
    const refreshClient = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    const response = await refreshClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );

    const { access_token } = response.data;

    // Update localStorage
    localStorage.setItem("auth_token", access_token);

    // Update authStore for consistency
    const authStore = useAuthStore.getState();
    authStore.setRefreshToken(refreshToken); // Keep refresh token
    // Update token in store (we need to update the token field directly)
    useAuthStore.setState({ token: access_token });

    return access_token;
  } catch {
    // Refresh token expired or invalid
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");

    // Clear authStore
    const authStore = useAuthStore.getState();
    authStore.clearAuth();

    return null;
  }
};

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          isRefreshing = false;
          return apiClient(originalRequest);
        } else {
          // Refresh failed - redirect to login
          processQueue(new Error("Refresh token expired"), null);
          isRefreshing = false;
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

