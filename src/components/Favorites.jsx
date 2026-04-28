// src/components/Favorites.jsx
import PlantCard from "./PlantCard";

export function Favorites({ favorites, onToggleFavorite, accentColor, cardBg, textColor, mutedColor, dark }) {
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans  = "'DM Sans', system-ui, sans-serif";

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 20, color: textColor }}>
        <em style={{ color: accentColor, fontStyle: "italic" }}>Saved</em> Plants
      </h2>
      {favorites.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💚</div>
          <p style={{ fontFamily: sans, color: mutedColor }}>No saved plants yet</p>
          <p style={{ fontFamily: sans, fontSize: 13, color: mutedColor, marginTop: 8 }}>Tap 🤍 on any plant to save it here</p>
        </div>
      ) : (
        favorites.map((p, i) => (
          <PlantCard key={i} plant={p} onToggleFavorite={onToggleFavorite} isFavorite={true} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />
        ))
      )}
    </div>
  );
}

export default Favorites;
