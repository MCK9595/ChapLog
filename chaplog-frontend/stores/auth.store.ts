import { create } from 'zustand';
import { User, setAuthData, removeAuthData, getUser } from '@/lib/auth';
import apiClient, { ApiResponse } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => void;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', {
        email,
        password,
      });
      
      // APIレスポンスはApiResponse<AuthResponseDto>でラップされている
      const authData = response.data.data;
      if (!authData) {
        throw new Error('Invalid response from server');
      }
      
      const { token, refreshToken, user } = authData;
      setAuthData(token, refreshToken, user);
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (email: string, userName: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>('/api/auth/register', {
        email,
        userName,
        password,
      });
      
      // APIレスポンスはApiResponse<AuthResponseDto>でラップされている
      const authData = response.data.data;
      if (!authData) {
        throw new Error('Invalid response from server');
      }
      
      const { token, refreshToken, user } = authData;
      setAuthData(token, refreshToken, user);
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      removeAuthData();
      set({ user: null, isLoading: false, error: null, isAuthenticated: false });
    }
  },

  loadUser: () => {
    const user = getUser();
    set({ user, isAuthenticated: !!user });
  },
}));