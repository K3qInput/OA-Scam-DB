import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, LoginData } from "@shared/schema";

interface AuthResponse {
  token: string;
  user: User;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!localStorage.getItem("auth_token"),
    staleTime: 0,
    gcTime: 0,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<AuthResponse> => {
      console.log("Starting enhanced login with device fingerprinting...");
      
      // Generate device fingerprint for alt account prevention
      const { generateDeviceFingerprint } = await import('../utils/deviceFingerprint');
      const deviceData = await generateDeviceFingerprint();
      
      const enhancedCredentials = {
        ...credentials,
        deviceFingerprint: deviceData.fingerprint,
        sessionData: {
          screenResolution: deviceData.screenResolution,
          timezone: deviceData.timezone,
          language: deviceData.language,
          platform: deviceData.platform,
          browserVersion: deviceData.browserVersion,
          plugins: deviceData.plugins,
          fonts: deviceData.fonts,
          hardwareConcurrency: deviceData.hardwareConcurrency,
          deviceMemory: deviceData.deviceMemory,
          connectionType: deviceData.connectionType,
          riskScore: deviceData.riskScore,
        }
      };
      
      console.log("Attempting login with:", { 
        username: credentials.username, 
        deviceRiskScore: deviceData.riskScore,
        fingerprint: deviceData.fingerprint
      });
      
      const response = await apiRequest("POST", "/api/auth/login", enhancedCredentials);
      const data = await response.json();
      
      console.log("Login successful:", { 
        user: data.user?.username, 
        hasToken: !!data.token,
        securityAnalysis: data.securityAnalysis
      });
      
      // Store device fingerprint for future validation
      const { setStoredFingerprint } = await import('../utils/deviceFingerprint');
      setStoredFingerprint(deviceData.fingerprint);
      
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
      // Force a refetch to update authentication state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      console.error("Error details:", error.message);
    },
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.clear();
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
