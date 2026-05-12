import type { JSX } from "react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import uploadImg from "../assets/genration/upload.png";
import aiImg from "../assets/genration/ai.png";
import modelsImg from "../assets/genration/models.png";
import GenerationFlow from "../components/GenerationFlow";
import AuraLogo from "../components/AuraLogo";

/* ─────────────── CSS keyframe styles injected once ─────────────── */
function InjectStyles(): JSX.Element {
  useEffect(() => {
    const id = "aura-gen-anim-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes modalSlideUp {
        from { transform: translateY(60px) scale(0.88); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes devCardIn {
        from { transform: translateY(16px) scale(0.95); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes featurePopIn {
        from { transform: scale(0.7) rotate(-3deg); opacity: 0; }
        to   { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes headerGlow {
        0%   { text-shadow: 0 0 8px rgba(139,92,246,0.3); }
        100% { text-shadow: 0 0 20px rgba(139,92,246,0.6), 0 0 40px rgba(139,92,246,0.2); }
      }
      .aura-modal-overlay {
        animation: modalFadeIn 0.3s ease-out;
      }
      .aura-modal-card {
        animation: modalSlideUp 0.5s cubic-bezier(0.16,1,0.3,1);
      }
      .aura-dev-card {
        animation: devCardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
      }
      .aura-feature-card {
        animation: featurePopIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
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

type ModelChoice = "upload" | "generate" | "aura";

interface CardDef {
  id: ModelChoice;
  image: string;
  title: string;
  desc: string;
  meta: string;
  metaIcon: string;
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
          width: "480px",
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
            {"\u2715"}
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
              fontWeight: 800,
              color: "#fff",
            }}
          >
            <AuraLogo size={40} />
          </div>

          <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "6px", animation: "headerGlow 2s ease-in-out infinite alternate" }}>
            About AURA AI
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5", letterSpacing: "0.02em" }}>
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
              garments and instantly visualize how they look on diverse, realistic AI-generated models
              from multiple angles with photorealistic quality.
            </div>
          </div>

          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#C4B5FD", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              Key Features
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { icon: "\u{1F457}", title: "Virtual Try-On", bg: "rgba(139,92,246,0.12)", color: "#C4B5FD", delay: "0s" },
                { icon: "\u{1F9E0}", title: "AI Generation", bg: "rgba(59,130,246,0.12)", color: "#93C5FD", delay: "0.05s" },
                { icon: "\u{1F310}", title: "Arab Models", bg: "rgba(16,185,129,0.12)", color: "#6EE7B7", delay: "0.1s" },
                { icon: "\u26A1", title: "Instant Results", bg: "rgba(245,158,11,0.12)", color: "#FCD34D", delay: "0.15s" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="aura-feature-card"
                  style={{
                    background: f.bg,
                    borderRadius: "10px",
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "transform 0.2s ease",
                    animationDelay: f.delay,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
                >
                  <span style={{ fontSize: "20px" }}>{f.icon}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: f.color }}>{f.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(30,15,59,0.9), rgba(43,20,76,0.9))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#C4B5FD", marginBottom: "14px" }}>
              {"\u{1F4BB}"} Development Team
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Sondos AbuTeir", initials: "SA", color: "#A78BFA", role: "web development and designation", delay: "0.1s" },
                { name: "Raghad Ibrahim", initials: "RI", color: "#818CF8", role: "web development and designation", delay: "0.2s" },
                { name: "Reem Abu Shapap", initials: "RA", color: "#C084FC", role: "web development and designation", delay: "0.3s" },
              ].map((dev) => (
                <div
                  key={dev.name}
                  className="aura-dev-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(139,92,246,0.1)",
                    transition: "all 0.2s ease",
                    animationDelay: dev.delay,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139,92,246,0.08)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.1)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: `${dev.color}22`,
                      border: `1px solid ${dev.color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: dev.color,
                      flexShrink: 0,
                    }}
                  >
                    {dev.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                      {dev.name}
                    </div>
                    <div style={{ fontSize: "11px", color: dev.color, fontWeight: 500, marginTop: 2 }}>
                      {dev.role}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: dev.color,
                      boxShadow: `0 0 8px ${dev.color}66`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.1)",
              fontSize: "12px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            AURA AI {"\u00B7"} Virtual Fashion Try-On Platform {"\u00B7"} 2026
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
        metaIcon: "\u{1F465}",
      },
    ],
    []
  );

  const handleContinue = (): void => {
    if (!selected) return;

    if (selected === "aura") {
      // AURA Models → go to model selection page first
      nav("/app/aura-models", {
        state: { selected },
      });
    } else {
      // Upload Your Model / Generate AI Model → go to Upload Garment page
      nav("/app/upload-garment", {
        state: { selected },
      });
    }
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
          {/* ── ANIMATED AURA LOGO with all effects ── */}
          <AuraLogo
            size={44}
            onClick={() => setShowAbout(true)}
          />
          <div>
            <span style={{ fontWeight: 600, fontSize: "18px", color: "#fff" }}>
              AURA AI
            </span>
            <div style={{ fontSize: "10px", color: "rgba(198,166,247,0.6)", letterSpacing: "0.04em" }}>
              Virtual Fashion
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Logout button */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              nav("/");
            }}
            style={{
              height: "36px",
              padding: "0 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            {"\u2190"} Logout
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
            {"\u{1F464}"}
          </button>
        </div>
      </header>

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
                Choose model
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
