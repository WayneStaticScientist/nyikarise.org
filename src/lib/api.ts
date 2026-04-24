import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

// Type definition for queued requests during refresh
interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.nyikarise.co.zw/v1";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Inject Tokens & Device Identifiers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken, deviceId } = useAuthStore.getState();
    // 1. Inject Authorization Token
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // 2. Inject Required Custom Headers
    config.headers["x-device-id"] = deviceId;
    config.headers["x-device-name"] = typeof window !== "undefined" ? window.navigator.userAgent : "NodeServer";
    config.headers["x-platform"] = "web";
    config.headers["x-app-version"] = "2.0.0";

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refreshing
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setTokens, logout, deviceId } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        // Attempt to get new tokens using the refresh token
        // Documentation says GET /v1/user/tokens with Bearer {refreshToken}
        const response = await axios.get(`${API_BASE_URL}/user/tokens`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            "x-device-id": deviceId,
          },
        });

        if (response.data.tokens) {
          const { accessToken: newAccess, refreshToken: newRefresh } = response.data.tokens;

          // Update the store
          setTokens(newAccess, newRefresh);

          processQueue(null, newAccess);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        console.log("Error is ", refreshError)
        processQueue(refreshError, null);
        if (refreshError.response?.status === 401) {
          logout();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
