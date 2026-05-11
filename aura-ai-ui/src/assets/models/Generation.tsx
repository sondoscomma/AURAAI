import type { JSX } from "react";
import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import uploadImg from "../assets/genration/upload.png";
import aiImg from "../assets/genration/ai.png";
import modelsImg from "../assets/genration/models.png";

type StepState = "current" | "next" | "later" | "done";
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

const initialSteps: Step[] = [
  { id: 1, title: "Choose Model", subtitle: "Current step", state: "current" },
  { id: 2, title: "Upload Garment", subtitle: "Next step", state: "next" },
  { id: 3, title: "Generate & Customize", subtitle: "Coming up", state: "later" },
  { id: 4, title: "Results & Download", subtitle: "Final step", state: "later" },
];

function StepItem({ step }: { step: Step }): JSX.Element {
  const isCurrent = step.state === "current";
  const isDone = step.state === "done";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderRadius: "8px",
        padding: "14px 16px",
        border: isCurrent ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid transparent",
        background: isCurrent ? "rgba(139, 92, 246, 0.1)" : "transparent",
        marginBottom: "8px",
        transition: "all 0.3s ease",
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
          background: isDone
            ? "#10B981"
            : isCurrent
            ? "linear-gradient(135deg, #6B46C1, #8B5CF6)"
            : "rgba(255,255,255,0.1)",
          color: isDone ? "#fff" : isCurrent ? "#fff" : "rgba(255,255,255,0.4)",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {isDone ? "✓" : step.id}
      </div>

      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: isCurrent ? 600 : 400,
            color: isDone
              ? "rgba(255,255,255,0.5)"
              : isCurrent
              ? "#FFFFFF"
              : "rgba(255,255,255,0.4)",
            lineHeight: "20px",
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: isDone
              ? "rgba(16,185,129,0.7)"
              : isCurrent
              ? "rgba(255,255,255,0.5)"
              : "rgba(255,255,255,0.25)",
            marginTop: "2px",
          }}
        >
          {isDone ? "Completed" : step.subtitle}
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
      {/* Image Area - square format */}
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

      {/* Text Content */}
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

export default function Generation(): JSX.Element {
  const nav = useNavigate();
  const [selected, setSelected] = useState<ModelChoice | null>(null);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const routeBySelection: Record<ModelChoice, string> = {
    upload: "/app/upload-your-model",
    generate: "/app/generate-ai-model",
    aura: "/app/aura-models",
  };

  const handleContinue = (): void => {
    if (!selected) return;

    if (selected === "generate") {
      // Only show the upload garment modal when "Generate AI Model" is selected
      setShowUploadModal(true);
    } else {
      // For "Upload Your Model" and "Choose from AURA Models", navigate directly
      setSteps([
        { id: 1, title: "Choose Model", subtitle: "Completed", state: "done" },
        { id: 2, title: "Upload Garment", subtitle: "Next step", state: "next" },
        { id: 3, title: "Generate & Customize", subtitle: "Coming up", state: "later" },
        { id: 4, title: "Results & Download", subtitle: "Final step", state: "later" },
      ]);

      nav(routeBySelection[selected], {
        state: { selected, garmentUploaded: false },
      });
    }
  };

  const handleGarmentFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setGarmentPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndProceed = (): void => {
    setSteps([
      { id: 1, title: "Choose Model", subtitle: "Completed", state: "done" },
      { id: 2, title: "Upload Garment", subtitle: "Completed", state: "done" },
      { id: 3, title: "Generate & Customize", subtitle: "Current step", state: "current" },
      { id: 4, title: "Results & Download", subtitle: "Final step", state: "later" },
    ]);

    setShowUploadModal(false);

    nav(routeBySelection[selected!], {
      state: { selected, garmentUploaded: true },
    });
  };

  const handleSkipUpload = (): void => {
    setSteps([
      { id: 1, title: "Choose Model", subtitle: "Completed", state: "done" },
      { id: 2, title: "Upload Garment", subtitle: "Next step", state: "next" },
      { id: 3, title: "Generate & Customize", subtitle: "Coming up", state: "later" },
      { id: 4, title: "Results & Download", subtitle: "Final step", state: "later" },
    ]);

    setShowUploadModal(false);

    nav(routeBySelection[selected!], {
      state: { selected, garmentUploaded: false },
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
      {/* HEADER */}
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
          <button
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            ?
          </button>
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
            background: "#1E0F3B",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: "28px 20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              marginBottom: "20px",
              lineHeight: "16px",
            }}
          >
            Generation Flow
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {steps.map((s) => (
              <StepItem key={s.id} step={s} />
            ))}
          </div>

          <div
            style={{
              marginTop: "28px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                lineHeight: "18px",
              }}
            >
              Instructions
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.35)",
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
                <span>→</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* UPLOAD GARMENT MODAL */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadModal(false);
          }}
        >
          <div
            style={{
              width: "520px",
              maxHeight: "90vh",
              borderRadius: "14px",
              background: "#1E0F3B",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  Upload Your Garment
                </h2>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Upload the garment you want to try on the model
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed rgba(139, 92, 246, 0.4)",
                borderRadius: "12px",
                padding: garmentPreview ? "0" : "40px 32px",
                background: garmentPreview
                  ? "transparent"
                  : "rgba(139, 92, 246, 0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minHeight: garmentPreview ? "auto" : "180px",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!garmentPreview) {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.7)";
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!garmentPreview) {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.06)";
                }
              }}
            >
              {garmentPreview ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <img
                    src={garmentPreview}
                    alt="Garment preview"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                      display: "block",
                      borderRadius: "10px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "8px",
                      padding: "4px 12px",
                      fontSize: "12px",
                      color: "#10B981",
                      fontWeight: 600,
                    }}
                  >
                    ✓ Uploaded
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: "rgba(139, 92, 246, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 16V8M8 12L12 8L16 12"
                        stroke="#A78BFA"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 16.7V19.2C20 20.3 19.3 21 18.2 21H5.8C4.7 21 4 20.3 4 19.2V16.7"
                        stroke="#A78BFA"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.8)",
                      marginBottom: "6px",
                    }}
                  >
                    Click to upload garment
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                    JPG, PNG or WEBP (max 10MB)
                  </div>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleGarmentFileChange}
              />
            </div>

            {/* Change file button */}
            {garmentPreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.5)",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  width: "fit-content",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                Change Garment
              </button>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleSkipUpload}
                style={{
                  height: "48px",
                  padding: "0 24px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                Skip for Now
              </button>
              <button
                type="button"
                onClick={handleUploadAndProceed}
                style={{
                  height: "48px",
                  padding: "0 28px",
                  borderRadius: "10px",
                  border: "none",
                  background: garmentPreview
                    ? "linear-gradient(135deg, #6B46C1, #8B5CF6)"
                    : "rgba(255,255,255,0.08)",
                  color: garmentPreview ? "#fff" : "rgba(255,255,255,0.3)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: garmentPreview ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  boxShadow: garmentPreview
                    ? "0 4px 20px rgba(139, 92, 246, 0.35)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (garmentPreview) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #7C4DCF, #9D6FF2)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 28px rgba(139, 92, 246, 0.5)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (garmentPreview) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #6B46C1, #8B5CF6)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(139, 92, 246, 0.35)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                Upload & Continue →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
