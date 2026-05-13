import type { JSX } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GenerationFlow from "../components/GenerationFlow";
import AuraLogo from "../components/AuraLogo";
import SafeImage, { isValidBase64Image } from "../components/SafeImage";
import { getUser } from "../components/localAuth";
import { getImage } from "../utils/imageStore";
import { API_URL, fetchWithRetry, fetchGeneration, validateAndBuildImageUrl } from "../utils/apiClient";

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

// ─── Main component ───
export default function GenerationResult(): JSX.Element {
  const nav = useNavigate();
  const location = useLocation();
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [savingToBackend, setSavingToBackend] = useState(false);
  const [backendSaveStatus, setBackendSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Garment upload states
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const [_garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [garmentBase64, setGarmentBase64] = useState<string | null>(null);
  const [garmentDragging, setGarmentDragging] = useState(false);

  // Prompt for generating with garment
  const [garmentPrompt, setGarmentPrompt] = useState("");
  const [isGeneratingWithGarment, setIsGeneratingWithGarment] = useState(false);
  const [garmentError, setGarmentError] = useState("");

  // Result of garment generation
  const [garmentResultImage, setGarmentResultImage] = useState<string | null>(null);
  const [garmentResultImageId, setGarmentResultImageId] = useState<string | null>(null);

  // Get the generated image from navigation state
  const state = location.state as {
    generatedImageKey?: string;
    method?: string;
    title?: string;
    frontImageId?: string;
    groupId?: string;
    // Model attributes passed from GenerateAiModel for re-generation
    gender?: string;
    ageRange?: string;
    ethnicity?: string;
    bodyType?: string;
    clothingStyle?: string;
    pose?: string;
    prompt?: string;
    // Legacy support: direct image data
    generatedImage?: string;
  } | null;

  // Retrieve images from ImageStore using keys, with fallback to direct data
  const generatedImage = getImage(state?.generatedImageKey) || state?.generatedImage || null;

  // Validate images
  const validGeneratedImage = isValidBase64Image(generatedImage) ? generatedImage : null;

  // The main display image is the generated image (front view only)
  const mainImage = validGeneratedImage;

  const method = state?.method || "AI Generation";
  const title = state?.title || "AI Generated Model";
  const frontImageId = state?.frontImageId;
  const groupId = state?.groupId;

  // Model attributes from previous step
  const modelGender = state?.gender || "Female";
  const modelAgeRange = state?.ageRange || "20 - 25 years";
  const modelEthnicity = state?.ethnicity || "Arab";
  const modelBodyType = state?.bodyType || "Slim";
  const modelClothingStyle = state?.clothingStyle || "Modern Elegant";
  const modelPose = state?.pose || "Standing Straight";

  // Get current user for scoped storage
  const currentUser = getUser();
  const userKey = currentUser
    ? `aura_generation_history_${currentUser.email}`
    : "aura_generation_history_guest";

  // ── Garment upload handlers ──
  const handleGarmentFile = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    setGarmentFile(file);
    const blobUrl = URL.createObjectURL(file);
    setGarmentPreview(blobUrl);
    const reader = new FileReader();
    reader.onload = () => setGarmentBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGarmentDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setGarmentDragging(true);
  }, []);

  const handleGarmentDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setGarmentDragging(false);
  }, []);

  const handleGarmentDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setGarmentDragging(false);
    handleGarmentFile(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeGarment = (): void => {
    if (garmentPreview && garmentPreview.startsWith("blob:")) URL.revokeObjectURL(garmentPreview);
    setGarmentFile(null);
    setGarmentPreview(null);
    setGarmentBase64(null);
  };

  // ── Generate with garment + prompt ──
  async function handleGenerateWithGarment(): Promise<void> {
    if (!garmentBase64) {
      setGarmentError("Please upload a garment image first.");
      return;
    }

    try {
      setIsGeneratingWithGarment(true);
      setGarmentError("");

      const token = localStorage.getItem("token");

      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      }

      // Build the prompt with user's custom prompt + garment reference
      const customPrompt = garmentPrompt.trim() || "wearing the uploaded garment";
      const fullPrompt = `${customPrompt}, front view facing camera, full body shot, wearing the uploaded garment`;

      const requestBody = {
        gender: modelGender,
        ageRange: modelAgeRange,
        ethnicity: modelEthnicity,
        bodyType: modelBodyType,
        clothingStyle: modelClothingStyle,
        pose: modelPose,
        prompt: fullPrompt,
        garmentImage: garmentBase64,
        // Pass the base image (previously generated model) for reference
        baseImage: mainImage,
        // Pass the baseImageId so the backend can link generations
        baseImageId: frontImageId,
        // Pass the user's custom prompt separately for storage
        userPrompt: garmentPrompt.trim(),
        groupId,
      };

      const data = await fetchGeneration("/api/models/generate-with-garment", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(requestBody),
      });

      const resultImageUrl = validateAndBuildImageUrl(data as Record<string, unknown>, "garment try-on");
      const resultImageId = (data as Record<string, unknown>).imageId as string;

      setGarmentResultImage(resultImageUrl);
      setGarmentResultImageId(resultImageId);
    } catch (err) {
      setGarmentError(err instanceof Error ? err.message : "Generation with garment failed");
    } finally {
      setIsGeneratingWithGarment(false);
    }
  }

  // ─── Save to user-scoped localStorage ───
  useEffect(() => {
    const imageToSave = garmentResultImage || mainImage;
    if (imageToSave && !savedToHistory) {
      try {
        const existing = localStorage.getItem(userKey);
        const history = existing ? JSON.parse(existing) : [];

        const newEntry = {
          id: Date.now().toString(),
          image: imageToSave,
          method: garmentResultImage ? "AI Generation + Garment" : method,
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
  }, [garmentResultImage, mainImage, method, title, savedToHistory, userKey, currentUser]);

  // ─── Save to backend for the logged-in user ───
  const saveToBackend = useCallback(async (): Promise<void> => {
    const imageToSave = garmentResultImage || mainImage;
    if (!imageToSave || backendSaveStatus === "success") return;

    // If we have generation IDs from the backend, the images are already saved in DB
    if (frontImageId || garmentResultImageId) {
      setBackendSaveStatus("success");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSavingToBackend(true);

      if (imageToSave.startsWith("http")) {
        setBackendSaveStatus("success");
        return;
      }

      const base64Match = imageToSave.match(/^data:[^;]+;base64,(.+)$/);
      if (!base64Match) return;

      const imageBase64Data = base64Match[1];
      const mimeType = imageToSave.match(/^data:([^;]+);/)?.[1] || "image/png";

      await fetchWithRetry(`${API_URL}/api/models/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          method: garmentResultImage ? "AI Generation + Garment" : method,
          imageBase64: imageBase64Data,
          mimeType,
          prompt: `AI Generation - ${method}`,
        }),
      }, 30000, 2);

      setBackendSaveStatus("success");
    } catch {
      setBackendSaveStatus("error");
    } finally {
      setSavingToBackend(false);
    }
  }, [garmentResultImage, mainImage, method, title, backendSaveStatus, frontImageId, garmentResultImageId]);

  // Auto-save to backend when image arrives
  useEffect(() => {
    const imageToSave = garmentResultImage || mainImage;
    if (imageToSave && backendSaveStatus === "idle") {
      saveToBackend();
    }
  }, [garmentResultImage, mainImage, backendSaveStatus, saveToBackend]);

  // ─── Download handlers ───
  const handleDownload = async (imageUrl?: string | null): Promise<void> => {
    const imageToDownload = imageUrl || garmentResultImage || mainImage;
    if (!imageToDownload) return;
    try {
      if (imageToDownload.startsWith("http")) {
        const response = await fetch(imageToDownload);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `aura-ai-model-front-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        const link = document.createElement("a");
        link.href = imageToDownload;
        link.download = `aura-ai-model-front-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      window.open(imageToDownload, "_blank");
    }
  };

  // The final display image: garment result takes priority if available
  const displayImage = garmentResultImage || mainImage;

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

          <div style={{ maxWidth: 1200, position: "relative", zIndex: 1 }}>
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
                    {garmentResultImage ? "Generation Complete with Garment" : "Generation Complete"}
                  </h1>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "rgba(237,237,237,0.6)",
                      fontSize: 14,
                      lineHeight: "20px",
                    }}
                  >
                    {garmentResultImage
                      ? "Your AI model has been generated with the garment successfully."
                      : "Your AI model has been generated. Upload a garment and add a prompt to try it on."}
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

            {/* ─── MAIN CONTENT GRID ─── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
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
                {displayImage ? (
                  <>
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
                      }}
                    >
                      {"\u{1F464}"} Front View
                    </div>

                    {/* Show both images side by side if garment result exists */}
                    {garmentResultImage && mainImage ? (
                      <div style={{ display: "flex", gap: 20, width: "100%", justifyContent: "center" }}>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "rgba(237,237,237,0.5)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
                            Original Model
                          </div>
                          <SafeImage
                            src={mainImage}
                            alt="Original generated model"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "400px",
                              objectFit: "contain",
                              borderRadius: 12,
                              opacity: 0.7,
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: COLORS.secondary, marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
                            With Garment
                          </div>
                          <SafeImage
                            src={garmentResultImage}
                            alt="Model with garment"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "400px",
                              objectFit: "contain",
                              borderRadius: 12,
                              border: "1px solid rgba(198,166,247,0.3)",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <SafeImage
                        src={displayImage}
                        alt="Generated model - front view"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "440px",
                          objectFit: "contain",
                          borderRadius: 12,
                          transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
                        }}
                      />
                    )}

                    <div
                      style={{
                        marginTop: 20,
                        fontSize: 13,
                        color: "rgba(237,237,237,0.5)",
                        textAlign: "center",
                      }}
                    >
                      Viewing from the{" "}
                      <span style={{ color: COLORS.secondary, fontWeight: 600 }}>
                        front
                      </span>{" "}
                      angle
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "rgba(237,237,237,0.5)",
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F5BC}\uFE0F"}</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>No image found</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>Please generate a model first</div>
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

              {/* RIGHT - Info panel + Garment Upload + Prompt */}
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

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <DetailRow label="Method" value={garmentResultImage ? "AI Generation + Garment" : method} />
                    <DetailRow label="Title" value={title} />
                    <DetailRow label="Direction" value="Front" highlight />
                    <DetailRow label="Quality" value="High (4K)" green />
                    <DetailRow label="Status" value="Complete" green />
                    <DetailRow label="Owner" value={currentUser?.email || "Guest"} />
                  </div>
                </div>

                {/* ─── GARMENT UPLOAD SECTION ─── */}
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
                    {"\u{1F455}"} Upload Garment
                  </div>

                  {garmentPreview ? (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <SafeImage
                        src={garmentPreview}
                        alt="Uploaded garment"
                        fallbackIcon={"\u{1F455}"}
                        style={{
                          width: "140px",
                          height: "140px",
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid rgba(198,166,247,0.3)",
                        }}
                      />
                      <button
                        onClick={removeGarment}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(239,68,68,0.8)",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {"\u2715"}
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleGarmentDragOver}
                      onDragLeave={handleGarmentDragLeave}
                      onDrop={handleGarmentDrop}
                      onClick={() => garmentInputRef.current?.click()}
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 12,
                        border: "2px dashed rgba(198,166,247,0.3)",
                        background: garmentDragging ? "rgba(139,92,246,0.15)" : "rgba(43,20,76,0.15)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        gap: 6,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <input
                        ref={garmentInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleGarmentFile(e.target.files)}
                        style={{ display: "none" }}
                      />
                      <span style={{ fontSize: 24, color: "rgba(198,166,247,0.5)" }}>+</span>
                      <span style={{ fontSize: 12, color: "rgba(237,237,237,0.5)" }}>
                        Drag & drop or click to upload garment
                      </span>
                    </div>
                  )}

                  {/* ─── PROMPT TEXT AREA ─── */}
                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "rgba(237,237,237,0.6)",
                        marginBottom: 8,
                        textTransform: "uppercase",
                      }}
                    >
                      {"\u270E"} Custom Prompt (Optional)
                    </div>
                    <textarea
                      value={garmentPrompt}
                      onChange={(e) => setGarmentPrompt(e.target.value)}
                      placeholder="Describe how the garment should look on the model, e.g. 'Wearing this elegant dress with a matching belt, standing confidently in a studio setting'..."
                      style={{
                        width: "100%",
                        height: 80,
                        resize: "none",
                        borderRadius: 10,
                        border: "1px solid rgba(237,237,237,0.12)",
                        background: "rgba(43,20,76,0.35)",
                        color: COLORS.platinum,
                        padding: "12px",
                        boxSizing: "border-box",
                        outline: "none",
                        fontSize: 13,
                        lineHeight: "18px",
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
                  </div>

                  {/* Generate with garment button */}
                  <button
                    onClick={handleGenerateWithGarment}
                    disabled={!garmentBase64 || isGeneratingWithGarment}
                    style={{
                      width: "100%",
                      height: 48,
                      marginTop: 16,
                      borderRadius: 10,
                      border: "none",
                      background: garmentBase64
                        ? `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`
                        : "rgba(43,20,76,0.3)",
                      color: garmentBase64 ? "#fff" : "rgba(237,237,237,0.4)",
                      cursor: garmentBase64 && !isGeneratingWithGarment ? "pointer" : "not-allowed",
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: FONTS.primary,
                      boxShadow: garmentBase64 ? "0 8px 32px rgba(198,166,247,0.25)" : "none",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: isGeneratingWithGarment ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (garmentBase64 && !isGeneratingWithGarment) {
                        e.currentTarget.style.boxShadow = "0 12px 48px rgba(198,166,247,0.35)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = garmentBase64 ? "0 8px 32px rgba(198,166,247,0.25)" : "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {isGeneratingWithGarment ? "Generating with Garment..." : "\u{1F455} Generate with Garment"}
                  </button>

                  {garmentError && (
                    <div
                      style={{
                        marginTop: 10,
                        color: COLORS.error,
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: FONTS.secondary,
                      }}
                    >
                      {garmentError}
                    </div>
                  )}
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
                    onClick={() => handleDownload()}
                    disabled={!displayImage}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      border: "1px solid rgba(198,166,247,0.3)",
                      background: "rgba(198,166,247,0.15)",
                      color: COLORS.platinum,
                      cursor: displayImage ? "pointer" : "not-allowed",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: FONTS.primary,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: displayImage ? 1 : 0.45,
                    }}
                    onMouseEnter={(e) => {
                      if (displayImage) {
                        e.currentTarget.style.background = "rgba(198,166,247,0.25)";
                        e.currentTarget.style.borderColor = COLORS.secondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (displayImage) {
                        e.currentTarget.style.background = "rgba(198,166,247,0.15)";
                        e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
                      }
                    }}
                  >
                    {"\u2B07"} Download Image
                  </button>

                  {garmentResultImage && (
                    <button
                      onClick={() => handleDownload(garmentResultImage)}
                      style={{
                        height: 48,
                        borderRadius: 10,
                        border: "none",
                        background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: FONTS.primary,
                        boxShadow: "0 8px 32px rgba(198,166,247,0.25)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 12px 48px rgba(198,166,247,0.35)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(198,166,247,0.25)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {"\u2B07"} Download Garment Result
                    </button>
                  )}

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
                          e.currentTarget.style.background = "rgba(255,123,123,0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,123,123,0.1)";
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
            : "rgba(237,237,237,0.8)",
          fontSize: 12,
          fontWeight: props.highlight ? 600 : 500,
        }}
      >
        {props.value}
      </span>
    </div>
  );
}
