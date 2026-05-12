import type { JSX, CSSProperties } from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GenerationFlow from "../components/GenerationFlow";
import { getUser } from "../components/localAuth";

// ─── Brand constants ───
const COLORS = {
  primary: "#532C86",
  secondary: "#C6A6F7",
  background: "#0d0d0d",
  onyx: "#161616",
  platinum: "#EDEDED",
  deepTwilight: "#2B144C",
  error: "#ff7b7b",
};

const FONTS = {
  primary: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
  secondary: "'General Sans Variable', 'Segoe UI', system-ui, sans-serif",
};

const API_URL = "https://auraai-backend-6a8n.onrender.com";

// ─── Types ───
type Direction = "front" | "back" | "left" | "right";

interface DirectionTab {
  id: Direction;
  label: string;
  icon: string;
}

const DIRECTIONS: DirectionTab[] = [
  { id: "front", label: "Front View", icon: "\u{1F464}" },
  { id: "left", label: "Left View", icon: "\u2B05" },
  { id: "back", label: "Back View", icon: "\u{1F504}" },
  { id: "right", label: "Right View", icon: "\u27A1" },
];

// ─── Main component ───
export default function GenerationResult(): JSX.Element {
  const nav = useNavigate();
  const location = useLocation();
  const [activeDirection, setActiveDirection] = useState<Direction>("front");
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [savingToBackend, setSavingToBackend] = useState(false);
  const [backendSaveStatus, setBackendSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Get the generated image from navigation state
  const state = location.state as {
    generatedImage?: string;
    method?: string;
    title?: string;
  } | null;

  const generatedImage = state?.generatedImage || null;
  const method = state?.method || "AI Generation";
  const title = state?.title || "AI Generated Model";

  // Get current user for scoped storage
  const currentUser = getUser();
  const userKey = currentUser
    ? `aura_generation_history_${currentUser.email}`
    : "aura_generation_history_guest";

  // ─── Save to user-scoped localStorage ───
  useEffect(() => {
    if (generatedImage && !savedToHistory) {
      try {
        const existing = localStorage.getItem(userKey);
        const history = existing ? JSON.parse(existing) : [];

        const newEntry = {
          id: Date.now().toString(),
          image: generatedImage,
          method,
          title,
          createdAt: new Date().toISOString(),
          type: "generation",
          userEmail: currentUser?.email || "guest",
        };

        localStorage.setItem(userKey, JSON.stringify([newEntry, ...history]));
        setSavedToHistory(true);
      } catch {
        // Silently fail if localStorage is unavailable
      }
    }
  }, [generatedImage, method, title, savedToHistory, userKey, currentUser]);

  // ─── Save to backend for the logged-in user ───
  const saveToBackend = useCallback(async (): Promise<void> => {
    if (!generatedImage || backendSaveStatus === "success") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSavingToBackend(true);

      // Extract base64 from data URL
      const base64Match = generatedImage.match(/^data:[^;]+;base64,(.+)$/);
      if (!base64Match) return;

      const imageBase64 = base64Match[1];
      const mimeType = generatedImage.match(/^data:([^;]+);/)?.[1] || "image/png";

      const res = await fetch(`${API_URL}/api/models/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          method,
          imageBase64,
          mimeType,
          prompt: `AI Generation - ${method}`,
        }),
      });

      if (res.ok) {
        setBackendSaveStatus("success");
      } else {
        setBackendSaveStatus("error");
      }
    } catch {
      setBackendSaveStatus("error");
    } finally {
      setSavingToBackend(false);
    }
  }, [generatedImage, method, title, backendSaveStatus]);

  // Auto-save to backend when image arrives
  useEffect(() => {
    if (generatedImage && backendSaveStatus === "idle") {
      saveToBackend();
    }
  }, [generatedImage, backendSaveStatus, saveToBackend]);

  // ─── Download handlers ───
  const handleDownload = (): void => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `aura-ai-model-${activeDirection}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = (): void => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `aura-ai-model-all-views-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Direction transform CSS ───
  const getTransformStyle = (dir: Direction): CSSProperties => {
    switch (dir) {
      case "front":
        return { transform: "scaleX(1)" };
      case "back":
        return { transform: "scaleX(-1)" };
      case "left":
        return { transform: "perspective(800px) rotateY(15deg)" };
      case "right":
        return { transform: "perspective(800px) rotateY(-15deg)" };
      default:
        return {};
    }
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
        fontFamily: FONTS.primary,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* ═══════ HEADER ═══════ */}
      <header
        style={{
          height: "70px",
          background: COLORS.onyx,
          borderBottom: "1px solid rgba(83,44,134,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          flexShrink: 0,
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
            {"\u2728"}
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.08em",
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
              Generation Results
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => nav("/app/generation")}
            style={{
              border: "1px solid rgba(237,237,237,0.14)",
              background: "transparent",
              color: COLORS.platinum,
              borderRadius: "8px",
              padding: "9px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: FONTS.primary,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(198,166,247,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {"\u2190"} New Generation
          </button>
          <button
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
            {"\u{1F464}"}
          </button>
        </div>
      </header>

      {/* ═══════ MAIN LAYOUT ═══════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* SIDEBAR - Generation Flow with Step 4 active (Results & Download) */}
        <GenerationFlow activeStep={4} />

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            background: `linear-gradient(155deg, ${COLORS.deepTwilight} 0%, #1c0a40 52%, #31145f 100%)`,
            padding: "40px 48px",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {/* Background accent orb */}
          <div
            style={{
              position: "absolute",
              top: "-30%",
              right: "-15%",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(198,166,247,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 1100, position: "relative", zIndex: 1 }}>
            {/* ─── HEADER SECTION ─── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 36,
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
                  {"\u{1F389}"}
                </div>
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 32,
                      fontWeight: 700,
                      lineHeight: "40px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Generation Complete
                  </h1>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "rgba(237,237,237,0.6)",
                      fontSize: 14,
                      lineHeight: "20px",
                    }}
                  >
                    Your AI model has been generated successfully. View it from
                    every direction.
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {savedToHistory && (
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      fontSize: 12,
                      color: "#6EE7B7",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {"\u2713"} Saved locally
                  </div>
                )}
                {backendSaveStatus === "success" && (
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      fontSize: 12,
                      color: "#A5B4FC",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {"\u2713"} Synced to cloud
                  </div>
                )}
                {savingToBackend && (
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "rgba(198,166,247,0.1)",
                      border: "1px solid rgba(198,166,247,0.2)",
                      fontSize: 12,
                      color: COLORS.secondary,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {"\u23F3"} Saving to cloud...
                  </div>
                )}
              </div>
            </div>

            {/* ─── DIRECTION TABS ─── */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 28,
                flexWrap: "wrap",
              }}
            >
              {DIRECTIONS.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => setActiveDirection(dir.id)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border:
                      activeDirection === dir.id
                        ? "1px solid rgba(198,166,247,0.6)"
                        : "1px solid rgba(237,237,237,0.12)",
                    background:
                      activeDirection === dir.id
                        ? "rgba(198,166,247,0.18)"
                        : "rgba(43,20,76,0.2)",
                    color:
                      activeDirection === dir.id
                        ? COLORS.secondary
                        : "rgba(237,237,237,0.6)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: activeDirection === dir.id ? 600 : 400,
                    fontFamily: FONTS.primary,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (activeDirection !== dir.id) {
                      e.currentTarget.style.background = "rgba(43,20,76,0.35)";
                      e.currentTarget.style.borderColor =
                        "rgba(198,166,247,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeDirection !== dir.id) {
                      e.currentTarget.style.background = "rgba(43,20,76,0.2)";
                      e.currentTarget.style.borderColor =
                        "rgba(237,237,237,0.12)";
                    }
                  }}
                >
                  <span style={{ fontSize: 16 }}>{dir.icon}</span>
                  {dir.label}
                </button>
              ))}
            </div>

            {/* ─── MAIN IMAGE DISPLAY ─── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 340px",
                gap: 32,
              }}
            >
              {/* LEFT - Main image display */}
              <div
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(237,237,237,0.12)",
                  background: "rgba(43,20,76,0.25)",
                  padding: 32,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 520,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {generatedImage ? (
                  <>
                    {/* Direction indicator badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: "rgba(83,44,134,0.7)",
                        border: "1px solid rgba(198,166,247,0.3)",
                        fontSize: 12,
                        color: COLORS.secondary,
                        fontWeight: 600,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {
                        DIRECTIONS.find((d) => d.id === activeDirection)?.icon
                      }{" "}
                      {
                        DIRECTIONS.find((d) => d.id === activeDirection)
                          ?.label
                      }
                    </div>

                    <img
                      src={generatedImage}
                      alt={`Generated model - ${activeDirection} view`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "440px",
                        objectFit: "contain",
                        borderRadius: 12,
                        transition:
                          "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                        ...getTransformStyle(activeDirection),
                      }}
                    />

                    <div
                      style={{
                        marginTop: 20,
                        fontSize: 13,
                        color: "rgba(237,237,237,0.5)",
                        textAlign: "center",
                      }}
                    >
                      Viewing from the{" "}
                      <span
                        style={{
                          color: COLORS.secondary,
                          fontWeight: 600,
                        }}
                      >
                        {activeDirection}
                      </span>{" "}
                      direction
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "rgba(237,237,237,0.5)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 48,
                        marginBottom: 16,
                      }}
                    >
                      {"\u{1F5BC}\uFE0F"}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                      No image found
                    </div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>
                      Please generate a model first
                    </div>
                    <button
                      onClick={() => nav("/app/generation")}
                      style={{
                        marginTop: 20,
                        padding: "10px 24px",
                        borderRadius: 10,
                        border: "none",
                        background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})`,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: FONTS.primary,
                      }}
                    >
                      Go to Generation
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT - Info panel */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                {/* Image info card */}
                <div
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(237,237,237,0.12)",
                    background: "rgba(43,20,76,0.2)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.secondary,
                      marginBottom: 16,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {"\u25B0"} Image Details
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <DetailRow label="Method" value={method} />
                    <DetailRow label="Title" value={title} />
                    <DetailRow
                      label="Direction"
                      value={
                        activeDirection.charAt(0).toUpperCase() +
                        activeDirection.slice(1)
                      }
                      highlight
                    />
                    <DetailRow label="Quality" value="High (4K)" green />
                    <DetailRow label="Status" value="Complete" green />
                    <DetailRow
                      label="Owner"
                      value={currentUser?.email || "Guest"}
                    />
                  </div>
                </div>

                {/* Direction preview thumbnails */}
                <div
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(237,237,237,0.12)",
                    background: "rgba(43,20,76,0.2)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.secondary,
                      marginBottom: 16,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {"\u25B0"} All Views
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {DIRECTIONS.map((dir) => (
                      <button
                        key={dir.id}
                        onClick={() => setActiveDirection(dir.id)}
                        style={{
                          borderRadius: 10,
                          border:
                            activeDirection === dir.id
                              ? "1px solid rgba(198,166,247,0.6)"
                              : "1px solid rgba(237,237,237,0.08)",
                          background:
                            activeDirection === dir.id
                              ? "rgba(198,166,247,0.15)"
                              : "rgba(43,20,76,0.15)",
                          padding: 12,
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => {
                          if (activeDirection !== dir.id) {
                            e.currentTarget.style.background =
                              "rgba(43,20,76,0.3)";
                            e.currentTarget.style.borderColor =
                              "rgba(198,166,247,0.3)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeDirection !== dir.id) {
                            e.currentTarget.style.background =
                              "rgba(43,20,76,0.15)";
                            e.currentTarget.style.borderColor =
                              "rgba(237,237,237,0.08)";
                          }
                        }}
                      >
                        {generatedImage && (
                          <img
                            src={generatedImage}
                            alt={dir.label}
                            style={{
                              width: "100%",
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 6,
                              ...getTransformStyle(dir.id),
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight:
                              activeDirection === dir.id ? 600 : 400,
                            color:
                              activeDirection === dir.id
                                ? COLORS.secondary
                                : "rgba(237,237,237,0.5)",
                          }}
                        >
                          {dir.icon} {dir.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={handleDownload}
                    disabled={!generatedImage}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      border: "1px solid rgba(198,166,247,0.3)",
                      background: "rgba(198,166,247,0.15)",
                      color: COLORS.platinum,
                      cursor: generatedImage ? "pointer" : "not-allowed",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: FONTS.primary,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: generatedImage ? 1 : 0.45,
                    }}
                    onMouseEnter={(e) => {
                      if (generatedImage) {
                        e.currentTarget.style.background =
                          "rgba(198,166,247,0.25)";
                        e.currentTarget.style.borderColor = COLORS.secondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (generatedImage) {
                        e.currentTarget.style.background =
                          "rgba(198,166,247,0.15)";
                        e.currentTarget.style.borderColor =
                          "rgba(198,166,247,0.3)";
                      }
                    }}
                  >
                    {"\u2B07"} Download Current View
                  </button>

                  <button
                    onClick={handleDownloadAll}
                    disabled={!generatedImage}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      border: "none",
                      background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
                      color: "#fff",
                      cursor: generatedImage ? "pointer" : "not-allowed",
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: FONTS.primary,
                      boxShadow: "0 8px 32px rgba(198,166,247,0.25)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: generatedImage ? 1 : 0.45,
                    }}
                    onMouseEnter={(e) => {
                      if (generatedImage) {
                        e.currentTarget.style.boxShadow =
                          "0 12px 48px rgba(198,166,247,0.35)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (generatedImage) {
                        e.currentTarget.style.boxShadow =
                          "0 8px 32px rgba(198,166,247,0.25)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {"\u2B07"} Download All Views
                  </button>

                  <button
                    onClick={() => nav("/app/profile")}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      border: "1px solid rgba(237,237,237,0.12)",
                      background: "rgba(43,20,76,0.2)",
                      color: "rgba(237,237,237,0.7)",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: FONTS.primary,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(43,20,76,0.35)";
                      e.currentTarget.style.color = COLORS.platinum;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(43,20,76,0.2)";
                      e.currentTarget.style.color = "rgba(237,237,237,0.7)";
                    }}
                  >
                    {"\u{1F464}"} View in Profile History
                  </button>

                  {backendSaveStatus === "error" && (
                    <button
                      onClick={saveToBackend}
                      disabled={savingToBackend}
                      style={{
                        height: 48,
                        borderRadius: 10,
                        border: "1px solid rgba(255,123,123,0.3)",
                        background: "rgba(255,123,123,0.1)",
                        color: "#ff7b7b",
                        cursor: savingToBackend ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: FONTS.primary,
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        if (!savingToBackend) {
                          e.currentTarget.style.background =
                            "rgba(255,123,123,0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,123,123,0.1)";
                      }}
                    >
                      {"\u21BB"} Retry Cloud Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Helper component ───
function DetailRow(props: {
  label: string;
  value: string;
  green?: boolean;
  highlight?: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          color: "rgba(237,237,237,0.5)",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {props.label}
      </span>
      <span
        style={{
          color: props.green
            ? "#6EE7B7"
            : props.highlight
            ? COLORS.secondary
            : COLORS.platinum,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {props.value}
      </span>
    </div>
  );
}

