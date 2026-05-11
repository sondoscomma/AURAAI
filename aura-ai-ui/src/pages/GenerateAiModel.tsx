import type { JSX, CSSProperties, ReactNode, ChangeEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Brand Colors
const COLORS = {
  primary: '#532C86',        // Indigo Velvet
  secondary: '#C6A6F7',      // Mauve
  background: '#0d0d0d',     // Dark background
  onyx: '#161616',           // Onyx
  platinum: '#EDEDED',       // Platinum
  deepTwilight: '#2B144C',  // Deep twilight
  error: '#ff7b7b'           // Error red
};

// Brand Fonts
const FONTS = {
  primary: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
  secondary: "'General Sans Variable', 'Segoe UI', system-ui, sans-serif"
};

type Gender = "Female" | "Male";

interface HistoryItem {
  title: string;
  time: string;
}

interface StepProps {
  icon: string;
  title: string;
  subtitle: string;
  active?: boolean;
  faded?: boolean;
}

interface HeaderSmallProps {
  icon: string;
  title: string;
  action?: string;
}

interface ChipButtonProps {
  children: ReactNode;
  onClick: () => void;
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

interface GenderButtonProps {
  children: ReactNode;
  active?: boolean;
  onClick: () => void;
}

interface ConfigProps {
  label: string;
  value: string;
  green?: boolean;
}

interface HistoryProps {
  title: string;
  time: string;
}

interface PanelProps {
  children: ReactNode;
}

export default function GenerateAiModel(): JSX.Element {
  const nav = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [gender, setGender] = useState<Gender>("Female");
  const [ageRange, setAgeRange] = useState("20 - 25 years");
  const [ethnicity, setEthnicity] = useState("Arab");
  const [bodyType, setBodyType] = useState("Slim");
  const [clothingStyle, setClothingStyle] = useState("Modern Elegant");
  const [pose, setPose] = useState("Standing Straight");
  const [history, setHistory] = useState<{ title: string; time: string }[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const ageRangeOptions = [
    "18 - 21 years",
    "20 - 25 years",
    "25 - 30 years",
    "30 - 35 years",
    "35 - 40 years",
    "40 - 45 years",
    "45 - 50 years",
    "50+ years",
  ];

  const quickAdds = ["Photorealistic", "Studio Lighting", "4K", "Full Body"];

  function addSuggestion(text: string): void {
    setPrompt((prev) =>
      prev.trim() ? `${prev.trim()}, ${text.toLowerCase()}` : text
    );
  }

  async function handleGenerate(): Promise<void> {
    try {
      setIsGenerating(true);
      setError("");

 const token = localStorage.getItem("token");

if (!token) {
  setError("Please login first.");
  nav("/login");
  return;
}

const res = await fetch("https://auraai-backend-6a8n.onrender.com/api/models/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    prompt,
    gender,
    ageRange,
    ethnicity,
    bodyType,
    clothingStyle,
    pose,
  }),
});
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Generation failed");
      }

      const imageUrl = `data:${data.mimeType};base64,${data.imageBase64}`;
      setGeneratedImage(imageUrl);

      const newModel: HistoryItem = {
        title: `${gender} ${ethnicity} Model`,
        time: "Just now",
      };

      setHistory((prev) => [newModel, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleAgeRangeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setAgeRange(e.target.value);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `aura-ai-model-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: COLORS.background,
        color: COLORS.platinum,
        fontFamily: FONTS.secondary,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          height: "70px",
          background: COLORS.onyx,
          borderBottom: "1px solid rgba(83,44,134,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            ✨
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: FONTS.primary,
              }}
            >
              AURA AI
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(198,166,247,0.6)",
                letterSpacing: "0.04em",
              }}
            >
              Model Generator
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(237,237,237,0.7)",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ❓
          </button>
          <button
            type="button"
            onClick={() => nav("/app/profile")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            👤
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "280px 1fr 260px",
          overflow: "hidden",
        }}
      >
        {/* LEFT SIDEBAR - GENERATION FLOW */}
        <aside
          style={{
            background: COLORS.background,
            borderRight: "1px solid rgba(83,44,134,0.2)",
            padding: "32px 24px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(198,166,247,0.8)",
              letterSpacing: "0.06em",
              marginBottom: 24,
              textTransform: "uppercase",
              fontFamily: FONTS.primary,
            }}
          >
            Generation Flow
          </div>

          <Step
            active
            icon="👤"
            title="Choose Model"
            subtitle="In Progress"
          />
          <Step
            icon="👕"
            title="Upload Garment"
            subtitle="Next step"
            faded
          />
          <Step
            icon="🪄"
            title="Generate"
            subtitle="Processing"
            faded
          />
          <Step icon="⬇" title="Results" subtitle="Final step" faded />
        </aside>

        {/* CENTER - MAIN CONTENT */}
        <main
          style={{
            background: `linear-gradient(155deg, ${COLORS.deepTwilight} 0%, #31145f 50%, #241044 100%)`,
            padding: "40px 48px",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {/* Background accent */}
          <div
            style={{
              position: "absolute",
              top: "-40%",
              right: "-20%",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(198,166,247,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 900, position: "relative", zIndex: 1 }}>
            {/* HEADER SECTION */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 40,
              }}
            >
              <div style={{ display: "flex", gap: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  🪄
                </div>

                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 32,
                      fontWeight: 700,
                      lineHeight: "40px",
                      letterSpacing: "-0.01em",
                      fontFamily: FONTS.primary,
                    }}
                  >
                    Generate AI Model
                  </h1>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "rgba(237,237,237,0.6)",
                      fontSize: 14,
                      lineHeight: "20px",
                      fontWeight: 400,
                      fontFamily: FONTS.secondary,
                    }}
                  >
                    Describe your perfect model and watch AURA create it.
                  </p>
                </div>
              </div>

              <button
                onClick={() => nav("/app/generation")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(198,166,247,0.7)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "8px 12px",
                  borderRadius: 8,
                  transition: "all 0.3s ease",
                  fontFamily: FONTS.primary,
                  marginTop: 4,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>): void => {
                  e.currentTarget.style.background = "rgba(198,166,247,0.1)";
                  e.currentTarget.style.color = COLORS.secondary;
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>): void => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(198,166,247,0.7)";
                }}
              >
                ← Change Method
              </button>
            </div>

            {/* TWO COLUMN LAYOUT */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 380px",
                gap: 32,
              }}
            >
              {/* LEFT COLUMN - INPUTS */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 28,
                }}
              >
                {/* DESCRIPTION PROMPT PANEL */}
                <Panel>
                  <HeaderSmall
                    icon="✎"
                    title="DESCRIPTION PROMPT"
                    action="Randomize"
                  />

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Elegant Arab female model with hazel eyes, long dark wavy hair, wearing casual chic beige outfit, standing confidently in a studio with soft rim lighting, photorealistic, 4k..."
                    style={{
                      width: "100%",
                      height: 160,
                      resize: "none",
                      borderRadius: 12,
                      border: "1px solid rgba(237,237,237,0.12)",
                      background: "rgba(43,20,76,0.35)",
                      color: COLORS.platinum,
                      padding: "16px",
                      boxSizing: "border-box",
                      outline: "none",
                      fontSize: 14,
                      lineHeight: "24px",
                      fontFamily: FONTS.secondary,
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
                      e.currentTarget.style.borderColor = "rgba(198,166,247,0.4)";
                      e.currentTarget.style.background = "rgba(43,20,76,0.5)";
                    }}
                    onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
                      e.currentTarget.style.borderColor = "rgba(237,237,237,0.12)";
                      e.currentTarget.style.background = "rgba(43,20,76,0.35)";
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "rgba(237,237,237,0.5)",
                        fontWeight: 500,
                        fontFamily: FONTS.secondary,
                      }}
                    >
                      Quick add:
                    </span>
                    {quickAdds.map((item) => (
                      <ChipButton
                        key={item}
                        onClick={() => addSuggestion(item)}
                      >
                        {item}
                      </ChipButton>
                    ))}
                  </div>
                </Panel>

                {/* ATTRIBUTES PANEL */}
                <Panel>
                  <HeaderSmall icon="☷" title="ATTRIBUTES" />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 20,
                    }}
                  >
                    {/* GENDER */}
                    <Field label="Gender">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 10,
                        }}
                      >
                        <GenderButton
                          active={gender === "Female"}
                          onClick={() => setGender("Female")}
                        >
                          Female
                        </GenderButton>

                        <GenderButton
                          active={gender === "Male"}
                          onClick={() => setGender("Male")}
                        >
                          Male
                        </GenderButton>
                      </div>
                    </Field>

                    {/* AGE RANGE DROPDOWN */}
                    <Field label="Age Range">
                      <select
                        value={ageRange}
                        onChange={handleAgeRangeChange}
                        style={{
                          width: "100%",
                          height: 48,
                          borderRadius: 10,
                          border: "1px solid rgba(237,237,237,0.14)",
                          background: "rgba(43,20,76,0.35)",
                          color: COLORS.platinum,
                          padding: "0 14px",
                          boxSizing: "border-box",
                          fontSize: 14,
                          fontWeight: 500,
                          outline: "none",
                          fontFamily: FONTS.secondary,
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          appearance: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='${COLORS.secondary}' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 12px center",
                          paddingRight: "36px",
                        }}
                        onFocus={(e: React.FocusEvent<HTMLSelectElement>): void => {
                          e.currentTarget.style.borderColor = "rgba(198,166,247,0.4)";
                          e.currentTarget.style.background = "rgba(43,20,76,0.5)";
                        }}
                        onBlur={(e: React.FocusEvent<HTMLSelectElement>): void => {
                          e.currentTarget.style.borderColor = "rgba(237,237,237,0.14)";
                          e.currentTarget.style.background = "rgba(43,20,76,0.35)";
                        }}
                      >
                        {ageRangeOptions.map((range) => (
                          <option
                            key={range}
                            value={range}
                            style={{
                              background: "#2B144C",
                              color: COLORS.platinum,
                            }}
                          >
                            {range}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* ETHNICITY */}
                    <Field label="Ethnicity">
                      <Input
                        value={ethnicity}
                        onChange={setEthnicity}
                      />
                    </Field>

                    {/* BODY TYPE */}
                    <Field label="Body Type">
                      <Input
                        value={bodyType}
                        onChange={setBodyType}
                      />
                    </Field>

                    {/* CLOTHING STYLE */}
                    <Field label="Clothing Style">
                      <Input
                        value={clothingStyle}
                        onChange={setClothingStyle}
                      />
                    </Field>

                    {/* POSE */}
                    <Field label="Pose">
                      <Input value={pose} onChange={setPose} />
                    </Field>
                  </div>
                </Panel>
              </div>
              {/* RIGHT COLUMN - PREVIEW */}
              <div
                style={{
                  border: "1px solid rgba(237,237,237,0.12)",
                  borderRadius: 16,
                  minHeight: 680,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(43,20,76,0.25)",
                  textAlign: "center",
                  color: "rgba(237,237,237,0.6)",
                  padding: "32px 24px",
                  gap: 16,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {generatedImage ? (
                  <>
                    <img
                      src={generatedImage}
                      alt="Generated AI Model"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: 12,
                        maxHeight: "500px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 16,
                      }}
                    >
                      <button
                        onClick={handleDownload}
                        style={{
                          height: 44,
                          padding: "0 24px",
                          borderRadius: 10,
                          border: "1px solid rgba(198,166,247,0.3)",
                          background: "rgba(198,166,247,0.15)",
                          color: COLORS.platinum,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: FONTS.primary,
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(198,166,247,0.25)";
                          e.currentTarget.style.borderColor = COLORS.secondary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(198,166,247,0.15)";
                          e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
                        }}
                      >
                        ⬇ Download
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(198,166,247,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                      }}
                    >
                      {isGenerating ? "⚡" : "🖼️"}
                    </div>

                    <div>
                      <div
                        style={{
                          color: COLORS.platinum,
                          fontSize: 16,
                          fontWeight: 600,
                          fontFamily: FONTS.primary,
                        }}
                      >
                        {isGenerating ? "Generating Model..." : "Ready to Generate"}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          marginTop: 8,
                          lineHeight: "20px",
                          fontFamily: FONTS.secondary,
                        }}
                      >
                        {isGenerating ? (
                          <>
                            Nano Banana Pro is creating
                            <br />
                            your AI fashion model...
                          </>
                        ) : (
                          <>
                            Fill in the details and hit generate
                            <br />
                            to see your AI model.
                          </>
                        )}
                      </div>

                      {error && (
                        <div
                          style={{
                            marginTop: 14,
                            color: COLORS.error,
                            fontSize: 12,
                            fontWeight: 500,
                            fontFamily: FONTS.secondary,
                          }}
                        >
                          {error}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 14,
                marginTop: 32,
              }}
            >
              <button
                style={{
                  height: 52,
                  padding: "0 28px",
                  borderRadius: 10,
                  border: "1px solid rgba(237,237,237,0.15)",
                  background: "rgba(43,20,76,0.3)",
                  color: COLORS.platinum,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: FONTS.primary,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(43,20,76,0.5)";
                  e.currentTarget.style.borderColor = "rgba(237,237,237,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(43,20,76,0.3)";
                  e.currentTarget.style.borderColor = "rgba(237,237,237,0.15)";
                }}
              >
                ↻ Regenerate
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  height: 52,
                  padding: "0 48px",
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontFamily: FONTS.primary,
                  boxShadow: "0 8px 32px rgba(198,166,247,0.25)",
                  transition: "all 0.3s ease",
                  opacity: isGenerating ? 0.65 : 1,
                }}
                onMouseEnter={(e) => {
                  if (isGenerating) return;

                  e.currentTarget.style.boxShadow = "0 12px 48px rgba(198,166,247,0.35)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(198,166,247,0.25)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isGenerating ? "Generating..." : "⏻ Generate Model"}
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR - CONFIGURATION & HISTORY */}
        <aside
          style={{
            background: COLORS.background,
            borderLeft: "1px solid rgba(83,44,134,0.2)",
            padding: "32px 20px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.platinum,
              letterSpacing: "0.06em",
              marginBottom: 20,
              textTransform: "uppercase",
              fontFamily: FONTS.primary,
            }}
          >
            ▰ Configuration
          </div>

          <div
            style={{
              border: "1px solid rgba(198,166,247,0.2)",
              background: "rgba(83,44,134,0.15)",
              borderRadius: 12,
              padding: 16,
              fontSize: 13,
              marginBottom: 32,
            }}
          >
            <Config label="METHOD" value="AI Generation" />
            <Config label="CREDITS" value="1 / Generation" />
            <Config label="QUALITY" value="High (4K)" green />
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(237,237,237,0.7)",
              letterSpacing: "0.06em",
              marginBottom: 14,
              textTransform: "uppercase",
              fontFamily: FONTS.primary,
            }}
          >
            History
          </div>

          {history.length === 0 ? (
            <div
              style={{
                color: "rgba(237,237,237,0.4)",
                fontSize: 12,
                paddingTop: 10,
                fontFamily: FONTS.secondary,
              }}
            >
              No generated models yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map((item, index) => (
                <History key={index} title={item.title} time={item.time} />
              ))}
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button
            onClick={() => nav("/app/upload-garment")}
            style={{
              height: 48,
              borderRadius: 10,
              border: "1px solid rgba(237,237,237,0.15)",
              background: "rgba(237,237,237,0.06)",
              color: COLORS.platinum,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: FONTS.primary,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(198,166,247,0.15)";
              e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(237,237,237,0.06)";
              e.currentTarget.style.borderColor = "rgba(237,237,237,0.15)";
            }}
          >
            Confirm Selection →
          </button>
        </aside>
      </div>
    </div>
  );
}

