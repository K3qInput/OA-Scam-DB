import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  username: string;
  role: string;
  exp: number;
}

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
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

// Enhanced API request utility with better error handling and auth
export const apiRequest = async (method: string, url: string, data?: any) => {
  const token = localStorage.getItem('auth_token');
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// Enhanced API request utility with better error handling and auth


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

export function isUnauthorizedError(error: any): boolean {
  return error && error.message === "Unauthorized";
}