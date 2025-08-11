import axios, { AxiosError } from 'axios';
import { getAuthToken, removeAuthData, getRefreshToken, setAuthData } from './auth';

// Use Next.js API routes that proxy to Aspire services
const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('API Client - Adding token to request:', config.url, token ? 'Token present' : 'No token');
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
  (response) => response,
  async (error: AxiosError) => {
    console.log('API Client - Response error:', error.response?.status, error.config?.url);
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('API Client - Attempting token refresh');
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        console.log('API Client - Refresh token available:', !!refreshToken);
        if (!refreshToken) {
          console.log('API Client - No refresh token, redirecting to login');
          removeAuthData();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken, user } = response.data;
        console.log('API Client - Token refresh successful');
        setAuthData(newToken, newRefreshToken, user);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('API Client - Token refresh failed:', refreshError);
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