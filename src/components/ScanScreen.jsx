// src/components/ScanScreen.jsx
import { useState, useRef } from "react";
import { callAI } from "../utils/callAI";
import { savePhoto } from "../utils/photoStorage";
import PlantCard from "./PlantCard";

export function ScanScreen({ plants, onAddPlant, onToggleFavorite, favorites, canScan, onScan, accentColor, cardBg, textColor, mutedColor, dark }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [userPhoto, setUserPhoto] = useState(null);
  const [wikiPhoto, setWikiPhoto] = useState(null);
  const [photoChoice, setPhotoChoice] = useState(null);
  const [photoSaved, setPhotoSaved] = useState(false);
  const cameraRef = useRef();
  const galleryRef = useRef();

  const sans  = "'DM Sans', system-ui, sans-serif";
  const serif = "'Cormorant Garamond', Georgia, serif";

  async function handleScan(imageBase64, capturedPhoto) {
    if (!canScan) { setError("You've used all 10 free scans. Upgrade to Pro for unlimited!"); return; }
    setScanning(true); setError(""); setResult(null);
    setPhotoChoice(null); setPhotoSaved(false);

    try {
      onScan();
      const prompt = imageBase64
        ? `You are a plant identification expert. Analyze this plant image and return ONLY valid JSON (no markdown, no backticks): {"id":"unique-slug","name":"Common name","scientificName":"Scientific name","emoji":"emoji","origin":"origin","type":"Plant type","care":{"water":"Low/Moderate/High","light":"light needs","soil":"soil type","difficulty":"Easy/Medium/Hard"},"health":["p1","p2","p3"],"indigenous":"traditional knowledge","recipes":["r1","r2"],"cocktails":["c1"],"toxicity":{"safe":true,"pets":true,"children":true},"seasonal":"care tips","funFact":"fact"}`
        : `You are a plant expert. Plant: "${manualInput}". Return ONLY valid JSON (no markdown, no backticks): {"id":"unique-slug","name":"Common name","scientificName":"Scientific name","emoji":"emoji","origin":"origin","type":"Plant type","care":{"water":"Low/Moderate/High","light":"light needs","soil":"soil type","difficulty":"Easy/Medium/Hard"},"health":["p1","p2","p3"],"indigenous":"traditional knowledge","recipes":["r1","r2"],"cocktails":["c1"],"toxicity":{"safe":true,"pets":true,"children":true},"seasonal":"care tips","funFact":"fact"}`;

      const raw = await callAI(prompt, imageBase64 || null);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      parsed.generated = true;

      // Fetch Wikipedia reference image
      let wikiImageUrl = null;
      try {
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(parsed.scientificName || parsed.name)}`);
        const wikiData = await wikiRes.json();
        if (wikiData.thumbnail?.source) wikiImageUrl = wikiData.thumbnail.source;
      } catch (_) {}

      setUserPhoto(capturedPhoto || null);
      setWikiPhoto(wikiImageUrl);
      setResult(parsed);
      onAddPlant(parsed);
    } catch (e) {
      setError("Could not identify plant — try again or type the name below.");
    }
    setScanning(false);
  }

  async function handlePhotoChoice(choice) {
    setPhotoChoice(choice);
    if (!result || choice === "none") return;
    if (choice === "user" && userPhoto) {
      await savePhoto(result.id, { type: "user", url: userPhoto });
    } else if (choice === "wiki" && wikiPhoto) {
      await savePhoto(result.id, { type: "wiki", url: wikiPhoto });
    } else if (choice === "both") {
      await savePhoto(result.id, { type: "both", userUrl: userPhoto, wikiUrl: wikiPhoto });
    }
    setPhotoSaved(true);
  }

  function handleFileChange(e, isCamera) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      handleScan(dataUrl.split(",")[1], isCamera ? dataUrl : null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 4, color: textColor }}>
        Scan a <em style={{ color: accentColor, fontStyle: "italic" }}>Plant</em>
      </h2>
      <p style={{ fontSize: 13, color: mutedColor, marginBottom: 24 }}>Take a photo or upload — AI identifies it instantly</p>

      {!result && !scanning && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <button onClick={() => cameraRef.current.click()} disabled={!canScan}
              style={{ padding: "20px 16px", background: canScan ? accentColor : "#ccc", color: "#fff", border: "none", fontFamily: sans, fontWeight: 600, fontSize: 14, cursor: canScan ? "pointer" : "not-allowed", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 32 }}>📷</span>Take Photo
            </button>
            <button onClick={() => galleryRef.current.click()} disabled={!canScan}
              style={{ padding: "20px 16px", background: dark ? "rgba(45,106,79,0.2)" : "#f0f8f4", color: canScan ? accentColor : "#ccc", border: `2px solid ${canScan ? accentColor : "#ccc"}`, fontFamily: sans, fontWeight: 600, fontSize: 14, cursor: canScan ? "pointer" : "not-allowed", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 32 }}>🖼️</span>Upload Photo
            </button>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e => handleFileChange(e, true)} style={{ display: "none" }} />
          <input ref={galleryRef} type="file" accept="image/*" onChange={e => handleFileChange(e, false)} style={{ display: "none" }} />

          <div style={{ background: cardBg, borderRadius: 16, padding: 20, marginBottom: 20, border: `1px solid ${dark ? "rgba(45,106,79,0.2)" : "#e2e8f0"}` }}>
            <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 12 }}>✍️ Or type a plant name</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={manualInput} onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && manualInput.trim() && handleScan(null, null)}
                placeholder="e.g. Lavender, Aloe Vera, Kawakawa…"
                style={{ flex: 1, padding: "12px 14px", border: `1px solid ${dark ? "#333" : "#e2e8f0"}`, borderRadius: 10, fontFamily: sans, fontSize: 14, background: dark ? "#1a2a1a" : "#fafaf8", color: textColor, outline: "none" }}
              />
              <button onClick={() => manualInput.trim() && handleScan(null, null)} disabled={!manualInput.trim()}
                style={{ padding: "12px 20px", background: accentColor, color: "#fff", border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 600, cursor: "pointer" }}>
                Go
              </button>
            </div>
          </div>

          <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: mutedColor, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Recent Plants</p>
          {plants.slice(0, 3).map((p, i) => (
            <PlantCard key={i} plant={p} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(f => f.id === p.id)} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} compact />
          ))}
        </>
      )}

      {error && <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}><p style={{ color: "#e53e3e", fontSize: 13, margin: 0 }}>{error}</p></div>}

      {scanning && (
        <div style={{ textAlign: "center", padding: 40 }}>
          {userPhoto && <img src={userPhoto} alt="Scanning" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 20, opacity: 0.7 }} />}
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontFamily: sans, color: mutedColor }}>Identifying your plant…</p>
        </div>
      )}

      {result && !scanning && (
        <div>
          <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: accentColor, marginBottom: 16 }}>✅ Plant identified!</p>

          {/* Photo comparison + choice */}
          {(userPhoto || wikiPhoto) && (
            <div style={{ background: cardBg, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${dark ? "rgba(45,106,79,0.2)" : "#e8f4e8"}` }}>
              <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>📸 Photos</p>

              {/* Side by side photos */}
              <div style={{ display: "grid", gridTemplateColumns: userPhoto && wikiPhoto ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 16 }}>
                {userPhoto && (
                  <div style={{ position: "relative" }}>
                    <img src={userPhoto} alt="Your photo" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, display: "block" }} />
                    <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.65)", padding: "3px 8px", borderRadius: 10 }}>
                      <span style={{ fontSize: 10, color: "#fff" }}>📷 Your photo</span>
                    </div>
                  </div>
                )}
                {wikiPhoto && (
                  <div style={{ position: "relative" }}>
                    <img src={wikiPhoto} alt="Reference" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, display: "block" }} />
                    <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.65)", padding: "3px 8px", borderRadius: 10 }}>
                      <span style={{ fontSize: 10, color: "#fff" }}>🌐 Reference</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Choice buttons */}
              {!photoChoice && (
                <div>
                  <p style={{ fontFamily: sans, fontSize: 13, color: textColor, marginBottom: 10, fontWeight: 600 }}>Save to your device?</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {userPhoto && (
                      <button onClick={() => handlePhotoChoice("user")}
                        style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${accentColor}`, borderRadius: 10, fontFamily: sans, fontSize: 13, color: accentColor, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                        📷 Keep my photo only
                      </button>
                    )}
                    {wikiPhoto && (
                      <button onClick={() => handlePhotoChoice("wiki")}
                        style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${accentColor}`, borderRadius: 10, fontFamily: sans, fontSize: 13, color: accentColor, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                        🌐 Keep reference photo only
                      </button>
                    )}
                    {userPhoto && wikiPhoto && (
                      <button onClick={() => handlePhotoChoice("both")}
                        style={{ padding: "10px 16px", background: accentColor, border: "none", borderRadius: 10, fontFamily: sans, fontSize: 13, color: "#fff", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                        💚 Keep both photos
                      </button>
                    )}
                    <button onClick={() => handlePhotoChoice("none")}
                      style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${dark ? "#444" : "#e2e8f0"}`, borderRadius: 10, fontFamily: sans, fontSize: 13, color: mutedColor, cursor: "pointer", textAlign: "left" }}>
                      ✕ Don't save any photo
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {photoChoice && photoChoice !== "none" && photoSaved && (
                <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span>✅</span>
                  <p style={{ fontFamily: sans, fontSize: 13, color: "#276749", margin: 0, fontWeight: 600 }}>
                    Saved to your device only — not uploaded anywhere.
                  </p>
                </div>
              )}
              {photoChoice === "none" && (
                <p style={{ fontFamily: sans, fontSize: 12, color: mutedColor }}>No photo saved. 🌿</p>
              )}
            </div>
          )}

          <PlantCard plant={result} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(f => f.id === result.id)} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />

          <button onClick={() => { setResult(null); setUserPhoto(null); setWikiPhoto(null); setPhotoChoice(null); setPhotoSaved(false); setManualInput(""); }}
            style={{ width: "100%", padding: 14, background: "transparent", border: `1px solid ${accentColor}`, borderRadius: 12, fontFamily: sans, fontWeight: 600, fontSize: 14, color: accentColor, cursor: "pointer", marginTop: 8 }}>
            🌿 Scan Another Plant
          </button>
        </div>
      )}
    </div>
  );
}

export default ScanScreen;
