import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import uploadImg from "../assets/genration/upload.png";
import aiImg from "../assets/genration/ai.png";
import modelsImg from "../assets/genration/models.png";

type StepState = "current" | "next" | "later";
type ModelChoice = "upload" | "generate" | "aura";

interface Step {
  id: number;
  title: string;
  subtitle: string;
  state: StepState;
}

interface CardDef {
  id: ModelChoice;
  image: string;
  title: string;
  desc: string;
  meta: string;
  metaIcon: string;
}

const steps: Step[] = [
  { id: 1, title: "Choose Model", subtitle: "Current step", state: "current" },
  { id: 2, title: "Upload Garment", subtitle: "Next step", state: "next" },
  { id: 3, title: "Generate & Customize", subtitle: "Coming up", state: "later" },
  { id: 4, title: "Results & Download", subtitle: "Final step", state: "later" },
];

function StepItem({ step }: { step: Step }): JSX.Element {
  const isCurrent = step.state === "current";
  const isNext = step.state === "next";
  const isLater = step.state === "later";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderRadius: "8px",
        padding: "16px",
        border: isCurrent ? "2px solid #6B46C1" : "1px solid transparent",
        background: isCurrent ? "#6B46C1" : "#3A256A",
        boxShadow: isCurrent ? "0 2px 8px rgba(107, 70, 193, 0.3)" : "none",
        opacity: isNext ? 0.55 : isLater ? 0.3 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isCurrent ? "#fff" : "#8B5CF6",
          color: isCurrent ? "#6B46C1" : "#fff",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {step.id}
      </div>

      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: isCurrent ? "#fff" : "#8B7AB8",
            lineHeight: "20px",
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: isCurrent ? "rgba(255,255,255,0.7)" : "rgba(139,122,184,0.6)",
            marginTop: "2px",
          }}
        >
          {step.subtitle}
        </div>
      </div>
    </div>
  );
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
        borderRadius: "16px",
        padding: 0,
        border: selected ? "2px solid #8B5CF6" : "1px solid #3A256A",
        background: "#1A1425",
        boxShadow: selected
          ? "0 0 20px rgba(139, 92, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        width: "100%",
        height: "100%",
        outline: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: selected ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 12px rgba(139, 92, 246, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
        }
      }}
    >
      <div
        style={{
          margin: "16px",
          width: "calc(100% - 32px)",
          height: "180px",
          borderRadius: "12px",
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
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
          padding: "0 20px 20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#fff",
            margin: "0 0 8px 0",
          }}
        >
          {title}
        </div>

        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#B8A9E0",
          }}
        >
          {desc}
        </p>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "14px" }}>{metaIcon}</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: selected ? "#8B5CF6" : "#8B7AB8",
            }}
          >
            {meta}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function Generation(): JSX.Element {
  const nav = useNavigate();
  const [selected, setSelected] = useState<ModelChoice | null>(null);

  const cards = useMemo<CardDef[]>(
    () => [
      {
        id: "upload",
        image: uploadImg,
        title: "Upload Your Model",
        desc: "Upload a full-body image of a model or yourself to generate personalized try-on results.",
        meta: "JPG / PNG supported",
        metaIcon: "⬆",
      },
      {
        id: "generate",
        image: aiImg,
        title: "Generate AI Model",
        desc: "Describe your desired model and let AURA AI create it using generative AI.",
        meta: "AI-powered generation",
        metaIcon: "✏️",
      },
      {
        id: "aura",
        image: modelsImg,
        title: "Choose from AURA Models",
        desc: "Select from a curated collection of professional Arab full-body models.",
        meta: "Professional models",
        metaIcon: "👥",
      },
    ],
    []
  );

  const handleContinue = (): void => {
    if (!selected) return;

    const routeBySelection: Record<ModelChoice, string> = {
      upload: "/app/upload-your-model",
      generate: "/app/generate-ai-model",
      aura: "/app/aura-models",
    };

    nav(routeBySelection[selected], { state: { selected } });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#0d0d0d",
        color: "#fff",
        fontFamily: "'Bricolage Grotesque', 'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          width: "100%",
          height: "80px",
          flexShrink: 0,
          background: "#1E0F3B",
          borderBottom: "1px solid #3A256A",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6B46C1, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            ✎
          </div>
          <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "0.04em" }}>
            AURA AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #3A256A",
              background: "transparent",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ?
          </button>
          <button
            onClick={() => nav("/app/profile")}
            style={{
              height: "40px",
              padding: "0 16px",
              borderRadius: "8px",
              border: "none",
              background: "#6B46C1",
              color: "#fff",
              cursor: "pointer",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            👤
          </button>
        </div>
      </header>

      {/* BODY */}
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width: "280px",
            background: "#2D1B69",
            borderRight: "1px solid #3A256A",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "16px",
              lineHeight: "20px",
            }}
          >
            Generation Flow
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {steps.map((s) => (
              <StepItem key={s.id} step={s} />
            ))}
          </div>

          <div
            style={{
              marginTop: "24px",
              borderRadius: "8px",
              border: "1px solid #3A256A",
              background: "#3A256A",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                lineHeight: "20px",
              }}
            >
              Instructions
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "1.7",
                color: "#B8A9E0",
              }}
            >
              Select how you want to create or choose the model for your virtual try-on
              experience. You can upload your own photo, generate an AI model, or choose
              from our curated collection.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #1E0F3B 0%, #2D1B69 100%)",
            padding: "40px 32px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              flex: 1,
            }}
          >
            {/* Title Section */}
            <div>
              <h1
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: "32px",
                }}
              >
                Choose Your Model
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#B8A9E0",
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
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                disabled={!selected}
                onClick={handleContinue}
                style={{
                  height: "48px",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  border: "none",
                  background: selected
                    ? "linear-gradient(135deg, #6B46C1, #8B5CF6)"
                    : "#3A256A",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: selected ? "pointer" : "not-allowed",
                  opacity: selected ? 1 : 0.5,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  whiteSpace: "nowrap",
                  boxShadow: selected ? "0 4px 12px rgba(107, 70, 193, 0.4)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (selected) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #7C5CFA, #8B5CF6)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(107, 70, 193, 0.5)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #6B46C1, #8B5CF6)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(107, 70, 193, 0.4)";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                Continue to Upload Garment
                <span style={{ fontSize: "16px" }}>→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}