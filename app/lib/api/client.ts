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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:45',message:'refreshAccessToken: creating refreshClient',data:{hasRefreshToken:!!refreshToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Create a new axios instance without interceptors to avoid infinite loop
    const refreshClient = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:54',message:'refreshAccessToken: calling post',data:{refreshClientType:typeof refreshClient.post,isFunction:typeof refreshClient.post==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const response = await refreshClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:58',message:'refreshAccessToken: post response received',data:{hasResponse:!!response,hasData:!!response?.data,responseType:response?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run23',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const { access_token } = response.data;

    // Update localStorage
    localStorage.setItem("auth_token", access_token);

    // Update authStore for consistency
    const authStore = useAuthStore.getState();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:75',message:'authStore.getState result',data:{hasSetRefreshToken:typeof authStore?.setRefreshToken==='function',authStoreKeys:authStore?Object.keys(authStore):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    authStore.setRefreshToken(refreshToken); // Keep refresh token
    // Update token in store (we need to update the token field directly)
    useAuthStore.setState({ token: access_token });

    return access_token;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:84',message:'refreshAccessToken: error caught',data:{errorMessage:error instanceof Error?error.message:String(error),errorType:error?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run23',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Refresh token expired or invalid
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");

    // Clear authStore
    const authStore = useAuthStore.getState();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:91',message:'calling clearAuth',data:{hasClearAuth:typeof authStore?.clearAuth==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:131',message:'queued request: calling apiClient',data:{isCallable:typeof apiClient==='function',hasRequest:typeof (apiClient as any).request==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
            // #endregion
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:147',message:'about to call refreshAccessToken',data:{isRefreshing},timestamp:Date.now(),sessionId:'debug-session',runId:'run25',hypothesisId:'N'})}).catch(()=>{});
        // #endregion
        const newToken = await refreshAccessToken();
        if (newToken) {
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          isRefreshing = false;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:149',message:'refresh success: calling apiClient',data:{isCallable:typeof apiClient==='function',hasRequest:typeof (apiClient as any).request==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
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