// ============ COMPONENT PARTS ============

function Step(props: StepProps): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "14px",
        borderRadius: 10,
        marginBottom: 12,
        background: props.active
          ? "rgba(83,44,134,0.35)"
          : "rgba(255,255,255,0.03)",
        border: props.active
          ? "1px solid rgba(198,166,247,0.45)"
          : "1px solid rgba(255,255,255,0.05)",
        opacity: props.faded ? 0.35 : 1,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: props.active
            ? `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`
            : "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {props.icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.platinum,
            fontFamily: FONTS.primary,
          }}
        >
          {props.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(237,237,237,0.45)",
            marginTop: 2,
            fontFamily: FONTS.secondary,
          }}
        >
          {props.subtitle}
        </div>
      </div>
    </div>
  );
}

function Panel({ children }: PanelProps): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid rgba(237,237,237,0.12)",
        borderRadius: 16,
        padding: 24,
        background: "rgba(43,20,76,0.2)",
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}

function HeaderSmall(props: HeaderSmallProps): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.secondary,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: FONTS.primary,
        }}
      >
        {props.icon} {props.title}
      </div>
      {props.action && (
        <span
          style={{
            fontSize: 11,
            color: "rgba(198,166,247,0.4)",
            cursor: "pointer",
            transition: "color 0.3s ease",
            fontFamily: FONTS.secondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COLORS.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(198,166,247,0.4)";
          }}
        >
          ❖ {props.action}
        </span>
      )}
    </div>
  );
}

