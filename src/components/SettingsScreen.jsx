// src/components/SettingsScreen.jsx
import { useState } from "react";

export function SettingsScreen({ user, settings, onUpdateSettings, onSignOut, isPro, isFounder, accentColor, cardBg, textColor, mutedColor, dark }) {
  const [saved, setSaved] = useState(false);
  const sans  = "'DM Sans', system-ui, sans-serif";
  const serif = "'Cormorant Garamond', Georgia, serif";

  function update(key, value) {
    const next = { ...settings, [key]: value };
    onUpdateSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const sectionStyle = {
    background: cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    border: `1px solid ${dark ? "rgba(45,106,79,0.2)" : "#e8f4e8"}`,
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 4, color: textColor }}>⚙️ Settings</h2>
      <p style={{ fontSize: 12, color: mutedColor, marginBottom: 20 }}>{user?.email}</p>

      {/* Account */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: textColor, margin: 0 }}>
              {isFounder ? "👑 Founder" : isPro ? "⭐ Pro" : "🆓 Free"}
            </p>
            <p style={{ fontFamily: sans, fontSize: 12, color: mutedColor, margin: "2px 0 0" }}>
              {isFounder ? "Unlimited scans forever" : isPro ? "Unlimited scans" : "10 scans/month"}
            </p>
          </div>
          {!isPro && !isFounder && (
            <button style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: accentColor, color: "#fff", fontFamily: sans, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Upgrade $2.99
            </button>
          )}
        </div>
      </div>

      {/* Display */}
      <div style={sectionStyle}>
        <h3 style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: mutedColor, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Display</h3>
        {[
          { key: "darkMode",     label: "🌙 Dark Mode",     desc: "Easier on the eyes at night" },
          { key: "largeText",    label: "🔠 Large Text",    desc: "Increases text size" },
          { key: "highContrast", label: "🌓 High Contrast", desc: "Stronger colours" },
          { key: "voiceEnabled", label: "🎤 Voice Navigation", desc: "Control with your voice" },
        ].map((s, i, arr) => (
          <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${dark ? "rgba(45,106,79,0.1)" : "#e8f4e8"}` : "none" }}>
            <div>
              <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: textColor, margin: 0 }}>{s.label}</p>
              <p style={{ fontFamily: sans, fontSize: 12, color: mutedColor, margin: "2px 0 0" }}>{s.desc}</p>
            </div>
            <Toggle value={settings[s.key]} onChange={v => update(s.key, v)} accentColor={accentColor} />
          </div>
        ))}
      </div>

      {saved && (
        <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 10, padding: "10px 14px", marginBottom: 16, textAlign: "center" }}>
          <p style={{ color: "#276749", fontSize: 13, margin: 0, fontWeight: 600 }}>✅ Settings saved!</p>
        </div>
      )}

      <button onClick={onSignOut}
        style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #fed7d7", background: "#fff5f5", color: "#e53e3e", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 16 }}>
        🚪 Sign Out
      </button>

      <p style={{ textAlign: "center", fontSize: 11, color: mutedColor }}>
        Plant Be · OXALIS Studio · New Zealand
      </p>

      {/* OXALIS Suite links */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <a href="https://che-af.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#c4622d", textDecoration: "none" }}>🍳 Che AF</a>
        <a href="https://mix-r.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>🍹 Mix-R</a>
      </div>
    </div>
  );
}

function Toggle({ value, onChange, accentColor }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: 50, height: 28, borderRadius: 50, border: "none", background: value ? accentColor : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: value ? 24 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

export default SettingsScreen;
