import axios, { AxiosError } from 'axios';
import { getAuthToken, removeAuthData, getRefreshToken, setAuthData } from './auth';

// API Base URL - Next.js プロキシ経由でCORS問題解決
// next.config.js rewrites により /api/* → Aspire Service Discovery URL へプロキシ
const baseURL = '/api';

if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
  console.log('API Client - Using Next.js proxy:', baseURL);
  console.log('API Client - Aspire Service Discovery URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
}

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒タイムアウト
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    const isDebug = process.env.NEXT_PUBLIC_API_DEBUG === 'true';
    
    if (isDebug) {
      console.log('API Client - Request:', config.method?.toUpperCase(), config.url, token ? 'Token present' : 'No token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    const isDebug = process.env.NEXT_PUBLIC_API_DEBUG === 'true';
    if (isDebug) {
      console.log('API Client - Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error: AxiosError) => {
    const isDebug = process.env.NEXT_PUBLIC_API_DEBUG === 'true';
    if (isDebug) {
      console.log('API Client - Response error:', error.response?.status, error.config?.url);
    }
    
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isDebug) {
        console.log('API Client - Attempting token refresh');
      }
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (isDebug) {
          console.log('API Client - Refresh token available:', !!refreshToken);
        }
        if (!refreshToken) {
          if (isDebug) {
            console.log('API Client - No refresh token, redirecting to login');
          }
          removeAuthData();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken, user } = response.data;
        if (isDebug) {
          console.log('API Client - Token refresh successful');
        }
        setAuthData(newToken, newRefreshToken, user);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (isDebug) {
          console.log('API Client - Token refresh failed:', refreshError);
        }
        removeAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}