function ChipButton(props: ChipButtonProps): JSX.Element {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  return (
    <button
      type="button"
      onClick={props.onClick}
      style={{
        padding: "6px 16px",
        borderRadius: 999,
        border: "1px solid rgba(198,166,247,0.25)",
        background: isHovered
          ? "rgba(198,166,247,0.25)"
          : "rgba(198,166,247,0.12)",
        color: COLORS.platinum,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.3s ease",
        fontFamily: FONTS.secondary,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {props.children}
    </button>
  );
}

function Field(props: FieldProps): JSX.Element {
  return (
    <label>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(237,237,237,0.65)",
          marginBottom: 10,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          fontFamily: FONTS.primary,
        }}
      >
        {props.label}
      </div>
      {props.children}
    </label>
  );
}

function Input(props: InputProps): JSX.Element {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    e.currentTarget.style.borderColor = "rgba(198,166,247,0.4)";
    e.currentTarget.style.background = "rgba(43,20,76,0.5)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    e.currentTarget.style.borderColor = "rgba(237,237,237,0.14)";
    e.currentTarget.style.background = "rgba(43,20,76,0.35)";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    props.onChange(e.target.value);
  };

  return (
    <input
      value={props.value}
      onChange={handleChange}
      style={{
        width: "100%",
        height: 48,
        borderRadius: 10,
        border: "1px solid rgba(237,237,237,0.14)",
        background: "rgba(43,20,76,0.35)",
        color: COLORS.platinum,
        padding: "0 14px",
        boxSizing: "border-box",
        fontSize: 14,
        fontWeight: 500,
        outline: "none",
        fontFamily: FONTS.secondary,
        transition: "all 0.3s ease",
      } as CSSProperties}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}

