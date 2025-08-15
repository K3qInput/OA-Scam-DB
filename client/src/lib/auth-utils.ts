import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  username: string;
  role: string;
  exp: number;
}

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

export const getDecodedToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }

  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null && !isTokenExpired(token);
};

export const getUserRole = (): string | null => {
  const decoded = getDecodedToken();
  return decoded?.role || null;
};

export const hasRole = (requiredRole: string): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;

  const roleHierarchy = ['user', 'moderator', 'admin', 'super_admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  return userRoleIndex >= requiredRoleIndex;
};

export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};

export const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      logout();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

function isUnauthorizedError(error: any): boolean {
  return error && error.message === "Unauthorized";
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("auth_token");
}

export function setAuthHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getAuthToken();
  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return headers;
}