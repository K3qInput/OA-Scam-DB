// API request helper
export const apiRequest = async (method: string, url: string, data?: any) => {
  const token = localStorage.getItem("auth_token");

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error(`HTTP ${response.status}`);
  }

  return response;
};

export { isUnauthorizedError };

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