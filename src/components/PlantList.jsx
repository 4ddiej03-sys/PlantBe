// src/components/PlantList.jsx
import { useState } from "react";
import PlantCard from "./PlantCard";

export function PlantList({ plants, favorites, onToggleFavorite, accentColor, cardBg, textColor, mutedColor, dark }) {
  const [search, setSearch] = useState("");
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans  = "'DM Sans', system-ui, sans-serif";

  const filtered = plants.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.type?.toLowerCase().includes(search.toLowerCase()) ||
    p.origin?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 16, color: textColor }}>
        My <em style={{ color: accentColor, fontStyle: "italic" }}>Plants</em>
      </h2>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search plants…"
        style={{ width: "100%", padding: "12px 16px", border: `1px solid ${dark ? "#333" : "#e2e8f0"}`, borderRadius: 12, fontFamily: sans, fontSize: 14, background: dark ? "#1a2a1a" : "#fafaf8", color: textColor, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
      />
      {filtered.length === 0 && (
        <p style={{ color: mutedColor, textAlign: "center", padding: 40 }}>No plants found 🌿</p>
      )}
      {filtered.map((p, i) => (
        <PlantCard key={i} plant={p} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(f => f.id === p.id)} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />
      ))}
    </div>
  );
}

export default PlantList;
