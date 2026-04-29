// src/components/ScanScreen.jsx
import { useState, useRef } from "react";
import { callAI } from "../utils/callAI";
import PlantCard from "./PlantCard";

export function ScanScreen({ plants, onAddPlant, onToggleFavorite, favorites, canScan, onScan, accentColor, cardBg, textColor, mutedColor, dark }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [scannedPhoto, setScannedPhoto] = useState(null);
  const cameraRef = useRef();
  const galleryRef = useRef();

  const sans  = "'DM Sans', system-ui, sans-serif";
  const serif = "'Cormorant Garamond', Georgia, serif";

  async function handleScan(imageBase64, photoUrl) {
    if (!canScan) { setError("You've used all 10 free scans this month. Upgrade to Pro for unlimited scans!"); return; }
    setScanning(true); setError(""); setResult(null);
    try {
      onScan();
      const prompt = imageBase64
        ? `You are a plant identification expert. Analyze this plant image and return ONLY a valid JSON object (no markdown, no backticks) with these exact fields: {"id":"unique-slug","name":"Common name","scientificName":"Scientific name","emoji":"relevant emoji","origin":"Geographic origin","type":"Plant type","care":{"water":"Low/Moderate/High","light":"Light needs","soil":"Soil type","difficulty":"Easy/Medium/Hard"},"health":["property1","property2","property3"],"indigenous":"Traditional cultural knowledge","recipes":["recipe1","recipe2"],"cocktails":["cocktail1"],"toxicity":{"safe":true,"pets":true,"children":true},"seasonal":"Seasonal care tips","funFact":"Interesting fact","wikiImage":"Leave this empty string"}`
        : `You are a plant expert. The user describes this plant: "${manualInput}". Return ONLY a valid JSON object (no markdown, no backticks) with these exact fields: {"id":"unique-slug","name":"Common name","scientificName":"Scientific name","emoji":"relevant emoji","origin":"Geographic origin","type":"Plant type","care":{"water":"Low/Moderate/High","light":"Light needs","soil":"Soil type","difficulty":"Easy/Medium/Hard"},"health":["property1","property2","property3"],"indigenous":"Traditional cultural knowledge","recipes":["recipe1","recipe2"],"cocktails":["cocktail1"],"toxicity":{"safe":true,"pets":true,"children":true},"seasonal":"Seasonal care tips","funFact":"Interesting fact","wikiImage":"Leave this empty string"}`;

      const raw = await callAI(prompt, imageBase64 || null);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      parsed.generated = true;

      // Attach the scanned photo if taken
      if (photoUrl) parsed.userPhoto = photoUrl;

      // Fetch a Wikipedia/Wikimedia reference image
      try {
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(parsed.scientificName || parsed.name)}`);
        const wikiData = await wikiRes.json();
        if (wikiData.thumbnail?.source) parsed.wikiImage = wikiData.thumbnail.source;
      } catch (_) { /* no image — that's fine */ }

      setResult(parsed);
      onAddPlant(parsed);
    } catch (e) {
      setError("Could not identify plant — try again or type the plant name below.");
    }
    setScanning(false);
  }

  function handleFileChange(e, isCamera) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(",")[1];
      if (isCamera) setScannedPhoto(dataUrl); // show camera photo
      handleScan(base64, isCamera ? dataUrl : null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 4, color: textColor }}>
        Scan a <em style={{ color: accentColor, fontStyle: "italic" }}>Plant</em>
      </h2>
      <p style={{ fontSize: 13, color: mutedColor, marginBottom: 24 }}>Take a photo or upload from your gallery — AI identifies it instantly</p>

      {/* Two buttons — Camera and Upload */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <button onClick={() => cameraRef.current.click()} disabled={scanning || !canScan}
          style={{ padding: "20px 16px", background: canScan ? accentColor : "#ccc", color: "#fff", border: "none", fontFamily: sans, fontWeight: 600, fontSize: 14, cursor: canScan ? "pointer" : "not-allowed", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 32 }}>📷</span>
          Take Photo
        </button>
        <button onClick={() => galleryRef.current.click()} disabled={scanning || !canScan}
          style={{ padding: "20px 16px", background: dark ? "rgba(45,106,79,0.2)" : "#f0f8f4", color: canScan ? accentColor : "#ccc", border: `2px solid ${canScan ? accentColor : "#ccc"}`, fontFamily: sans, fontWeight: 600, fontSize: 14, cursor: canScan ? "pointer" : "not-allowed", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 32 }}>🖼️</span>
          Upload Photo
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e => handleFileChange(e, true)} style={{ display: "none" }} />
      <input ref={galleryRef} type="file" accept="image/*" onChange={e => handleFileChange(e, false)} style={{ display: "none" }} />

      {/* Manual input */}
      <div style={{ background: cardBg, borderRadius: 16, padding: 20, marginBottom: 20, border: `1px solid ${dark ? "rgba(45,106,79,0.2)" : "#e2e8f0"}` }}>
        <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 12 }}>✍️ Or type a plant name</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={manualInput} onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && manualInput.trim() && handleScan(null, null)}
            placeholder="e.g. Lavender, Aloe Vera, Kawakawa…"
            style={{ flex: 1, padding: "12px 14px", border: `1px solid ${dark ? "#333" : "#e2e8f0"}`, borderRadius: 10, fontFamily: sans, fontSize: 14, background: dark ? "#1a2a1a" : "#fafaf8", color: textColor, outline: "none" }}
          />
          <button onClick={() => manualInput.trim() && handleScan(null, null)} disabled={scanning || !manualInput.trim()}
            style={{ padding: "12px 20px", background: accentColor, color: "#fff", border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 600, cursor: "pointer" }}>
            Go
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}><p style={{ color: "#e53e3e", fontSize: 13, margin: 0 }}>{error}</p></div>}

      {scanning && (
        <div style={{ textAlign: "center", padding: 40 }}>
          {scannedPhoto && <img src={scannedPhoto} alt="Scanning…" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 20, opacity: 0.7 }} />}
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontFamily: sans, color: mutedColor }}>Identifying your plant…</p>
        </div>
      )}

      {result && !scanning && (
        <div>
          <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: accentColor, marginBottom: 12 }}>✅ Plant identified!</p>

          {/* Show scanned photo or wiki reference image */}
          {(result.userPhoto || result.wikiImage) && (
            <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", position: "relative" }}>
              <img
                src={result.userPhoto || result.wikiImage}
                alt={result.name}
                style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 20 }}>
                <span style={{ fontSize: 11, color: "#fff" }}>{result.userPhoto ? "📷 Your photo" : "🌐 Reference image"}</span>
              </div>
            </div>
          )}

          <PlantCard plant={result} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(f => f.id === result.id)} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />
        </div>
      )}

      {!result && !scanning && (
        <div>
          <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: mutedColor, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Recent Plants</p>
          {plants.slice(0, 3).map((p, i) => (
            <PlantCard key={i} plant={p} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(f => f.id === p.id)} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} compact />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScanScreen;
