import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom is the intended routing library

// Mock functions for demonstration purposes
const generateFingerprint = () => "mock-fingerprint"; // Placeholder for actual fingerprint generation

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const { login, isLoggingIn } = useAuth(); // Assuming useAuth provides a login function
  const navigate = useNavigate(); // Use useNavigate from react-router-dom

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('Starting traditional login...');

    try {
      console.log('Starting enhanced login with device fingerprinting...');

      const deviceRiskScore = 0; // Placeholder for device risk scoring
      const fingerprint = generateFingerprint();

      const loginData = {
        username,
        password,
        deviceRiskScore,
        fingerprint
      };

      console.log('Attempting login with:', {
        username,
        deviceRiskScore,
        fingerprint
      });

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', {
        user: data.user,
        hasToken: !!data.token,
        securityAnalysis: data.securityAnalysis
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Login successful, redirecting to dashboard');
        navigate('/dashboard');
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-oa-black">
      <Card className="w-full max-w-md mx-4 oa-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <CardTitle className="text-2xl text-white">OwnersAlliance</CardTitle>
              <p className="text-gray-400 text-sm">Database Portal</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && !error.includes("Database not configured") && (
              <Alert className="border-red-500 bg-red-900/20">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="oa-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="oa-input"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading} // Use isLoading state here
              className="w-full oa-btn-primary"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Staff access only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}