import type { JSX } from "react";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import uploadImg from "../assets/genration/upload.png";
import aiImg from "../assets/genration/ai.png";
import modelsImg from "../assets/genration/models.png";
import GenerationFlow from "../components/GenerationFlow";

type ModelChoice = "upload" | "generate" | "aura";

interface CardDef {
  id: ModelChoice;
  image: string;
  title: string;
  desc: string;
  meta: string;
  metaIcon: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

/* ─────────────── CSS keyframe styles injected once ─────────────── */
function InjectStyles(): JSX.Element {
  useEffect(() => {
    const id = "aura-anim-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes auraFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-3px) scale(1.06); }
      }
      @keyframes auraGlow {
        0%, 100% { box-shadow: 0 0 8px rgba(139,92,246,0.4), 0 0 16px rgba(139,92,246,0.15); }
        50% { box-shadow: 0 0 14px rgba(139,92,246,0.6), 0 0 28px rgba(139,92,246,0.25); }
      }
      @keyframes auraRingPulse {
        0%   { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes particleBurst {
        0%   { transform: translate(0,0) scale(1); opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes modalSlideUp {
        from { transform: translateY(40px) scale(0.95); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      .aura-info-btn {
        animation: auraFloat 2.4s ease-in-out infinite, auraGlow 2.4s ease-in-out infinite;
        cursor: pointer;
        position: relative;
      }
      .aura-info-btn:hover {
        animation: auraFloat 1.2s ease-in-out infinite, auraGlow 1.2s ease-in-out infinite;
      }
      .aura-info-ring {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid rgba(139,92,246,0.35);
        animation: auraRingPulse 2s ease-out infinite;
        pointer-events: none;
      }
      .aura-particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        animation: particleBurst 0.7s ease-out forwards;
      }
      .aura-modal-overlay {
        animation: modalFadeIn 0.25s ease-out;
      }
      .aura-modal-card {
        animation: modalSlideUp 0.35s cubic-bezier(0.16,1,0.3,1);
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);
  return <></>;
}

interface CardProps {
  image: string;
  title: string;
  desc: string;
  meta: string;
  metaIcon: string;
  selected: boolean;
  onSelect: () => void;
}

function ChoiceCard({
  image,
  title,
  desc,
  meta,
  metaIcon,
  selected,
  onSelect,
}: CardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        position: "relative",
        textAlign: "left",
        borderRadius: "12px",
        padding: 0,
        border: selected
          ? "1px solid rgba(139, 92, 246, 0.6)"
          : "1px solid rgba(255,255,255,0.08)",
        background: "#1A1A2A",
        boxShadow: selected
          ? "0 0 20px rgba(139, 92, 246, 0.25), 0 8px 32px rgba(0,0,0,0.4)"
          : "0 8px 32px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        width: "100%",
        outline: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: selected ? "translateY(-4px)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow =
            "0 8px 32px rgba(0,0,0,0.3), 0 0 15px rgba(139,92,246,0.15)";
          e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
        }
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          background: "#2D1B69",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          padding: "20px 24px 24px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#FFFFFF",
            margin: "0 0 8px 0",
            lineHeight: "24px",
          }}
        >
          {title}
        </div>

        <p
          style={{
            margin: "0 0 16px 0",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {desc}
        </p>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: selected ? "#A78BFA" : "rgba(255,255,255,0.3)",
            fontWeight: 500,
            transition: "color 0.3s ease",
          }}
        >
          <span style={{ fontSize: "14px" }}>{metaIcon}</span>
          <span>{meta}</span>
        </div>
      </div>
    </button>
  );
}

/* ─────────────── ABOUT / INFO MODAL ─────────────── */
function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }): JSX.Element | null {
  if (!open) return null;

  return (
    <div
      className="aura-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="aura-modal-card"
        style={{
          width: "440px",
          maxHeight: "88vh",
          borderRadius: "20px",
          overflow: "hidden",
          background: "#1A1030",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #6B46C1, #8B5CF6, #A78BFA)",
            padding: "32px 28px 28px",
            position: "relative",
            textAlign: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
          >
            &#x2715;
          </button>

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.18)",
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
                fill="white"
              />
            </svg>
          </div>

          <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            About AURA AI
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>
            AI-Powered Fashion, Infinite Possibilities
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#C4B5FD", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              What is AURA AI?
            </div>
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "12px", padding: "16px", fontSize: "13px", lineHeight: "1.7", color: "rgba(255,255,255,0.65)" }}>
              AURA AI is a cutting-edge virtual try-on platform that leverages generative AI to
              revolutionize the online fashion experience. Our technology enables users to upload
              garments and instantly visualize how they look on diverse, realistic AI-generated models.
            </div>
          </div>

          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#C4B5FD", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              Key Features
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { icon: "\uD83D\uDC57", title: "Virtual Try-On", bg: "rgba(139,92,246,0.12)", color: "#C4B5FD" },
                { icon: "\uD83E\uDDE0", title: "AI Generation", bg: "rgba(59,130,246,0.12)", color: "#93C5FD" },
                { icon: "\uD83C\uDF10", title: "Arab Models", bg: "rgba(16,185,129,0.12)", color: "#6EE7B7" },
                { icon: "\u26A1", title: "Instant Results", bg: "rgba(245,158,11,0.12)", color: "#FCD34D" },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: f.bg,
                    borderRadius: "10px",
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: "20px" }}>{f.icon}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: f.color }}>{f.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(30,15,59,0.9), rgba(43,20,76,0.9))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#C4B5FD", marginBottom: "14px" }}>
              Developers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Sondos AbuTeir", initials: "SA", color: "#A78BFA" },
                { name: "Raghad Ibrahim", initials: "RI", color: "#818CF8" },
                { name: "Reem Abu Shapap", initials: "RA", color: "#C084FC" },
              ].map((dev) => (
                <div
                  key={dev.name}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.04)" }}
                >
                  <div
                    style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: `${dev.color}22`, border: `1px solid ${dev.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: dev.color, flexShrink: 0,
                    }}
                  >
                    {dev.initials}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
                    {dev.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── MAIN COMPONENT ─────────────── */
export default function Generation(): JSX.Element {
  const nav = useNavigate();
  const [selected, setSelected] = useState<ModelChoice | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [exploding, setExploding] = useState(false);
  const infoBtnRef = useRef<HTMLButtonElement>(null);

  const triggerExplosion = useCallback(() => {
    if (!infoBtnRef.current) return;
    const rect = infoBtnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const colors = [
      "#8B5CF6", "#A78BFA", "#C4B5FD", "#6B46C1",
      "#DDD6FE", "#E9D5FF", "#7C3AED", "#A855F7",
    ];

    const newParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: cx,
      y: cy,
      color: colors[i % colors.length],
      size: Math.random() * 8 + 4,
      angle: (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.4,
      speed: Math.random() * 60 + 40,
    }));

    setParticles(newParticles);
    setExploding(true);

    setTimeout(() => {
      setParticles([]);
      setExploding(false);
      setShowAbout(true);
    }, 600);
  }, []);

  const cards = useMemo<CardDef[]>(
    () => [
      {
        id: "upload",
        image: uploadImg,
        title: "Upload Your Model",
        desc: "Upload a full-body image of a model or yourself to generate personalized try-on results.",
        meta: "JPG / PNG supported",
        metaIcon: "\u2B06",
      },
      {
        id: "generate",
        image: aiImg,
        title: "Generate AI Model",
        desc: "Describe your desired model and let AURA AI create it using generative AI.",
        meta: "AI-powered generation",
        metaIcon: "\u270F\uFE0F",
      },
      {
        id: "aura",
        image: modelsImg,
        title: "Choose from AURA Models",
        desc: "Select from a curated collection of professional Arab full-body models.",
        meta: "Professional models",
        metaIcon: "\uD83D\uDC65",
      },
    ],
    []
  );

  const handleContinue = (): void => {
    if (!selected) return;

    // Navigate to Upload Garment page with the selected model type
    nav("/app/upload-garment", {
      state: { selected },
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#2B144C",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <InjectStyles />

      {/* ── HEADER ── */}
      <header
        style={{
          width: "100%",
          height: "64px",
          flexShrink: 0,
          background: "#2B144C",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6B46C1, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <span style={{ fontWeight: 600, fontSize: "18px", color: "#fff" }}>
            AURA AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* ── ANIMATED INFO ICON ── */}
          <button
            ref={infoBtnRef}
            className="aura-info-btn"
            onClick={triggerExplosion}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              background: exploding
                ? "rgba(139,92,246,0.35)"
                : "linear-gradient(135deg, #6B46C1, #8B5CF6)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              outline: "none",
            }}
          >
            {!exploding && <span className="aura-info-ring" />}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
                fill="white"
              />
            </svg>
          </button>

          {/* Profile button */}
          <button
            onClick={() => nav("/app/profile")}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, #6B46C1, #8B5CF6)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 16px rgba(139, 92, 246, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(139, 92, 246, 0.3)";
            }}
          >
            &#x1F464;
          </button>
        </div>
      </header>

      {/* ── EXPLOSION PARTICLES ── */}
      {particles.length > 0 &&
        particles.map((p) => (
          <div
            key={p.id}
            className="aura-particle"
            style={{
              position: "fixed",
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: "50%",
              transform: `translate(${Math.cos(p.angle) * p.speed}px, ${Math.sin(p.angle) * p.speed}px)`,
              zIndex: 10002,
              pointerEvents: "none",
            }}
          />
        ))}

      {/* ── ABOUT MODAL ── */}
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />

      {/* ── BODY ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR - Generation Flow with Step 1 glowing */}
        <GenerationFlow activeStep={1} />

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            background: "#2B144C",
            padding: "40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            {/* Title Section */}
            <div>
              <h1
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: "36px",
                }}
              >
                Choose Your Model
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: "1.5",
                }}
              >
                Select how you want to create or choose the model for your virtual try-on experience.
              </p>
            </div>

            {/* Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
              }}
            >
              {cards.map((c) => (
                <ChoiceCard
                  key={c.id}
                  image={c.image}
                  title={c.title}
                  desc={c.desc}
                  meta={c.meta}
                  metaIcon={c.metaIcon}
                  selected={selected === c.id}
                  onSelect={() => setSelected(c.id)}
                />
              ))}
            </div>

            {/* Continue Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "24px" }}>
              <button
                disabled={!selected}
                onClick={handleContinue}
                style={{
                  height: "48px",
                  padding: "0 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "10px",
                  border: "none",
                  background: selected
                    ? "linear-gradient(135deg, #6B46C1, #8B5CF6)"
                    : "rgba(255,255,255,0.08)",
                  color: selected ? "#fff" : "rgba(255,255,255,0.3)",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: selected ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  boxShadow: selected
                    ? "0 4px 20px rgba(139, 92, 246, 0.35)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (selected) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #7C4DCF, #9D6FF2)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 28px rgba(139, 92, 246, 0.5)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #6B46C1, #8B5CF6)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(139, 92, 246, 0.35)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                Continue to Upload Garment
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
