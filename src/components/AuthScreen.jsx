// src/components/AuthScreen.jsx
import { useState } from "react";
import { supabase } from "../utils/supabase";

export function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sans = "'DM Sans', system-ui, sans-serif";
  const serif = "'Cormorant Garamond', Georgia, serif";

  async function handleAuth() {
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
      <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: "#e8f5e8", marginBottom: 4 }}>
        Plant <em style={{ color: "#2d6a4f", fontStyle: "italic" }}>Be</em>
      </div>
      <p style={{ fontFamily: sans, fontSize: 14, color: "rgba(232,245,232,0.5)", marginBottom: 40 }}>Know your plants</p>

      <div style={{ width: "100%", maxWidth: 380, background: "#0d140d", borderRadius: 20, padding: 32, border: "1px solid rgba(45,106,79,0.2)" }}>
        <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: "#e8f5e8", marginBottom: 24 }}>
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email"
          style={{ width: "100%", padding: "14px 16px", border: "1px solid rgba(45,106,79,0.3)", borderRadius: 12, fontFamily: sans, fontSize: 14, background: "#1a2a1a", color: "#e8f5e8", outline: "none", marginBottom: 12, boxSizing: "border-box" }} />

        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password (min 6 chars)"
          onKeyDown={e => e.key === "Enter" && handleAuth()}
          style={{ width: "100%", padding: "14px 16px", border: "1px solid rgba(45,106,79,0.3)", borderRadius: 12, fontFamily: sans, fontSize: 14, background: "#1a2a1a", color: "#e8f5e8", outline: "none", marginBottom: 20, boxSizing: "border-box" }} />

        {error && <p style={{ color: "#fc8181", fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <button onClick={handleAuth} disabled={loading}
          style={{ width: "100%", padding: 16, background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 12, fontFamily: sans, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 16 }}>
          {loading ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
        </button>

        <button onClick={() => setIsSignUp(!isSignUp)}
          style={{ width: "100%", background: "none", border: "none", fontFamily: sans, fontSize: 13, color: "rgba(232,245,232,0.5)", cursor: "pointer" }}>
          {isSignUp ? "Already have an account? Sign in" : "New user? Create account"}
        </button>
      </div>
    </div>
  );
}

export default AuthScreen;
