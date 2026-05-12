import type { JSX } from "react";

export type FlowStep = 1 | 2 | 3 | 4;

interface StepDef {
  id: number;
  title: string;
  subtitle: string;
}

const steps: StepDef[] = [
  { id: 1, title: "Choose Model", subtitle: "Select your model source" },
  { id: 2, title: "Upload Garment", subtitle: "Upload clothing reference" },
  { id: 3, title: "Generate & Customize", subtitle: "Create your try-on" },
  { id: 4, title: "Results & Download", subtitle: "Save your result" },
];

interface GenerationFlowProps {
  activeStep: FlowStep;
}

export default function GenerationFlow({ activeStep }: GenerationFlowProps): JSX.Element {
  return (
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
        {steps.map((s) => {
          const isActive = s.id === activeStep;
          const isDone = s.id < activeStep;
          const isLater = s.id > activeStep;

          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderRadius: "10px",
                padding: "14px 16px",
                border: isActive
                  ? "1px solid rgba(139, 92, 246, 0.5)"
                  : "1px solid transparent",
                background: isActive
                  ? "rgba(139, 92, 246, 0.12)"
                  : "transparent",
                marginBottom: "8px",
                transition: "all 0.3s ease",
                boxShadow: isActive
                  ? "0 0 18px rgba(139, 92, 246, 0.25), inset 0 0 12px rgba(139, 92, 246, 0.08)"
                  : "none",
              }}
            >
              {/* Number Circle */}
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
                    : isActive
                    ? "linear-gradient(135deg, #6B46C1, #8B5CF6)"
                    : "rgba(255,255,255,0.08)",
                  color: isDone ? "#fff" : isActive ? "#fff" : "rgba(255,255,255,0.35)",
                  fontSize: "12px",
                  fontWeight: 700,
                  boxShadow: isActive
                    ? "0 0 12px rgba(139, 92, 246, 0.5)"
                    : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {isDone ? "\u2713" : s.id}
              </div>

              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: isActive ? 600 : 400,
                    color: isDone
                      ? "rgba(255,255,255,0.5)"
                      : isActive
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.35)",
                    lineHeight: "20px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: isDone
                      ? "rgba(16,185,129,0.7)"
                      : isActive
                      ? "rgba(198,166,247,0.8)"
                      : "rgba(255,255,255,0.2)",
                    marginTop: "2px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isDone ? "Completed" : isActive ? "Current step" : isLater ? "Coming up" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions box */}
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
          {activeStep === 1 &&
            "Select how you want to create or choose the model for your virtual try-on experience."}
          {activeStep === 2 &&
            "Upload a garment image that you want to try on the selected model. You can drag and drop or click to browse."}
          {activeStep === 3 &&
            "Customize your generation settings and create your virtual try-on image."}
          {activeStep === 4 &&
            "Your result is ready! Download or share your virtual try-on image."}
        </p>
      </div>
    </aside>
  );
}