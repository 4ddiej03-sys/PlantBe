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
  const [lowConfidence, setLowConfidence] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const cameraRef = useRef();
  const galleryRef = useRef();

  const sans  = "'DM Sans', system-ui, sans-serif";
  const serif = "'Cormorant Garamond', Georgia, serif";

  // Improved prompt — asks for confidence score and alternatives
  function buildPrompt(isImage, input) {
    const fields = `{
  "id": "unique-lowercase-slug",
  "name": "Most likely common name",
  "scientificName": "Most likely scientific name",
  "emoji": "single relevant plant emoji",
  "origin": "Geographic origin",
  "type": "Plant type e.g. Herb, Succulent, Tree, Flower, Shrub, Fern",
  "confidence": 85,
  "alternatives": ["Possible plant 2", "Possible plant 3"],
  "care": {
    "water": "Low or Moderate or High",
    "light": "Full sun or Partial shade or Full shade",
    "soil": "Describe soil type",
    "difficulty": "Very Easy or Easy or Medium or Hard"
  },
  "health": ["Health property 1", "Health property 2", "Health property 3"],
  "indigenous": "Traditional or indigenous cultural knowledge about this plant. Include Māori, Filipino, Ayurvedic, Chinese medicine knowledge if applicable.",
  "recipes": ["Edible recipe idea 1", "Edible recipe idea 2"],
  "cocktails": ["Cocktail or drink idea using this plant"],
  "toxicity": {
    "safe": true,
    "pets": true,
    "children": true
  },
  "seasonal": "Seasonal care tips — when to prune, fertilise, repot",
  "funFact": "One genuinely interesting fact about this plant",
  "dataSource": "Wikipedia, Kew Gardens, Plants of the World Online or other reliable source"
}`;

    if (isImage) {
      return `You are an expert botanist and plant identification specialist with access to global plant databases including Plants of the World Online, Kew Gardens, GBIF and Wikipedia.

Carefully examine this plant image and identify it. Be precise and scientific.

IMPORTANT RULES:
- If you are less than 60% confident, set confidence below 60 and clearly say so in the name field: "Possibly [name]"
- Always provide 2 alternative plant names in the "alternatives" field
- For toxicity, err on the side of caution — if unsure, mark as not safe
- For indigenous knowledge, include Māori rongoā, Filipino herbal medicine, Ayurveda and traditional Chinese medicine where relevant
- Be honest if the image is unclear — say "Image unclear — try a closer photo"

Return ONLY valid JSON matching this exact structure (no markdown, no backticks, no explanation):
${fields}`;
    } else {
      return `You are an expert botanist with deep knowledge of global plant species, traditional medicine and ethnobotany.

The user is asking about this plant: "${input}"

Provide comprehensive, accurate information. Cross-reference with Plants of the World Online, Kew Gardens and Wikipedia.

IMPORTANT RULES:
- Set confidence to 95+ if this is a well-known plant, lower if obscure
- Always provide 2 alternative or related plants in "alternatives"
- For toxicity, err on the side of caution
- Include indigenous knowledge from multiple cultures where relevant
- For recipes and cocktails, only include ideas if the plant is actually edible/usable

Return ONLY valid JSON matching this exact structure (no markdown, no backticks):
${fields}`;
    }
  }

  // Fetch reference image from multiple sources
  async function fetchReferenceImage(scientificName, commonName) {
    // Try Wikipedia first
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName || commonName)}`);
      const data = await res.json();
      if (data.thumbnail?.source) return data.thumbnail.source;
    } catch (_) {}

    // Try with common name if scientific failed
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(commonName)}`);
      const data = await res.json();
      if (data.thumbnail?.source) return data.thumbnail.source;
    } catch (_) {}

    // Try Wikimedia Commons via Wikipedia search
    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(scientificName || commonName)}&prop=pageimages&format=json&pithumbsize=400&origin=*`);
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0];
        if (page.thumbnail?.source) return page.thumbnail.source;
      }
    } catch (_) {}

    return null;
  }

  async function handleScan(imageBase64, capturedPhoto) {
    if (!canScan) { setError("You've used all 10 free scans. Upgrade to Pro for unlimited!"); return; }
    setScanning(true); setError(""); setResult(null);
    setPhotoChoice(null); setPhotoSaved(false);
    setLowConfidence(false); setAlternatives([]);

    try {
      onScan();
      const prompt = buildPrompt(!!imageBase64, manualInput);
      const raw = await callAI(prompt, imageBase64 || null);
      const clean = raw.replace(/```json|```/g, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch (parseErr) {
        // Try to extract JSON from response if it has extra text
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse plant data");
        }
      }

      parsed.generated = true;

      // Check confidence
      const conf = parsed.confidence || 80;
      if (conf < 60) {
        setLowConfidence(true);
        parsed.name = parsed.name.startsWith("Possibly") ? parsed.name : `Possibly ${parsed.name}`;
      }

      // Set alternatives
      if (parsed.alternatives?.length) setAlternatives(parsed.alternatives);

      // Fetch reference image from multiple sources
      const wikiImg = await fetchReferenceImage(parsed.scientificName, parsed.name.replace("Possibly ", ""));
      setUserPhoto(capturedPhoto || null);
      setWikiPhoto(wikiImg);
      setResult(parsed);
      onAddPlant(parsed);
    } catch (e) {
      console.error(e);
      setError("Could not identify plant. Tips: get closer, ensure good lighting, try from a different angle, or type the plant name below.");
    }
    setScanning(false);
  }

  async function handlePhotoChoice(choice) {
    setPhotoChoice(choice);
    if (!result || choice === "none") return;
    if (choice === "user" && userPhoto) await savePhoto(result.id, { type: "user", url: userPhoto });
    else if (choice === "wiki" && wikiPhoto) await savePhoto(result.id, { type: "wiki", url: wikiPhoto });
    else if (choice === "both") await savePhoto(result.id, { type: "both", userUrl: userPhoto, wikiUrl: wikiPhoto });
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

  function scanAlternative(plantName) {
    setManualInput(plantName);
    setResult(null); setUserPhoto(null); setWikiPhoto(null);
    setPhotoChoice(null); setPhotoSaved(false);
    setLowConfidence(false); setAlternatives([]);
    // Auto-trigger scan with the alternative name
    setTimeout(() => handleScan(null, null), 100);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 4, color: textColor }}>
        Scan a <em style={{ color: accentColor, fontStyle: "italic" }}>Plant</em>
      </h2>
      <p style={{ fontSize: 13, color: mutedColor, marginBottom: 24 }}>Take a photo or upload — AI identifies it instantly</p>

      {!result && !scanning && (
        <>
          {/* Camera + Upload buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
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

          {/* Photo tips */}
          <div style={{ background: dark ? "rgba(45,106,79,0.08)" : "#f0f8f4", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
            <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: accentColor, marginBottom: 6 }}>📸 Tips for best results:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {["Get close to the plant", "Good natural lighting", "Focus on leaves or flowers", "Avoid blurry shots"].map((tip, i) => (
                <div key={i} style={{ fontFamily: sans, fontSize: 11, color: mutedColor, display: "flex", gap: 6 }}>
                  <span style={{ color: accentColor }}>✓</span>{tip}
                </div>
              ))}
            </div>
          </div>

          {/* Manual input */}
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

          {/* Recent plants */}
          <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: mutedColor, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Recent Plants</p>
          {plants.slice(0, 3).map((p, i) => (
            <PlantCard key={i} plant={p} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(f => f.id === p.id)} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} compact />
          ))}
        </>
      )}

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <p style={{ color: "#e53e3e", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>⚠️ Could not identify</p>
          <p style={{ color: "#e53e3e", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
          <button onClick={() => { setError(""); }}
            style={{ padding: "8px 16px", background: "#e53e3e", color: "#fff", border: "none", borderRadius: 8, fontFamily: sans, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Try Again
          </button>
        </div>
      )}

      {scanning && (
        <div style={{ textAlign: "center", padding: 40 }}>
          {userPhoto && <img src={userPhoto} alt="Scanning" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 20, opacity: 0.7 }} />}
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontFamily: sans, color: textColor, fontWeight: 600, marginBottom: 8 }}>Identifying your plant…</p>
          <p style={{ fontFamily: sans, fontSize: 12, color: mutedColor }}>Cross-referencing botanical databases</p>
        </div>
      )}

      {result && !scanning && (
        <div>
          {/* Confidence warning */}
          {lowConfidence && (
            <div style={{ background: dark ? "rgba(217,119,6,0.1)" : "#fffbeb", border: "1px solid rgba(217,119,6,0.4)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: "#d97706", marginBottom: 6 }}>⚠️ Low confidence identification</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: textColor, marginBottom: 12 }}>The image may be unclear, blurry or the plant may be unusual. Try a closer photo with better lighting for a more accurate result.</p>
              {alternatives.length > 0 && (
                <div>
                  <p style={{ fontFamily: sans, fontSize: 12, color: mutedColor, marginBottom: 8 }}>Could also be:</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {alternatives.map((alt, i) => (
                      <button key={i} onClick={() => scanAlternative(alt)}
                        style={{ padding: "6px 12px", background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 20, fontFamily: sans, fontSize: 12, color: "#d97706", fontWeight: 600, cursor: "pointer" }}>
                        {alt} →
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* High confidence */}
          {!lowConfidence && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: accentColor }}>
                Plant identified! {result.confidence ? `(${result.confidence}% confidence)` : ""}
              </p>
            </div>
          )}

          {/* Alternatives even on high confidence */}
          {!lowConfidence && alternatives.length > 0 && (
            <div style={{ background: cardBg, borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: `1px solid ${dark ? "rgba(45,106,79,0.15)" : "#e8f4e8"}` }}>
              <p style={{ fontFamily: sans, fontSize: 12, color: mutedColor, marginBottom: 8 }}>Could also be:</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {alternatives.map((alt, i) => (
                  <button key={i} onClick={() => scanAlternative(alt)}
                    style={{ padding: "6px 12px", background: dark ? "rgba(45,106,79,0.15)" : "#f0f8f4", border: `1px solid ${accentColor}`, borderRadius: 20, fontFamily: sans, fontSize: 12, color: accentColor, fontWeight: 600, cursor: "pointer" }}>
                    {alt} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photo choice */}
          {(userPhoto || wikiPhoto) && (
            <div style={{ background: cardBg, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${dark ? "rgba(45,106,79,0.2)" : "#e8f4e8"}` }}>
              <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>📸 Photos</p>
              <div style={{ display: "grid", gridTemplateColumns: userPhoto && wikiPhoto ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 16 }}>
                {userPhoto && (
                  <div style={{ position: "relative" }}>
                    <img src={userPhoto} alt="Your photo" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }} />
                    <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.65)", padding: "3px 8px", borderRadius: 10 }}>
                      <span style={{ fontSize: 10, color: "#fff" }}>📷 Your photo</span>
                    </div>
                  </div>
                )}
                {wikiPhoto && (
                  <div style={{ position: "relative" }}>
                    <img src={wikiPhoto} alt="Reference" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }} />
                    <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.65)", padding: "3px 8px", borderRadius: 10 }}>
                      <span style={{ fontSize: 10, color: "#fff" }}>🌐 Reference</span>
                    </div>
                  </div>
                )}
              </div>

              {!photoChoice && (
                <div>
                  <p style={{ fontFamily: sans, fontSize: 13, color: textColor, marginBottom: 10, fontWeight: 600 }}>Save to your device?</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {userPhoto && <button onClick={() => handlePhotoChoice("user")} style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${accentColor}`, borderRadius: 10, fontFamily: sans, fontSize: 13, color: accentColor, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>📷 Keep my photo only</button>}
                    {wikiPhoto && <button onClick={() => handlePhotoChoice("wiki")} style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${accentColor}`, borderRadius: 10, fontFamily: sans, fontSize: 13, color: accentColor, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>🌐 Keep reference photo only</button>}
                    {userPhoto && wikiPhoto && <button onClick={() => handlePhotoChoice("both")} style={{ padding: "10px 16px", background: accentColor, border: "none", borderRadius: 10, fontFamily: sans, fontSize: 13, color: "#fff", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>💚 Keep both photos</button>}
                    <button onClick={() => handlePhotoChoice("none")} style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${dark ? "#444" : "#e2e8f0"}`, borderRadius: 10, fontFamily: sans, fontSize: 13, color: mutedColor, cursor: "pointer", textAlign: "left" }}>✕ Don't save any photo</button>
                  </div>
                </div>
              )}
              {photoChoice && photoChoice !== "none" && photoSaved && (
                <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span>✅</span><p style={{ fontFamily: sans, fontSize: 13, color: "#276749", margin: 0, fontWeight: 600 }}>Saved to your device only.</p>
                </div>
              )}
              {photoChoice === "none" && <p style={{ fontFamily: sans, fontSize: 12, color: mutedColor }}>No photo saved. 🌿</p>}
            </div>
          )}

          <PlantCard plant={result} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(f => f.id === result.id)} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />

          <button onClick={() => { setResult(null); setUserPhoto(null); setWikiPhoto(null); setPhotoChoice(null); setPhotoSaved(false); setManualInput(""); setLowConfidence(false); setAlternatives([]); }}
            style={{ width: "100%", padding: 14, background: "transparent", border: `1px solid ${accentColor}`, borderRadius: 12, fontFamily: sans, fontWeight: 600, fontSize: 14, color: accentColor, cursor: "pointer", marginTop: 8 }}>
            🌿 Scan Another Plant
          </button>
        </div>
      )}
    </div>
  );
}

export default ScanScreen;
