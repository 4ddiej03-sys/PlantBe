// src/components/LandingPage.jsx
import { useState, useEffect } from "react";

export default function LandingPage({ onGetStarted }) {
  const [visible, setVisible] = useState(false);
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans  = "'DM Sans', system-ui, sans-serif";

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const FEATURES = [
    { icon: "📸", title: "Scan Any Plant", desc: "Point your camera at any plant. AI identifies it instantly — name, type, origin and everything about it." },
    { icon: "🌿", title: "Deep Plant Data", desc: "Health properties, traditional uses, cultural history, care guides and toxicity alerts all in one place." },
    { icon: "🌍", title: "Indigenous Knowledge", desc: "Māori rongoā, Filipino herbal medicine, Ayurveda, traditional Chinese medicine and more — respectfully presented." },
    { icon: "🍳", title: "Recipes & Cocktails", desc: "Found an edible herb? Get recipes from Che AF and cocktail ideas from Mix-R instantly." },
    { icon: "🪴", title: "Care Guides", desc: "Water, light, soil, seasonal pruning — everything you need to keep your plants thriving indoors and outdoors." },
    { icon: "⚠️", title: "Toxicity Alerts", desc: "Is this plant safe for your children, cats or dogs? Instant safety check for every scan." },
    { icon: "🌱", title: "Growth Tracker", desc: "Log your plant's progress with photos over time. Watch them grow." },
    { icon: "♿", title: "Voice Navigation", desc: "Full voice control — the same world-first accessibility system as Che AF and Mix-R." },
  ];

  return (
    <div style={{ fontFamily: sans, background: "#0a0f0a", minHeight: "100vh", color: "#e8f5e8" }}>

      {/* Nav */}
      <nav style={{ padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(45,106,79,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: "#e8f5e8" }}>
            Plant <em style={{ color: "#2d6a4f", fontStyle: "italic" }}>Be</em>
          </span>
        </div>
        <button onClick={onGetStarted}
          style={{ padding: "10px 24px", background: "#2d6a4f", color: "#fff", border: "none", fontFamily: sans, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Get Started Free
        </button>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(45,106,79,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(45,106,79,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(45,106,79,0.15)", border: "1px solid rgba(45,106,79,0.3)", padding: "8px 20px", marginBottom: 40 }}>
            <span style={{ fontSize: 14, color: "#7fb069", fontWeight: 500, letterSpacing: 1 }}>🌱 Part of the OXALIS Suite</span>
          </div>

          <h1 style={{ fontFamily: serif, fontSize: "clamp(48px, 10vw, 96px)", fontWeight: 300, lineHeight: 0.92, color: "#e8f5e8", letterSpacing: -2, marginBottom: 32, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s" }}>
            Know your<br /><em style={{ fontStyle: "italic", fontWeight: 700, color: "#7fb069" }}>plants.</em>
          </h1>

          <p style={{ fontSize: 18, fontWeight: 300, color: "rgba(232,245,232,0.65)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 48px", opacity: visible ? 1 : 0, transition: "all 0.8s 0.2s" }}>
            Scan any plant. Get instant identification, health properties, indigenous knowledge, care guides and recipes — all powered by AI.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", opacity: visible ? 1 : 0, transition: "all 0.8s 0.4s" }}>
            <button onClick={onGetStarted}
              style={{ padding: "18px 40px", background: "#2d6a4f", color: "#fff", fontFamily: sans, fontWeight: 600, fontSize: 16, border: "none", cursor: "pointer", clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
              🌿 Start Scanning Free
            </button>
          </div>
          <p style={{ fontSize: 13, color: "rgba(232,245,232,0.3)", marginTop: 20 }}>No credit card · 10 free scans · Works on any device</p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px", background: "#0d140d" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#7fb069", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Features</p>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 300, color: "#e8f5e8", lineHeight: 1, marginBottom: 60, textAlign: "center" }}>
            Everything about<br /><em style={{ fontStyle: "italic", fontWeight: 700, color: "#7fb069" }}>every plant.</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, background: "rgba(45,106,79,0.08)" }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: "32px 24px", background: "#0d140d", borderTop: "2px solid #2d6a4f" }}>
                <span style={{ fontSize: 32, display: "block", marginBottom: 16 }}>{f.icon}</span>
                <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: "#e8f5e8", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(232,245,232,0.5)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OXALIS Suite */}
      <section style={{ padding: "80px 24px", background: "#0a0f0a" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#7fb069", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>The OXALIS Suite</p>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300, color: "#e8f5e8", lineHeight: 1, marginBottom: 48 }}>
            Food. Drinks. <em style={{ fontStyle: "italic", fontWeight: 700, color: "#7fb069" }}>Plants.</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, background: "rgba(45,106,79,0.08)", marginBottom: 48 }}>
            {[
              { emoji: "🍳", name: "Che AF", tag: "Cook Like You Know", color: "#c4622d", url: "https://che-af.vercel.app" },
              { emoji: "🍹", name: "Mix-R", tag: "Shake What You've Got", color: "#2563eb", url: "https://mix-r.vercel.app" },
              { emoji: "🌿", name: "Plant Be", tag: "Know Your Plants", color: "#2d6a4f", url: "#", active: true },
            ].map((app, i) => (
              <div key={i} style={{ padding: "32px 20px", background: app.active ? "rgba(45,106,79,0.12)" : "#0a0f0a", border: app.active ? "1px solid rgba(45,106,79,0.3)" : "none" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>{app.emoji}</span>
                <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: "#e8f5e8", marginBottom: 4 }}>{app.name}</div>
                <div style={{ fontSize: 11, color: app.color, fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>{app.tag}</div>
                {!app.active && <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "rgba(232,245,232,0.4)", textDecoration: "none" }}>Visit ↗</a>}
                {app.active && <span style={{ fontSize: 11, color: "#7fb069" }}>You are here ✓</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "80px 24px", background: "#0d140d" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#7fb069", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Pricing</p>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300, color: "#e8f5e8", marginBottom: 48 }}>
            Start free.<br /><em style={{ fontStyle: "italic", fontWeight: 700 }}>Stay free</em> if you're early.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "rgba(45,106,79,0.08)", marginBottom: 40 }}>
            {[
              { name: "Free", price: "$0", sub: "Forever", features: ["10 plant scans/month", "Basic plant data", "Care guides", "Toxicity alerts"], cta: "Get Started" },
              { name: "Pro", price: "$2.99", sub: "NZD/month", features: ["Unlimited scans", "Full indigenous knowledge", "Growth tracker", "Che AF & Mix-R integration", "Voice navigation", "Priority support"], cta: "Go Pro", highlight: true },
            ].map((p, i) => (
              <div key={i} style={{ padding: "36px 28px", background: "#0d140d", border: p.highlight ? "1px solid rgba(45,106,79,0.4)" : "none" }}>
                <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: p.highlight ? "#7fb069" : "#555", marginBottom: 8 }}>{p.name}</p>
                <p style={{ fontFamily: serif, fontSize: 40, fontWeight: 900, color: "#e8f5e8", lineHeight: 1, marginBottom: 4 }}>{p.price}</p>
                <p style={{ fontSize: 12, color: "#555", marginBottom: 24 }}>{p.sub}</p>
                {p.features.map((f, j) => <div key={j} style={{ fontSize: 13, color: "rgba(232,245,232,0.6)", marginBottom: 8, display: "flex", gap: 8 }}><span style={{ color: "#7fb069" }}>✓</span>{f}</div>)}
                <button onClick={onGetStarted}
                  style={{ width: "100%", marginTop: 24, padding: "14px", background: p.highlight ? "#2d6a4f" : "transparent", border: `1px solid ${p.highlight ? "#2d6a4f" : "rgba(232,245,232,0.15)"}`, color: "#e8f5e8", fontFamily: sans, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {p.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", background: "#2d6a4f", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 300, color: "#fff", lineHeight: 0.95, marginBottom: 24 }}>
            Know every<br /><em style={{ fontStyle: "italic", fontWeight: 700 }}>plant around you.</em>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 40 }}>Start with 10 free scans. No credit card required.</p>
          <button onClick={onGetStarted}
            style={{ padding: "18px 48px", background: "#fff", color: "#2d6a4f", fontFamily: sans, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
            🌿 Start Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 24px", borderTop: "1px solid rgba(45,106,79,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 13, color: "rgba(232,245,232,0.3)" }}>© 2026 Plant Be · OXALIS Studio · New Zealand</span>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="https://www.instagram.com/cheaf_cooklikeyouknow" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "rgba(232,245,232,0.4)", textDecoration: "none" }}>📸 Instagram</a>
          <a href="https://che-af.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "rgba(232,245,232,0.4)", textDecoration: "none" }}>Che AF</a>
          <a href="https://mix-r.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "rgba(232,245,232,0.4)", textDecoration: "none" }}>Mix-R</a>
        </div>
      </footer>
    </div>
  );
}
