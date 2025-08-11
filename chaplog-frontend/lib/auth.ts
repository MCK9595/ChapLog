// Auth utility functions for managing tokens in localStorage
const TOKEN_KEY = 'chaplog_token';
const REFRESH_TOKEN_KEY = 'chaplog_refresh_token';
const USER_KEY = 'chaplog_user';

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  console.log('Getting auth token:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setAuthData = (token: string, refreshToken: string, user?: User) => {
  if (typeof window === 'undefined') return;
  console.log('Setting auth data:', { token: token?.substring(0, 20) + '...', refreshToken: refreshToken?.substring(0, 20) + '...', user });
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  // Also set token in cookie for middleware
  document.cookie = `chaplog-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
};

export const removeAuthData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Also remove cookie
  document.cookie = 'chaplog-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user?.role === role;
};

export const isAdmin = (): boolean => {
  return hasRole('Admin');
};