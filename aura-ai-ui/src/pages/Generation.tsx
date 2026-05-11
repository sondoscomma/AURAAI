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
  const isNext = step.state === "next";
  const isLater = step.state === "later";
  const isDone = step.state === "done";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderRadius: "8px",
        padding: "16px",
        border: isCurrent ? "1px solid #9333EA" : "1px solid transparent",
        background: isCurrent ? "#2D1B69" : "#1A1425",
        boxShadow: isCurrent ? "0 4px 6px rgba(0,0,0,0.3)" : "none",
        opacity: isNext ? 0.55 : isLater ? 0.4 : 1,
        transition: "all 0.3s ease",
        marginBottom: "12px",
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
          background: isDone ? "#10B981" : isCurrent ? "#9333EA" : "#3A256A",
          color: isDone ? "#fff" : isCurrent ? "#fff" : "#8B7AB8",
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
            fontWeight: 500,
            color: isDone ? "#8B7AB8" : isCurrent ? "#fff" : "#8B7AB8",
            lineHeight: "20px",
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: isDone ? "rgba(16,185,129,0.7)" : isCurrent ? "rgba(255,255,255,0.6)" : "#6B7280",
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
        border: selected ? "2px solid #9333EA" : "1px solid #3A256A",
        background: "#1A1425",
        boxShadow: selected
          ? "0 0 0 4px rgba(147, 51, 234, 0.2), 0 4px 6px rgba(0,0,0,0.3)"
          : "0 4px 6px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        width: "100%",
        minHeight: "340px",
        outline: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: selected ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3), 0 0 0 4px rgba(147,51,234,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
        }
      }}
    >
      {/* Image Area */}
      <div style={{ padding: "10px", flexShrink: 0 }}>
        <div
          style={{
            width: "100%",
            height: "130px",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#2D1B69",
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
      </div>

      {/* Text Content */}
      <div
        style={{
          padding: "0 14px 14px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#FFFFFF",
            margin: "0 0 6px 0",
          }}
        >
          {title}
        </div>

        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "13px",
            lineHeight: "1.5",
            color: "#8B7AB8",
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
            color: selected ? "#9333EA" : "#6B7280",
          }}
        >
          <span style={{ fontSize: "14px" }}>{metaIcon}</span>
          <span style={{ fontWeight: 500 }}>{meta}</span>
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

  const handleContinue = (): void => {
    if (!selected) return;
    setShowUploadModal(true);
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

    const routeBySelection: Record<ModelChoice, string> = {
      upload: "/app/upload-your-model",
      generate: "/app/generate-ai-model",
      aura: "/app/aura-models",
    };

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

    const routeBySelection: Record<ModelChoice, string> = {
      upload: "/app/upload-your-model",
      generate: "/app/generate-ai-model",
      aura: "/app/aura-models",
    };

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
          borderBottom: "1px solid #3A256A",
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
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#9333EA",
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
          <span style={{ fontWeight: 600, fontSize: "16px", color: "#fff" }}>
            AURA AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              background: "#3A256A",
              color: "#B8A9E0",
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
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              background: "#9333EA",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
            background: "#2B144C",
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
              fontWeight: 600,
              color: "#B8A9E0",
              marginBottom: "16px",
              lineHeight: "20px",
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
              marginTop: "24px",
              borderRadius: "8px",
              border: "1px solid #3A256A",
              background: "#1A1425",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#E0D6F0",
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
                color: "#8B7AB8",
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
                  margin: "0 0 8px 0",
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
                  color: "rgba(255,255,255,0.6)",
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
                  borderRadius: "8px",
                  border: "none",
                  background: selected
                    ? "linear-gradient(135deg, #9333EA, #A855F7)"
                    : "#3A256A",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: selected ? "pointer" : "not-allowed",
                  opacity: selected ? 1 : 0.5,
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  boxShadow: selected ? "0 4px 6px rgba(0,0,0,0.1)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (selected) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #A855F7, #C084FC)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(147, 51, 234, 0.4)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #9333EA, #A855F7)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
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
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadModal(false);
          }}
        >
          <div
            style={{
              width: "520px",
              maxHeight: "90vh",
              borderRadius: "12px",
              background: "#1A1425",
              border: "1px solid #3A256A",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.5)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                    margin: "6px 0 0",
                    fontSize: "14px",
                    color: "#8B7AB8",
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
                  border: "1px solid #3A256A",
                  background: "transparent",
                  color: "#8B7AB8",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #9333EA",
                borderRadius: "8px",
                padding: garmentPreview ? "0" : "32px",
                background: garmentPreview ? "transparent" : "#2D1B69",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minHeight: "160px",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!garmentPreview) {
                  e.currentTarget.style.borderColor = "#A855F7";
                  e.currentTarget.style.background = "rgba(147, 51, 234, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!garmentPreview) {
                  e.currentTarget.style.borderColor = "#9333EA";
                  e.currentTarget.style.background = "#2D1B69";
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
                      height: "160px",
                      objectFit: "contain",
                      display: "block",
                      borderRadius: "6px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "6px",
                      padding: "4px 8px",
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
                  <span style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.5 }}>📁</span>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
                    Click to upload garment
                  </div>
                  <div style={{ fontSize: "13px", color: "#8B7AB8" }}>
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
                  background: "transparent",
                  border: "1px solid #3A256A",
                  borderRadius: "8px",
                  color: "#8B7AB8",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  width: "fit-content",
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
                  borderRadius: "8px",
                  border: "1px solid #3A256A",
                  background: "#1A1425",
                  color: "#B8A9E0",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2D1B69";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1A1425";
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
                  borderRadius: "8px",
                  border: "none",
                  background: garmentPreview
                    ? "linear-gradient(135deg, #9333EA, #A855F7)"
                    : "#3A256A",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: garmentPreview ? "pointer" : "not-allowed",
                  opacity: garmentPreview ? 1 : 0.5,
                  transition: "all 0.3s ease",
                  boxShadow: garmentPreview ? "0 4px 6px rgba(147, 51, 234, 0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (garmentPreview) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #A855F7, #C084FC)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(147, 51, 234, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (garmentPreview) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #9333EA, #A855F7)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(147, 51, 234, 0.3)";
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