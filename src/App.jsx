// src/App.jsx
import { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { BottomNav } from "./components/BottomNav";
import { ScanScreen } from "./components/ScanScreen";
import { PlantList } from "./components/PlantList";
import { Favorites } from "./components/Favorites";
import { SettingsScreen } from "./components/SettingsScreen";
import LandingPage from "./components/LandingPage";
import { supabase, loadUserData, saveUserData } from "./utils/supabase";

const DEFAULT_SETTINGS = {
  darkMode: false,
  largeText: false,
  highContrast: false,
  voiceEnabled: false,
  language: "en",
};

const DEFAULT_PLANTS = [
  {
    id: "kawakawa",
    name: "Kawakawa",
    scientificName: "Piper excelsum",
    emoji: "🌿",
    origin: "Aotearoa New Zealand",
    type: "Medicinal Herb",
    care: { water: "Moderate", light: "Partial shade", soil: "Rich, moist", difficulty: "Easy" },
    health: ["Anti-inflammatory", "Digestive aid", "Pain relief"],
    indigenous: "Sacred to Māori — used in rongoā (traditional medicine). Leaves with most insect holes are most potent.",
    recipes: ["Kawakawa tea", "Kawakawa syrup"],
    cocktails: ["Kawakawa gin cocktail", "Māori bush mojito"],
    toxicity: { safe: true, pets: true, children: true },
    seasonal: "Prune lightly in spring. Grows year-round in NZ.",
    funFact: "In Māori culture, kawakawa wreaths are worn at tangihanga (funerals) to honour the deceased.",
  },
  {
    id: "lavender",
    name: "Lavender",
    scientificName: "Lavandula angustifolia",
    emoji: "💜",
    origin: "Mediterranean",
    type: "Aromatic Herb",
    care: { water: "Low", light: "Full sun", soil: "Well-drained", difficulty: "Easy" },
    health: ["Stress relief", "Sleep aid", "Antiseptic"],
    indigenous: "Used in Ayurvedic medicine for centuries as a calming and healing herb.",
    recipes: ["Lavender shortbread", "Lavender honey", "Herbal tea"],
    cocktails: ["Lavender lemonade", "Lavender gin fizz"],
    toxicity: { safe: true, pets: false, children: true },
    seasonal: "Prune after flowering in summer. Protect from frost.",
    funFact: "Romans added lavender to their baths — the name comes from the Latin 'lavare' meaning 'to wash'.",
  },
  {
    id: "aloe-vera",
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis miller",
    emoji: "🌵",
    origin: "Arabian Peninsula",
    type: "Succulent",
    care: { water: "Very low", light: "Bright indirect", soil: "Sandy, well-drained", difficulty: "Very Easy" },
    health: ["Burn healing", "Skin moisturiser", "Digestive health"],
    indigenous: "Used in Filipino traditional medicine (albularyo) for skin ailments and wounds.",
    recipes: ["Aloe vera juice", "Aloe smoothie"],
    cocktails: ["Aloe vera cooler", "Tropical aloe cocktail"],
    toxicity: { safe: true, pets: false, children: false },
    seasonal: "Keep indoors in winter. Water once every 2-3 weeks.",
    funFact: "Aloe vera has been used medicinally for over 6,000 years — it was found in Egyptian tombs.",
  },
  {
    id: "pandan",
    name: "Pandan",
    scientificName: "Pandanus amaryllifolius",
    emoji: "🌱",
    origin: "Southeast Asia",
    type: "Tropical Herb",
    care: { water: "High", light: "Partial sun", soil: "Moist, fertile", difficulty: "Medium" },
    health: ["Blood sugar control", "Pain relief", "Antioxidant"],
    indigenous: "Deeply embedded in Filipino, Malaysian and Indonesian cooking and traditional medicine.",
    recipes: ["Pandan cake", "Pandan rice", "Pandan coconut pudding"],
    cocktails: ["Pandan gin", "Pandan mojito"],
    toxicity: { safe: true, pets: true, children: true },
    seasonal: "Thrives year-round in tropical climates. Keep warm indoors in winter.",
    funFact: "Pandan is called the 'vanilla of Asia' — it gives a unique green colour and sweet fragrance.",
  },
  {
    id: "mint",
    name: "Mint",
    scientificName: "Mentha",
    emoji: "🍃",
    origin: "Mediterranean & Asia",
    type: "Culinary Herb",
    care: { water: "Moderate", light: "Partial sun", soil: "Moist, fertile", difficulty: "Very Easy" },
    health: ["Digestive aid", "Headache relief", "Breath freshener"],
    indigenous: "Used across cultures from Ancient Egypt to Māori rongoā for digestive and respiratory health.",
    recipes: ["Mint tea", "Mint chutney", "Tabbouleh"],
    cocktails: ["Classic mojito", "Mint julep", "Moroccan mint tea"],
    toxicity: { safe: true, pets: false, children: true },
    seasonal: "Cut back hard in autumn. Spreads quickly — best grown in pots.",
    funFact: "Mint spreads so aggressively it can take over a garden — ancient Greeks used it to scent their halls.",
  },
  {
    id: "turmeric",
    name: "Turmeric",
    scientificName: "Curcuma longa",
    emoji: "🟡",
    origin: "South Asia",
    type: "Root Spice",
    care: { water: "Moderate", light: "Partial shade", soil: "Rich, well-drained", difficulty: "Medium" },
    health: ["Anti-inflammatory", "Antioxidant", "Immune boost"],
    indigenous: "Central to Ayurvedic medicine — the golden spice used for 4,000 years across India.",
    recipes: ["Golden milk", "Turmeric curry", "Turmeric rice"],
    cocktails: ["Golden turmeric latte", "Turmeric ginger shot"],
    toxicity: { safe: true, pets: false, children: true },
    seasonal: "Harvest rhizomes in autumn when leaves yellow. Replant in spring.",
    funFact: "Turmeric contains curcumin which gives it the yellow colour — it was used as a dye before it was a spice.",
  },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const [tab, setTab] = useState("scan");
  const [plants, setPlants] = useState(DEFAULT_PLANTS);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [syncing, setSyncing] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const FREE_LIMIT = 10;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setShowLanding(true);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setShowLanding(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setShowLanding(false);
    loadUserData(user.id).then(data => {
      if (data) {
        if (data.plants?.length) setPlants(data.plants);
        if (data.favorites?.length) setFavorites(data.favorites);
        if (data.scan_count) setScanCount(data.scan_count);
        if (data.member_number === 1) { setIsFounder(true); setIsPro(true); }
        else if (data.is_pro) setIsPro(true);
      }
    }).catch(console.error);
  }, [user]);

  async function sync(newPlants, newFavorites, newSettings, newScanCount) {
    if (!user) return;
    setSyncing(true);
    try {
      await saveUserData(user.id, {
        plants:     newPlants    ?? plants,
        favorites:  newFavorites ?? favorites,
        settings:   newSettings  ?? settings,
        scan_count: newScanCount ?? scanCount,
      });
    } catch (e) { console.error(e); }
    setSyncing(false);
  }

  function handleSignOut() {
    supabase.auth.signOut();
    setPlants(DEFAULT_PLANTS);
    setFavorites([]);
    setSettings(DEFAULT_SETTINGS);
    setShowLanding(true);
    setUser(null);
  }

  function updateSettings(next) {
    setSettings(next);
    sync(null, null, next, null);
  }

  function addPlant(plant) {
    const next = [plant, ...plants.filter(p => p.id !== plant.id)];
    setPlants(next);
    sync(next, null, null, null);
  }

  function toggleFavorite(plant) {
    const isFav = favorites.some(f => f.id === plant.id);
    const next = isFav ? favorites.filter(f => f.id !== plant.id) : [plant, ...favorites];
    setFavorites(next);
    sync(null, next, null, null);
  }

  function incrementScan() {
    const next = scanCount + 1;
    setScanCount(next);
    sync(null, null, null, next);
  }

  const canScan = isFounder || isPro || scanCount < FREE_LIMIT;
  const scansLeft = isFounder || isPro ? "∞" : Math.max(0, FREE_LIMIT - scanCount);

  const dark = settings.darkMode;
  const appBg    = dark ? "#0a0f0a" : "#f5f9f5";
  const cardBg   = dark ? "#1a2a1a" : "#fff";
  const textColor = dark ? "#e8f5e8" : "#1a2a1a";
  const mutedColor = dark ? "#6a8a6a" : "#718096";
  const accentColor = "#2d6a4f";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0f0a", gap: 16 }}>
      <div style={{ fontSize: 64 }}>🌿</div>
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, color: "rgba(232,245,232,0.5)", letterSpacing: 2 }}>PLANT BE</div>
    </div>
  );

  if (showLanding && !user) return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  if (!user) return <AuthScreen onAuth={u => { setUser(u); setShowLanding(false); }} />;

  return (
    <div style={{ minHeight: "100vh", background: appBg, color: textColor, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: settings.largeText ? 17 : 15, maxWidth: 480, margin: "0 auto", position: "relative" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", background: cardBg, borderBottom: `1px solid ${dark ? "rgba(45,106,79,0.2)" : "rgba(45,106,79,0.1)"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 700, color: textColor, lineHeight: 1 }}>
              Plant <em style={{ color: accentColor, fontStyle: "italic" }}>Be</em>
            </div>
            <div style={{ fontSize: 10, color: mutedColor, letterSpacing: 1 }}>
              {syncing ? "☁️ Syncing…" : user.email.split("@")[0]}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isFounder && <span style={{ fontSize: 11, background: dark ? "#0a0f0a" : "#f0f8f4", color: accentColor, padding: "3px 8px", borderRadius: 50, fontWeight: 700, border: `1px solid ${accentColor}` }}>👑 Founder</span>}
          {isPro && !isFounder && <span style={{ fontSize: 11, background: accentColor, color: "#fff", padding: "3px 8px", borderRadius: 50, fontWeight: 700 }}>⭐ Pro</span>}
          {!isPro && !isFounder && <span style={{ fontSize: 11, color: mutedColor }}>🌿 {scansLeft} scans left</span>}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 80 }}>
        {tab === "scan"      && <ScanScreen plants={plants} onAddPlant={addPlant} onToggleFavorite={toggleFavorite} favorites={favorites} canScan={canScan} onScan={incrementScan} settings={settings} isPro={isPro} isFounder={isFounder} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />}
        {tab === "plants"    && <PlantList plants={plants} favorites={favorites} onToggleFavorite={toggleFavorite} settings={settings} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />}
        {tab === "favorites" && <Favorites favorites={favorites} onToggleFavorite={toggleFavorite} settings={settings} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />}
        {tab === "settings"  && <SettingsScreen user={user} settings={settings} onUpdateSettings={updateSettings} onSignOut={handleSignOut} isPro={isPro} isFounder={isFounder} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />}
      </div>

      {/* Bottom Nav */}
      <BottomNav tab={tab} setTab={setTab} accentColor={accentColor} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} dark={dark} />
    </div>
  );
}
