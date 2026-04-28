// src/components/BottomNav.jsx
export function BottomNav({ tab, setTab, accentColor, cardBg, mutedColor }) {
  const sans = "'DM Sans', system-ui, sans-serif";

  const TABS = [
    { id: "scan",      icon: "📸", label: "Scan" },
    { id: "plants",    icon: "🌿", label: "Plants" },
    { id: "favorites", icon: "💚", label: "Saved" },
    { id: "settings",  icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: cardBg, borderTop: "1px solid rgba(45,106,79,0.2)", display: "flex", zIndex: 50 }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)}
          style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span style={{ fontFamily: sans, fontSize: 10, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? accentColor : mutedColor }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default BottomNav;
