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
        border: isCurrent ? "2px solid #6B46C1" : "1px solid transparent",
        background: isCurrent ? "#6B46C1" : isDone ? "rgba(34,197,94,0.15)" : "#3A256A",
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
          background: isDone ? "#22c55e" : isCurrent ? "#fff" : "#8B5CF6",
          color: isDone ? "#fff" : isCurrent ? "#6B46C1" : "#fff",
          fontSize: isDone ? "14px" : "12px",
          fontWeight: 700,
        }}
      >
        {isDone ? "✓" : step.id}
      </div>

      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: isDone ? "#22c55e" : isCurrent ? "#fff" : "#8B7AB8",
            lineHeight: "20px",
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: isDone ? "rgba(34,197,94,0.7)" : isCurrent ? "rgba(255,255,255,0.7)" : "rgba(139,122,184,0.6)",
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
        minHeight: "420px",
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
      {/* Image Area */}
      <div style={{ padding: "14px 14px 0", flexShrink: 0 }}>
        <div
          style={{
            width: "100%",
            height: "180px",
            borderRadius: "12px",
            overflow: "hidden",
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
      </div>

      {/* Text Content */}
      <div
        style={{
          padding: "16px 20px 20px",
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
            margin: "0 0 16px 0",
            fontSize: "14px",
            lineHeight: "1.6",
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
            gap: "8px",
            paddingTop: "12px",
            borderTop: "1px solid #3A256A",
          }}
        >
          <span style={{ fontSize: "16px" }}>{metaIcon}</span>
          <span
            style={{
              fontSize: "13px",
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
    // Update steps: step 1 done, step 2 done (uploaded), step 3 current
    setSteps([
      { id: 1, title: "Choose Model", subtitle: "Completed", state: "done" },
      { id: 2, title: "Upload Garment", subtitle: "Completed", state: "done" },
      { id: 3, title: "Generate & Customize", subtitle: "Current step", state: "current" },
      { id: 4, title: "Results & Download", subtitle: "Final step", state: "later" },
    ]);

    setShowUploadModal(false);

    // Navigate to the selected page
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
    // Update steps: step 1 done, step 2 still next
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

        {/* MAIN CONTENT — scrollable */}
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
              maxWidth: "1100px",
              display: "flex",
              flexDirection: "column",
              gap: "36px",
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
                gap: "28px",
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
                  height: "52px",
                  padding: "14px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
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
                <span style={{ fontSize: "18px" }}>→</span>
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
              borderRadius: "20px",
              background: "#1E0F3B",
              border: "1px solid #3A256A",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)",
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
                    color: "#B8A9E0",
                  }}
                >
                  Upload the garment you want to try on the model
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid #3A256A",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontSize: "18px",
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
                border: "2px dashed #3A256A",
                borderRadius: "16px",
                padding: garmentPreview ? "0" : "40px 24px",
                background: garmentPreview ? "transparent" : "rgba(58, 37, 106, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minHeight: garmentPreview ? "200px" : "200px",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!garmentPreview) {
                  e.currentTarget.style.borderColor = "#8B5CF6";
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!garmentPreview) {
                  e.currentTarget.style.borderColor = "#3A256A";
                  e.currentTarget.style.background = "rgba(58, 37, 106, 0.3)";
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
                      borderRadius: "14px",
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
                      color: "#22c55e",
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
                  color: "#B8A9E0",
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
                  borderRadius: "10px",
                  border: "1px solid #3A256A",
                  background: "transparent",
                  color: "#B8A9E0",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(58, 37, 106, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
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
                    : "#3A256A",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: garmentPreview ? "pointer" : "not-allowed",
                  opacity: garmentPreview ? 1 : 0.5,
                  transition: "all 0.3s ease",
                  boxShadow: garmentPreview ? "0 4px 12px rgba(107, 70, 193, 0.4)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (garmentPreview) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #7C5CFA, #8B5CF6)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(107, 70, 193, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (garmentPreview) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #6B46C1, #8B5CF6)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(107, 70, 193, 0.4)";
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