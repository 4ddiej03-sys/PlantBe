// src/components/PlantCard.jsx
import { useState } from "react";

export function PlantCard({ plant: p, onToggleFavorite, isFavorite, accentColor, cardBg, textColor, mutedColor, dark, compact }) {
  const [expanded, setExpanded] = useState(false);
  const sans  = "'DM Sans', system-ui, sans-serif";
  const serif = "'Cormorant Garamond', Georgia, serif";

  // Build Wikipedia URL from scientific name or common name
  const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(p.scientificName || p.name)}`;
  const wikiSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(p.name)}`;

  return (
    <div style={{ background: cardBg, borderRadius: 16, marginBottom: 16, overflow: "hidden", border: `1px solid ${dark ? "rgba(45,106,79,0.2)" : "#e8f4e8"}` }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 56, height: 56, background: dark ? "rgba(45,106,79,0.2)" : "#f0f8f4", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
          {p.emoji || "🌿"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: textColor, lineHeight: 1 }}>{p.name}</div>
          <div style={{ fontFamily: sans, fontSize: 12, color: mutedColor, fontStyle: "italic", marginTop: 2 }}>{p.scientificName}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {p.type && <span style={{ fontSize: 10, color: accentColor, border: `1px solid ${accentColor}`, padding: "2px 6px", borderRadius: 20 }}>{p.type}</span>}
            {p.origin && <span style={{ fontSize: 10, color: mutedColor, border: `1px solid ${dark ? "#333" : "#e2e8f0"}`, padding: "2px 6px", borderRadius: 20 }}>📍 {p.origin}</span>}
          </div>
        </div>
        <button onClick={() => onToggleFavorite(p)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>
          {isFavorite ? "💚" : "🤍"}
        </button>
      </div>

      {/* Toxicity */}
      {p.toxicity && (
        <div style={{ padding: "8px 20px", background: dark ? "rgba(0,0,0,0.2)" : "#f8fff8", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: p.toxicity.safe ? "#38a169" : "#e53e3e" }}>{p.toxicity.safe ? "✅ Safe" : "⚠️ Toxic"}</span>
          <span style={{ fontSize: 12, color: p.toxicity.pets ? "#38a169" : "#e53e3e" }}>{p.toxicity.pets ? "🐾 Pet safe" : "⚠️ Not pet safe"}</span>
          <span style={{ fontSize: 12, color: p.toxicity.children ? "#38a169" : "#e53e3e" }}>{p.toxicity.children ? "👶 Child safe" : "⚠️ Keep from children"}</span>
        </div>
      )}

      {!compact && (
        <>
          <button onClick={() => setExpanded(!expanded)}
            style={{ width: "100%", padding: "12px 20px", background: "none", border: "none", borderTop: `1px solid ${dark ? "rgba(45,106,79,0.15)" : "#e8f4e8"}`, cursor: "pointer", fontFamily: sans, fontSize: 13, color: accentColor, fontWeight: 600, textAlign: "left" }}>
            {expanded ? "▲ Show less" : "▼ Show full details"}
          </button>

          {expanded && (
            <div style={{ padding: "0 20px 20px" }}>

              {/* Health */}
              {p.health?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>💊 Health Properties</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {p.health.map((h, i) => <span key={i} style={{ fontSize: 12, background: dark ? "rgba(45,106,79,0.15)" : "#f0f8f4", color: accentColor, padding: "4px 10px", borderRadius: 20 }}>{h}</span>)}
                  </div>
                </div>
              )}

              {/* Care */}
              {p.care && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🪴 Care Guide</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { icon: "💧", label: "Water", value: p.care.water },
                      { icon: "☀️", label: "Light", value: p.care.light },
                      { icon: "🌱", label: "Soil", value: p.care.soil },
                      { icon: "⭐", label: "Difficulty", value: p.care.difficulty },
                    ].map((c, i) => (
                      <div key={i} style={{ background: dark ? "rgba(0,0,0,0.2)" : "#f8fff8", padding: "10px 14px", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: mutedColor, marginBottom: 2 }}>{c.icon} {c.label}</div>
                        <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: textColor }}>{c.value || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indigenous knowledge */}
              {p.indigenous && (
                <div style={{ marginBottom: 20, background: dark ? "rgba(45,106,79,0.1)" : "#f0f8f4", borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${accentColor}` }}>
                  <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: accentColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🌍 Indigenous Knowledge</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: textColor, lineHeight: 1.7 }}>{p.indigenous}</p>
                </div>
              )}

              {/* Seasonal */}
              {p.seasonal && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🌸 Seasonal Care</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: textColor, lineHeight: 1.7 }}>{p.seasonal}</p>
                </div>
              )}

              {/* Recipes */}
              {p.recipes?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🍳 Che AF Recipe Ideas</p>
                  {p.recipes.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${dark ? "rgba(45,106,79,0.1)" : "#e8f4e8"}` }}>
                      <span style={{ color: "#c4622d" }}>🍳</span>
                      <span style={{ fontFamily: sans, fontSize: 13, color: textColor }}>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cocktails */}
              {p.cocktails?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🍹 Mix-R Cocktail Ideas</p>
                  {p.cocktails.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${dark ? "rgba(45,106,79,0.1)" : "#e8f4e8"}` }}>
                      <span style={{ color: "#2563eb" }}>🍹</span>
                      <span style={{ fontFamily: sans, fontSize: 13, color: textColor }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Fun fact */}
              {p.funFact && (
                <div style={{ marginBottom: 20, background: dark ? "rgba(0,0,0,0.2)" : "#fffbeb", borderRadius: 12, padding: "14px 16px", borderLeft: "3px solid #d97706" }}>
                  <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: "#d97706", marginBottom: 6 }}>💡 Did you know?</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: textColor, lineHeight: 1.7 }}>{p.funFact}</p>
                </div>
              )}

              {/* ── SOURCE ATTRIBUTION ── */}
              <div style={{ marginTop: 8, padding: "14px 16px", background: dark ? "rgba(0,0,0,0.2)" : "#f8f8f8", borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>📚 Learn More & Sources</p>

                <a href={wikiUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>📖</span>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: accentColor }}>Wikipedia</div>
                      <div style={{ fontFamily: sans, fontSize: 11, color: mutedColor }}>{p.scientificName || p.name}</div>
                    </div>
                  </div>
                  <span style={{ color: accentColor, fontSize: 14 }}>↗</span>
                </a>

                <a href={`https://www.gbif.org/search?q=${encodeURIComponent(p.scientificName || p.name)}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>🌍</span>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: accentColor }}>GBIF — Global Biodiversity</div>
                      <div style={{ fontFamily: sans, fontSize: 11, color: mutedColor }}>Scientific plant database</div>
                    </div>
                  </div>
                  <span style={{ color: accentColor, fontSize: 14 }}>↗</span>
                </a>

                <a href={`https://www.rhs.org.uk/search?query=${encodeURIComponent(p.name)}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>🌸</span>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: accentColor }}>RHS — Royal Horticultural Society</div>
                      <div style={{ fontFamily: sans, fontSize: 11, color: mutedColor }}>Care guides & gardening advice</div>
                    </div>
                  </div>
                  <span style={{ color: accentColor, fontSize: 14 }}>↗</span>
                </a>

                <p style={{ fontFamily: sans, fontSize: 11, color: mutedColor, marginTop: 12, lineHeight: 1.6 }}>
                  Plant data is AI-generated using Claude (Anthropic) and cross-referenced with publicly available sources. Always consult a qualified professional before using any plant for medicinal purposes.
                </p>
              </div>

            </div>
          )}
        </>
      )}

      {compact && p.health?.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          {p.health.slice(0, 2).map((h, i) => (
            <span key={i} style={{ fontSize: 11, background: dark ? "rgba(45,106,79,0.15)" : "#f0f8f4", color: accentColor, padding: "3px 8px", borderRadius: 20, marginRight: 6 }}>{h}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlantCard;