function GenderButton(props: GenderButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      style={{
        height: 48,
        borderRadius: 10,
        border: props.active
          ? "1px solid rgba(198,166,247,0.6)"
          : "1px solid rgba(237,237,237,0.14)",
        background: props.active
          ? "rgba(198,166,247,0.2)"
          : "rgba(43,20,76,0.3)",
        color: COLORS.platinum,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: FONTS.primary,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        if (!props.active) {
          e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
          e.currentTarget.style.background = "rgba(43,20,76,0.45)";
        }
      }}
      onMouseLeave={(e) => {
        if (!props.active) {
          e.currentTarget.style.borderColor = "rgba(237,237,237,0.14)";
          e.currentTarget.style.background = "rgba(43,20,76,0.3)";
        }
      }}
    >
      {props.children}
    </button>
  );
}

function Config(props: ConfigProps): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <span
        style={{
          color: "rgba(237,237,237,0.55)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.02em",
          fontFamily: FONTS.secondary,
        }}
      >
        {props.label}
      </span>
      <span
        style={{
          color: props.green ? "#4ade80" : COLORS.secondary,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: FONTS.primary,
        }}
      >
        {props.value}
      </span>
    </div>
  );
}

function History(props: HistoryProps): JSX.Element {
  return (
    <div
      style={{
        height: 72,
        borderRadius: 10,
        background: "rgba(83,44,134,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px",
        border: "1px solid rgba(198,166,247,0.15)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(83,44,134,0.45)";
        e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(83,44,134,0.3)";
        e.currentTarget.style.borderColor = "rgba(198,166,247,0.15)";
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.platinum, fontFamily: FONTS.primary }}>
          {props.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(237,237,237,0.45)",
            marginTop: 3,
            fontFamily: FONTS.secondary,
          }}
        >
          {props.time}
        </div>
      </div>
    </div>
  );
}