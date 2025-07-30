import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, LoginData } from "@shared/schema";

interface AuthResponse {
  token: string;
  user: User;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/me"],
    retry: false,
    enabled: !!localStorage.getItem("auth_token"),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<AuthResponse> => {
      console.log("Attempting login with:", { username: credentials.username });
      const response = await apiRequest("POST", "/api/login", credentials);
      const data = await response.json();
      console.log("Login successful:", { user: data.user?.username, hasToken: !!data.token });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(["/api/me"], data.user);
      // Force a refetch to update authentication state
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      console.error("Error details:", error.message);
    },
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.setQueryData(["/api/me"], null);
    queryClient.clear();
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
