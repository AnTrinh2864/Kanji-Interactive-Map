// src/components/AuthForm.tsx
import { useState } from "react";

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password: string) => {
    if (authMode === "login") return ""; // Skip validation for login

    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
      return "Password must contain at least one special character.";

    return "";
  };

  const handleAuth = async () => {
    const validationError = validatePassword(form.password);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    const endpoint = authMode === "login" ? "login" : "signup";
    try {
      const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        onAuthSuccess(data);
      } else {
        const err = await res.json();
        alert(err.detail || "Authentication failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    }
  };

  return (
    <div id="auth-container">
      <h2>{authMode === "login" ? "Login" : "Sign Up"}</h2>

      <input
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => {
          const newPass = e.target.value;
          setForm({ ...form, password: newPass });
          setPasswordError(validatePassword(newPass));
        }}
      />

      {authMode === "signup" && passwordError && (
        <p style={{ color: "red", fontSize: "0.9rem" }}>{passwordError}</p>
      )}

      <button
        onClick={handleAuth}
        disabled={authMode === "signup" && !!passwordError}
      >
        {authMode === "login" ? "Login" : "Sign Up"}
      </button>

      <p
        onClick={() => {
          setAuthMode(authMode === "login" ? "signup" : "login");
          setPasswordError("");
        }}
      >
        {authMode === "login"
          ? "No account? Sign up"
          : "Have an account? Login"}
      </p>
    </div>
  );
}
