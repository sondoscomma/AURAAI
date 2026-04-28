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
        borderRadius: "10px",
        padding: "12px 14px",
        border: isCurrent
          ? "1px solid rgba(83,44,134,0.5)"
          : "1px solid rgba(255,255,255,0.07)",
        background: isCurrent ? "rgba(55,25,90,0.65)" : "rgba(255,255,255,0.02)",
        opacity: isNext ? 0.55 : isLater ? 0.3 : 1,
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
          background: isCurrent ? "#b89af5" : "rgba(255,255,255,0.1)",
          color: isCurrent ? "#1a0033" : "rgba(255,255,255,0.5)",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {step.id}
      </div>

      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: isCurrent ? "#fff" : "rgba(255,255,255,0.5)",
            lineHeight: "20px",
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.32)",
            marginTop: "1px",
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
        borderRadius: "12px",
        padding: 0,
        border: selected
          ? "1.5px solid rgba(198,166,247,0.8)"
          : "1px solid rgba(237,237,237,0.2)",
        background: "#161616",
        boxShadow: selected ? "0 0 0 3px rgba(198,166,247,0.15)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        cursor: "pointer",
        width: "100%",
        height: "418px",
        outline: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "rgba(237,237,237,0.35)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "rgba(237,237,237,0.2)";
      }}
    >
      <div
        style={{
          position: "relative",
          marginTop: "25px",
          marginLeft: "25px",
          marginRight: "25px",
          width: "calc(100% - 50px)",
          height: "192px",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          background:
            "linear-gradient(135deg, rgba(83,44,134,0.2), rgba(198,166,247,0.2))",
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
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: "28px",
            color: "#fff",
          }}
        >
          {title}
        </div>

        <p
          style={{
            margin: "8px 0 0",
            fontSize: "12.5px",
            lineHeight: "1.6",
            color: "rgba(255,255,255,0.52)",
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
            marginTop: "12px",
          }}
        >
          <span style={{ fontSize: "13px" }}>{metaIcon}</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: selected ? "#c6a6f7" : "rgba(198,166,247,0.75)",
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
        fontFamily: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <header
        style={{
          width: "100%",
          height: "65px",
          flexShrink: 0,
          background: "#161616",
          borderBottom: "1px solid rgba(83,44,134,0.2)",
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
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #532C86, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "17px",
              flexShrink: 0,
            }}
          >
            ✎
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.04em" }}>
            AURA AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: "14px",
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
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #532C86, #7c3aed)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  👤
</button>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
          background: "#0d0d0d",
          padding: "0 40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            minHeight: 0,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <aside
            style={{
              width: "320px",
              background: "#161616",
              borderRight: "1px solid rgba(83,44,134,0.2)",
              padding: "24px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
                marginBottom: "16px",
                lineHeight: "28px",
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
                border: "1px solid rgba(83,44,134,0.2)",
                background: "rgba(83,44,134,0.1)",
                padding: "16px",
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
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Select how you want to create or choose the model for your virtual try-on
                experience. You can upload your own photo, generate an AI model, or choose
                from our curated collection.
              </p>
            </div>
          </aside>

          <main
            style={{
              background: "linear-gradient(155deg, #2e1655 0%, #1c0a40 48%, #26114e 100%)",
              padding: "32px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "896px",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  height: "56px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(83,44,134,0.35)",
                    border: "1px solid rgba(83,44,134,0.4)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  👤
                </div>

                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontFamily:
                        "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: "28px",
                    }}
                  >
                    Choose Your Model
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.52)",
                      lineHeight: 1.5,
                    }}
                  >
                    Select how you want to create or choose the model for your virtual
                    try-on experience.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "24px",
                  height: "418px",
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

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  disabled={!selected}
                  onClick={handleContinue}
                  style={{
                    height: "48px",
                    padding: "12px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #C6A6F7, #532C86)",
                    color: "#fff",
                    fontFamily:
                      "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    lineHeight: "28px",
                    letterSpacing: "0px",
                    cursor: selected ? "pointer" : "not-allowed",
                    opacity: selected ? 1 : 0.5,
                    transition: "opacity 0.18s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (selected) e.currentTarget.style.opacity = "0.88";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = selected ? "1" : "0.5";
                  }}
                >
                  Continue to Upload Garment
                  <span style={{ fontSize: "18px" }}>→</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}