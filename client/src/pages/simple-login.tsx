import { useState } from "react";

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== LOGIN FORM SUBMITTED ===");
    console.log("Username:", username);
    console.log("Password length:", password.length);
    
    setIsLoading(true);
    setMessage("Attempting login...");

    try {
      console.log("Making API request to /api/login");
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log("Parsed response data:", data);

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Store token and redirect
      localStorage.setItem("auth_token", data.token);
      console.log("Token stored in localStorage");
      
      setMessage("Login successful! Redirecting to dashboard...");
      
      setTimeout(() => {
        console.log("Redirecting to dashboard");
        window.location.href = "/dashboard";
      }, 500);

    } catch (error: any) {
      console.error("=== LOGIN ERROR ===", error);
      setMessage(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "#000",
      color: "#fff",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "#1a1a1a",
        padding: "2rem",
        borderRadius: "8px",
        border: "1px solid #333",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
          OwnersAlliance Login
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#333",
                border: "1px solid #555",
                borderRadius: "4px",
                color: "#fff",
                boxSizing: "border-box"
              }}
              placeholder="admin"
              required
            />
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#333",
                border: "1px solid #555",
                borderRadius: "4px",
                color: "#fff",
                boxSizing: "border-box"
              }}
              placeholder="admin123"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            onClick={() => console.log("Button clicked!")}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: isLoading ? "#666" : "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "1rem"
            }}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        
        {message && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: message.includes("success") ? "#065f46" : "#991b1b",
            borderRadius: "4px",
            textAlign: "center"
          }}>
            {message}
          </div>
        )}
        
        <p style={{ 
          textAlign: "center", 
          marginTop: "1rem", 
          color: "#888",
          fontSize: "0.875rem"
        }}>
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
}