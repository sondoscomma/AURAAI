import type { JSX } from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GenerationFlow from "../components/GenerationFlow";
import AuraLogo from "../components/AuraLogo";
import SafeImage from "../components/SafeImage";
import { getImage } from "../utils/imageStore";
import { fetchGeneration, validateAndBuildImageUrl } from "../utils/apiClient";

// ─── Brand constants ───
const COLORS = {
  primary: "#532C86",
  secondary: "#C6A6F7",
  background: "#0d0d0d",
  onyx: "#161616",
  platinum: "#EDEDED",
  deepTwilight: "#2B144C",
  error: "#ff7b7b",
  success: "#6EE7B7",
};

const FONTS = {
  primary: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
  secondary: "'General Sans Variable', 'Segoe UI', system-ui, sans-serif",
};

// ─── Chat message type ───
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

// ─── Suggestion chips ───
const SUGGESTIONS = [
  "Change the pose to a walking pose",
  "Make the background a beach setting",
  "Add sunglasses to the model",
  "Change the lighting to golden hour",
  "Make it look more casual",
  "Add a belt to the outfit",
];

// ─── Main component ───
export default function GarmentChatAdjust(): JSX.Element {
  const nav = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AURA AI style assistant. I can help you adjust the generated image. Try asking me to change the pose, background, lighting, or any other detail about how the garment looks on the model.",
      timestamp: new Date(),
    },
  ]);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [chatError, setChatError] = useState("");

  // Current displayed image (updates as adjustments are made)
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  // Get data from navigation state
  const state = location.state as {
    garmentImageKey?: string;
    originalImageKey?: string;
    method?: string;
    title?: string;
    frontImageId?: string;
    garmentResultImageId?: string;
    groupId?: string;
    gender?: string;
    ageRange?: string;
    ethnicity?: string;
    bodyType?: string;
    clothingStyle?: string;
    pose?: string;
    prompt?: string;
  } | null;

  // Retrieve images from ImageStore
  const garmentResultImage = getImage(state?.garmentImageKey) || null;

  // Initialize current image to the garment result
  useEffect(() => {
    if (garmentResultImage && !currentImage) {
      setCurrentImage(garmentResultImage);
      setCurrentImageId(state?.garmentResultImageId || null);
    }
  }, [garmentResultImage, currentImage, state?.garmentResultImageId]);

  const method = state?.method || "AI Generation + Garment";
  const groupId = state?.groupId;

  // Model attributes from previous step
  const modelGender = state?.gender || "Female";
  const modelAgeRange = state?.ageRange || "20 - 25 years";
  const modelEthnicity = state?.ethnicity || "Arab";
  const modelBodyType = state?.bodyType || "Slim";
  const modelClothingStyle = state?.clothingStyle || "Modern Elegant";
  const modelPose = state?.pose || "Standing Straight";

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handle chat adjustment request ──
  async function handleSendChat(): Promise<void> {
    const userMessage = chatInput.trim();
    if (!userMessage || isAdjusting) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);
    setChatInput("");
    setChatError("");

    // Add placeholder assistant message
    const placeholderIdx = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Adjusting your image...", timestamp: new Date(), isGenerating: true },
    ]);

    try {
      setIsAdjusting(true);

      const token = localStorage.getItem("token");
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      }

      // Build the adjustment prompt: we tell the AI to modify the current image
      // based on the user's request, preserving the garment
      const adjustmentPrompt = `
You are modifying an existing AI-generated fashion model image.

IMPORTANT CONTEXT:
- This is an ADJUSTMENT to a previously generated image of a model wearing a garment.
- The user wants to make the following change: "${userMessage}"
- You MUST keep the same model and the same garment exactly as they are.
- Only change what the user is asking for.
- Do NOT change the garment's appearance, color, style, or design in any way.
- Do NOT change the model's face, body type, or ethnicity.

Model details:
- Gender: ${modelGender}
- Age range: ${modelAgeRange}
- Ethnicity: ${modelEthnicity}
- Body type: ${modelBodyType}

User's adjustment request: ${userMessage}

Style:
Photorealistic, professional studio lighting, full body visible, clean background, fashion e-commerce quality, high detail.
`;

      const requestBody = {
        gender: modelGender,
        ageRange: modelAgeRange,
        ethnicity: modelEthnicity,
        bodyType: modelBodyType,
        clothingStyle: modelClothingStyle,
        pose: modelPose,
        prompt: adjustmentPrompt,
        // Pass the current image as the base for editing
        baseImage: currentImage,
        baseImageId: currentImageId || state?.garmentResultImageId || state?.frontImageId,
        userPrompt: userMessage,
        groupId,
      };

      const data = await fetchGeneration("/api/models/adjust", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(requestBody),
      });

      const resultImageUrl = validateAndBuildImageUrl(data as Record<string, unknown>, "image adjustment");
      const resultImageId = (data as Record<string, unknown>).imageId as string;

      // Update the displayed image
      setCurrentImage(resultImageUrl);
      setCurrentImageId(resultImageId);

      // Update the assistant message with success
      setMessages((prev) => {
        const updated = [...prev];
        updated[placeholderIdx] = {
          role: "assistant",
          content: `Done! I've adjusted the image based on your request: "${userMessage}". The garment and model have been preserved. You can continue adjusting or download the result.`,
          timestamp: new Date(),
          isGenerating: false,
        };
        return updated;
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Image adjustment failed";
      setChatError(errorMsg);

      // Update the assistant message with error
      setMessages((prev) => {
        const updated = [...prev];
        updated[placeholderIdx] = {
          role: "assistant",
          content: `Sorry, I couldn't adjust the image: ${errorMsg}. Please try again with a different request.`,
          timestamp: new Date(),
          isGenerating: false,
        };
        return updated;
      });
    } finally {
      setIsAdjusting(false);
    }
  }

  // ── Download handler ──
  const handleDownload = async (imageUrl?: string | null): Promise<void> => {
    const imageToDownload = imageUrl || currentImage;
    if (!imageToDownload) return;
    try {
      if (imageToDownload.startsWith("http")) {
        const response = await fetch(imageToDownload);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `aura-ai-adjusted-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        const link = document.createElement("a");
        link.href = imageToDownload;
        link.download = `aura-ai-adjusted-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      window.open(imageToDownload, "_blank");
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
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
          <AuraLogo size={40} />
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
              Adjust & Refine
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => nav("/app/generation-result", { state: location.state })}
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
            {"\u2190"} Back to Results
          </button>
          <button
            onClick={() => nav("/app/generation")}
            style={{
              border: "1px solid rgba(237,237,237,0.14)",
              background: "transparent",
              color: "rgba(237,237,237,0.7)",
              borderRadius: "8px",
              padding: "9px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: FONTS.primary,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(198,166,247,0.1)";
              e.currentTarget.style.color = COLORS.platinum;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(237,237,237,0.7)";
            }}
          >
            {"\u2190"} New Generation
          </button>
        </div>
      </header>

      {/* ═══════ MAIN LAYOUT ═══════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* SIDEBAR */}
        <GenerationFlow activeStep={5} />

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            background: `linear-gradient(155deg, ${COLORS.deepTwilight} 0%, #1c0a40 52%, #31145f 100%)`,
            padding: "32px 40px",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            gap: 28,
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
              background: "radial-gradient(circle, rgba(198,166,247,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* ═══════ LEFT - IMAGE DISPLAY ═══════ */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "relative",
              zIndex: 1,
              minWidth: 0,
            }}
          >
            {/* Image container */}
            <div
              style={{
                flex: 1,
                borderRadius: 20,
                border: "1px solid rgba(237,237,237,0.12)",
                background: "rgba(43,20,76,0.25)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              {/* Front view badge */}
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
                  zIndex: 2,
                }}
              >
                {"\u{1F455}"} Model with Garment
              </div>

              {isAdjusting && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(198,166,247,0.2)",
                    border: "1px solid rgba(198,166,247,0.4)",
                    fontSize: 12,
                    color: COLORS.secondary,
                    fontWeight: 600,
                    backdropFilter: "blur(8px)",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: COLORS.secondary,
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  Adjusting...
                </div>
              )}

              {currentImage ? (
                <SafeImage
                  src={currentImage}
                  alt="Model with garment"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: 12,
                    transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
                    opacity: isAdjusting ? 0.6 : 1,
                  }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "rgba(237,237,237,0.5)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F5BC}\uFE0F"}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>No image found</div>
                </div>
              )}
            </div>

            {/* Action bar below image */}
            <div
              style={{
                display: "flex",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => handleDownload()}
                disabled={!currentImage}
                style={{
                  height: 44,
                  padding: "0 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(198,166,247,0.3)",
                  background: "rgba(198,166,247,0.15)",
                  color: COLORS.platinum,
                  cursor: currentImage ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: FONTS.primary,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: currentImage ? 1 : 0.45,
                }}
                onMouseEnter={(e) => {
                  if (currentImage) {
                    e.currentTarget.style.background = "rgba(198,166,247,0.25)";
                    e.currentTarget.style.borderColor = COLORS.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentImage) {
                    e.currentTarget.style.background = "rgba(198,166,247,0.15)";
                    e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
                  }
                }}
              >
                {"\u2B07"} Download
              </button>

              <button
                onClick={() => nav("/app/profile")}
                style={{
                  height: 44,
                  padding: "0 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(237,237,237,0.12)",
                  background: "rgba(43,20,76,0.2)",
                  color: "rgba(237,237,237,0.7)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: FONTS.primary,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
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
                {"\u{1F464}"} Profile History
              </button>

              <div style={{ flex: 1 }} />

              {/* Image info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 12,
                  color: "rgba(237,237,237,0.5)",
                  fontFamily: FONTS.secondary,
                }}
              >
                <span>{method}</span>
                <span style={{ color: "rgba(237,237,237,0.2)" }}>|</span>
                <span style={{ color: COLORS.success }}>Front View</span>
                <span style={{ color: "rgba(237,237,237,0.2)" }}>|</span>
                <span>High Quality</span>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT - CHAT BOX ═══════ */}
          <div
            style={{
              width: 420,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              borderRadius: 20,
              border: "1px solid rgba(237,237,237,0.12)",
              background: "rgba(22,22,22,0.85)",
              backdropFilter: "blur(12px)",
              overflow: "hidden",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Chat header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(237,237,237,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {"\u{1F9E0}"}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: COLORS.platinum,
                    fontFamily: FONTS.primary,
                  }}
                >
                  AURA Style Assistant
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(237,237,237,0.5)",
                    fontFamily: FONTS.secondary,
                  }}
                >
                  Chat to adjust and refine your image
                </div>
              </div>
            </div>

            {/* Chat messages area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 0,
              }}
            >
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} message={msg} />
              ))}
              <div ref={chatEndRef} />

              {chatError && !isAdjusting && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "rgba(255,123,123,0.1)",
                    border: "1px solid rgba(255,123,123,0.2)",
                    color: COLORS.error,
                    fontSize: 12,
                    fontFamily: FONTS.secondary,
                  }}
                >
                  {chatError}
                </div>
              )}
            </div>

            {/* Suggestion chips */}
            <div
              style={{
                padding: "0 24px 12px",
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                flexShrink: 0,
              }}
            >
              {SUGGESTIONS.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setChatInput(suggestion)}
                  disabled={isAdjusting}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "1px solid rgba(198,166,247,0.2)",
                    background: "rgba(198,166,247,0.08)",
                    color: "rgba(237,237,237,0.7)",
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: isAdjusting ? "not-allowed" : "pointer",
                    fontFamily: FONTS.secondary,
                    transition: "all 0.2s ease",
                    opacity: isAdjusting ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isAdjusting) {
                      e.currentTarget.style.background = "rgba(198,166,247,0.18)";
                      e.currentTarget.style.borderColor = "rgba(198,166,247,0.4)";
                      e.currentTarget.style.color = COLORS.platinum;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdjusting) {
                      e.currentTarget.style.background = "rgba(198,166,247,0.08)";
                      e.currentTarget.style.borderColor = "rgba(198,166,247,0.2)";
                      e.currentTarget.style.color = "rgba(237,237,237,0.7)";
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat input area */}
            <div
              style={{
                padding: "16px 24px 20px",
                borderTop: "1px solid rgba(237,237,237,0.08)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-end",
                }}
              >
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe how you want to adjust the image..."
                  disabled={isAdjusting}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    maxHeight: 120,
                    resize: "none",
                    borderRadius: 12,
                    border: "1px solid rgba(237,237,237,0.12)",
                    background: "rgba(43,20,76,0.35)",
                    color: COLORS.platinum,
                    padding: "12px 16px",
                    boxSizing: "border-box",
                    outline: "none",
                    fontSize: 13,
                    lineHeight: "20px",
                    fontFamily: FONTS.secondary,
                    transition: "all 0.3s ease",
                    opacity: isAdjusting ? 0.6 : 1,
                  }}
                  onFocus={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
                    if (!isAdjusting) {
                      e.currentTarget.style.borderColor = "rgba(198,166,247,0.4)";
                      e.currentTarget.style.background = "rgba(43,20,76,0.5)";
                    }
                  }}
                  onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
                    if (!isAdjusting) {
                      e.currentTarget.style.borderColor = "rgba(237,237,237,0.12)";
                      e.currentTarget.style.background = "rgba(43,20,76,0.35)";
                    }
                  }}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || isAdjusting}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: "none",
                    background: chatInput.trim() && !isAdjusting
                      ? `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`
                      : "rgba(43,20,76,0.3)",
                    color: chatInput.trim() && !isAdjusting ? "#fff" : "rgba(237,237,237,0.4)",
                    cursor: chatInput.trim() && !isAdjusting ? "pointer" : "not-allowed",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (chatInput.trim() && !isAdjusting) {
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(198,166,247,0.3)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {"\u27A1"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

// ─── Chat bubble component ───
function ChatBubble({ message }: { message: ChatMessage }): JSX.Element {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "12px 16px",
          fontSize: 13,
          lineHeight: "20px",
          fontFamily: "'General Sans Variable', 'Segoe UI', system-ui, sans-serif",
          background: isUser
            ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`
            : "rgba(43,20,76,0.4)",
          color: isUser ? "#fff" : "rgba(237,237,237,0.85)",
          border: isUser ? "none" : "1px solid rgba(237,237,237,0.08)",
          opacity: message.isGenerating ? 0.7 : 1,
        }}
      >
        {message.isGenerating && (
          <span style={{ display: "inline-flex", gap: 4, marginRight: 6 }}>
            <span style={{ animation: "pulse 1.5s ease-in-out infinite", fontSize: 10 }}>{"\u25CF"}</span>
          </span>
        )}
        {message.content}
      </div>
    </div>
  );
}
