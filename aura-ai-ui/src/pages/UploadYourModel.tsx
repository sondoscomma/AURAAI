import type { JSX } from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GenerationFlow from "../components/GenerationFlow";
import AuraLogo from "../components/AuraLogo";
import SafeImage, { isValidBase64Image } from "../components/SafeImage";
import { storeImage } from "../utils/imageStore";

const API_URL = "https://auraai-backend-6a8n.onrender.com";

export default function UploadYourModel(): JSX.Element {
  const nav = useNavigate();
  const personInputRef = useRef<HTMLInputElement | null>(null);
  const garmentInputRef = useRef<HTMLInputElement | null>(null);

  // Person image state
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [isDraggingPerson, setIsDraggingPerson] = useState(false);

  // Garment image state
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [isDraggingGarment, setIsDraggingGarment] = useState(false);

  // Generation state
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [rightImage, setRightImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showResultButton, setShowResultButton] = useState(false);

  // Save to history when both results are generated
  useEffect(() => {
    if (frontImage && rightImage) {
      try {
        const historyKey = "aura_generation_history";
        const existing = localStorage.getItem(historyKey);
        const history = existing ? JSON.parse(existing) : [];

        const newEntry = {
          id: Date.now().toString(),
          image: frontImage,
          method: "Virtual Try-On (2 Views)",
          title: "Virtual Try-On Result",
          createdAt: new Date().toISOString(),
          type: "tryon",
        };

        localStorage.setItem(
          historyKey,
          JSON.stringify([newEntry, ...history])
        );
      } catch {
        // Silently fail
      }
    }
  }, [frontImage, rightImage]);

  // ─── Person upload handlers ───
  const handlePersonFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;

    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setFrontImage(null);
    setRightImage(null);
    setShowResultButton(false);
    setError("");
  };

  const handleDragOverPerson = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPerson(true);
  }, []);

  const handleDragLeavePerson = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPerson(false);
  }, []);

  const handleDropPerson = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPerson(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(file));
      setFrontImage(null);
      setRightImage(null);
      setShowResultButton(false);
      setError("");
    }
  }, []);

  // ─── Garment upload handlers ───
  const handleGarmentFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;

    setGarmentFile(file);
    setGarmentPreview(URL.createObjectURL(file));
    setFrontImage(null);
    setRightImage(null);
    setShowResultButton(false);
    setError("");
  };

  const handleDragOverGarment = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGarment(true);
  }, []);

  const handleDragLeaveGarment = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGarment(false);
  }, []);

  const handleDropGarment = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGarment(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setGarmentFile(file);
      setGarmentPreview(URL.createObjectURL(file));
      setFrontImage(null);
      setRightImage(null);
      setShowResultButton(false);
      setError("");
    }
  }, []);

  // ─── Generate a single view ───
  async function generateView(
    viewPrompt: string,
    viewLabel: "front" | "right"
  ): Promise<string> {
    const formData = new FormData();
    formData.append("images", personFile!);
    formData.append("images", garmentFile!);
    formData.append("prompt", viewPrompt);

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/tryon/generate`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `${viewLabel} view generation failed.`);
    }

    // Validate base64 data before constructing data URL
    if (!data.imageBase64 || typeof data.imageBase64 !== "string" || data.imageBase64.length < 100) {
      throw new Error(`Received invalid image data from server for ${viewLabel} view`);
    }

    const mimeType = data.mimeType || "image/png";
    return `data:${mimeType};base64,${data.imageBase64}`;
  }

  // ─── Generate both views ───
  async function handleGenerate(): Promise<void> {
    try {
      if (!personFile || !garmentFile) {
        setError("Please upload both a person image and a garment image.");
        return;
      }

      setIsGenerating(true);
      setError("");
      setFrontImage(null);
      setRightImage(null);
      setShowResultButton(false);

      const frontPrompt =
        "Create a realistic virtual try-on image showing the FRONT view. Use the person from the uploaded images and dress them with the clothing from the reference images. The model must face the camera directly, showing the full front of the outfit. Keep the face, body shape, pose, lighting, and background realistic. Make the final image clean, fashionable, and suitable for an e-commerce fashion platform.";

      const rightPrompt =
        "Create a realistic virtual try-on image showing the RIGHT SIDE profile view. Use the person from the uploaded images and dress them with the clothing from the reference images. The model must face to the right, showing the right side profile of the outfit. Keep the face, body shape, pose, lighting, and background realistic. Make the final image clean, fashionable, and suitable for an e-commerce fashion platform.";

      // Generate views sequentially to avoid API overload/corruption
      const front = await generateView(frontPrompt, "front");
      const right = await generateView(rightPrompt, "right");

      if (!isValidBase64Image(front) || !isValidBase64Image(right)) {
        throw new Error("Generated image data is invalid or corrupted");
      }

      setFrontImage(front);
      setRightImage(right);
      setShowResultButton(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try-on generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadResult(image: string | null, filename: string): void {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = filename;
    link.click();
  }

  // Determine which step is active based on generation state
  const activeStep = showResultButton ? 4 : 3;

  const bothUploaded = !!(personFile && garmentFile);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#0d0d0d",
        color: "#EDEDED",
        fontFamily: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <header
        style={{
          height: "65px",
          background: "#161616",
          borderBottom: "1px solid rgba(83,44,134,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <AuraLogo size={38} />
          <div>
            <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.04em" }}>
              AURA AI
            </span>
            <div style={{ fontSize: "10px", color: "rgba(198,166,247,0.6)", letterSpacing: "0.04em" }}>
              Virtual Try-On
            </div>
          </div>
        </div>

        <button
          onClick={() => nav("/app/generation")}
          style={{
            border: "1px solid rgba(237,237,237,0.14)",
            background: "transparent",
            color: "#EDEDED",
            borderRadius: "8px",
            padding: "9px 16px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR - Generation Flow with dynamic step */}
        <GenerationFlow activeStep={activeStep} />

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            background: "linear-gradient(155deg, #2B144C 0%, #1c0a40 52%, #532C86 100%)",
            padding: "32px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {/* Page title */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #C6A6F7, #532C86)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  👗
                </div>
                <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
                  AI Virtual Try-On
                </h1>
              </div>
              <p
                style={{
                  margin: 0,
                  color: "rgba(237,237,237,0.55)",
                  fontSize: "14px",
                  lineHeight: "22px",
                }}
              >
                Upload a person image and a garment image separately. AURA AI will generate a realistic try-on result.
              </p>
            </div>

            {/* TWO UPLOAD BOXES */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* PERSON UPLOAD BOX */}
              <section
                style={{
                  border: "1px solid rgba(237,237,237,0.16)",
                  background: "#161616",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #6B46C1, #8B5CF6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Person Image</h2>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(237,237,237,0.45)" }}>
                      Full-body photo of the model
                    </p>
                  </div>
                  {personPreview && (
                    <div
                      style={{
                        marginLeft: "auto",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "rgba(16,185,129,0.15)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        fontSize: "11px",
                        color: "#6EE7B7",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Uploaded
                    </div>
                  )}
                </div>

                <input
                  ref={personInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePersonFileChange}
                  style={{ display: "none" }}
                />

                <div
                  onClick={() => personInputRef.current?.click()}
                  onDragOver={handleDragOverPerson}
                  onDragLeave={handleDragLeavePerson}
                  onDrop={handleDropPerson}
                  style={{
                    minHeight: personPreview ? "auto" : "240px",
                    borderRadius: "14px",
                    border: isDraggingPerson
                      ? "1.5px solid rgba(139, 92, 246, 0.7)"
                      : personPreview
                      ? "1px solid rgba(139, 92, 246, 0.3)"
                      : "1.5px dashed rgba(198, 166, 247, 0.45)",
                    background: isDraggingPerson
                      ? "rgba(139, 92, 246, 0.1)"
                      : personPreview
                      ? "rgba(43, 20, 76, 0.15)"
                      : "linear-gradient(135deg, rgba(83,44,134,0.16), rgba(198,166,247,0.08))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: personPreview ? "16px" : "20px",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                  }}
                >
                  {personPreview ? (
                    <div style={{ width: "100%", position: "relative" }}>
                      <SafeImage
                        src={personPreview}
                        alt="Person preview"
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "contain",
                          borderRadius: "10px",
                        }}
                        fallbackIcon="👤"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPersonFile(null);
                          setPersonPreview(null);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "none",
                          background: "rgba(239, 68, 68, 0.25)",
                          color: "#EF4444",
                          cursor: "pointer",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "16px",
                          margin: "0 auto",
                          background: "linear-gradient(135deg, #532C86, #2B144C)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                        }}
                      >
                        👤
                      </div>
                      <div style={{ marginTop: "14px", fontSize: "16px", fontWeight: 600 }}>
                        {isDraggingPerson ? "Drop person image" : "Upload Person Image"}
                      </div>
                      <div style={{ color: "rgba(237,237,237,0.45)", fontSize: "12px", marginTop: "6px" }}>
                        Drag & drop or click to browse
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "rgba(139, 92, 246, 0.12)",
                          border: "1px solid rgba(139, 92, 246, 0.25)",
                          fontSize: "11px",
                          color: "#C4B5FD",
                          marginTop: "10px",
                        }}
                      >
                        JPG, PNG, WEBP
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* GARMENT UPLOAD BOX */}
              <section
                style={{
                  border: "1px solid rgba(237,237,237,0.16)",
                  background: "#161616",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #6B46C1, #8B5CF6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    👕
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Garment Image</h2>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(237,237,237,0.45)" }}>
                      Clothing item to try on
                    </p>
                  </div>
                  {garmentPreview && (
                    <div
                      style={{
                        marginLeft: "auto",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "rgba(16,185,129,0.15)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        fontSize: "11px",
                        color: "#6EE7B7",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Uploaded
                    </div>
                  )}
                </div>

                <input
                  ref={garmentInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleGarmentFileChange}
                  style={{ display: "none" }}
                />

                <div
                  onClick={() => garmentInputRef.current?.click()}
                  onDragOver={handleDragOverGarment}
                  onDragLeave={handleDragLeaveGarment}
                  onDrop={handleDropGarment}
                  style={{
                    minHeight: garmentPreview ? "auto" : "240px",
                    borderRadius: "14px",
                    border: isDraggingGarment
                      ? "1.5px solid rgba(139, 92, 246, 0.7)"
                      : garmentPreview
                      ? "1px solid rgba(139, 92, 246, 0.3)"
                      : "1.5px dashed rgba(198, 166, 247, 0.45)",
                    background: isDraggingGarment
                      ? "rgba(139, 92, 246, 0.1)"
                      : garmentPreview
                      ? "rgba(43, 20, 76, 0.15)"
                      : "linear-gradient(135deg, rgba(83,44,134,0.16), rgba(198,166,247,0.08))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: garmentPreview ? "16px" : "20px",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                  }}
                >
                  {garmentPreview ? (
                    <div style={{ width: "100%", position: "relative" }}>
                      <SafeImage
                        src={garmentPreview}
                        alt="Garment preview"
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "contain",
                          borderRadius: "10px",
                        }}
                        fallbackIcon="👕"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGarmentFile(null);
                          setGarmentPreview(null);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "none",
                          background: "rgba(239, 68, 68, 0.25)",
                          color: "#EF4444",
                          cursor: "pointer",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "16px",
                          margin: "0 auto",
                          background: "linear-gradient(135deg, #532C86, #2B144C)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                        }}
                      >
                        👕
                      </div>
                      <div style={{ marginTop: "14px", fontSize: "16px", fontWeight: 600 }}>
                        {isDraggingGarment ? "Drop garment image" : "Upload Garment Image"}
                      </div>
                      <div style={{ color: "rgba(237,237,237,0.45)", fontSize: "12px", marginTop: "6px" }}>
                        Drag & drop or click to browse
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "rgba(139, 92, 246, 0.12)",
                          border: "1px solid rgba(139, 92, 246, 0.25)",
                          fontSize: "11px",
                          color: "#C4B5FD",
                          marginTop: "10px",
                        }}
                      >
                        JPG, PNG, WEBP
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Info + Error */}
            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(83,44,134,0.18)",
                color: "#C6A6F7",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              Generates 2 views: FRONT view and RIGHT SIDE profile view. Both images will be generated sequentially for reliability.
            </div>

            {error && (
              <div style={{ marginBottom: "16px", color: "#ff7b7b", fontSize: "13px" }}>
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !bothUploaded}
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "10px",
                border: "none",
                background: bothUploaded
                  ? "linear-gradient(135deg, #C6A6F7, #532C86)"
                  : "rgba(255,255,255,0.08)",
                color: bothUploaded ? "#fff" : "rgba(255,255,255,0.3)",
                cursor: bothUploaded && !isGenerating ? "pointer" : "not-allowed",
                opacity: isGenerating ? 0.65 : 1,
                fontSize: "16px",
                fontWeight: 700,
                transition: "all 0.3s ease",
                boxShadow: bothUploaded ? "0 4px 20px rgba(139, 92, 246, 0.35)" : "none",
              }}
              onMouseEnter={(e) => {
                if (bothUploaded && !isGenerating) {
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(198,166,247,0.45)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (bothUploaded) {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isGenerating ? "Generating Try-On (2 Views)..." : "Generate Try-On (2 Views)"}
            </button>

            {/* RESULT SECTION */}
            {(frontImage || rightImage) && (
              <section
                style={{
                  marginTop: "28px",
                  border: "1px solid rgba(237,237,237,0.16)",
                  background: "#161616",
                  borderRadius: "16px",
                  padding: "28px",
                }}
              >
                <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700 }}>
                  Generated Results (2 Views)
                </h2>
                <p
                  style={{
                    margin: "0 0 20px",
                    color: "rgba(237,237,237,0.6)",
                    fontSize: "13px",
                  }}
                >
                  Your AI try-on images have been generated. Front view and right side view.
                </p>

                {/* TWO VIEW IMAGES */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "20px",
                  }}
                >
                  {/* FRONT VIEW */}
                  <div
                    style={{
                      borderRadius: "14px",
                      background: "rgba(43,20,76,0.25)",
                      border: "1px solid rgba(237,237,237,0.12)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "260px",
                      position: "relative",
                    }}
                  >
                    {frontImage ? (
                      <SafeImage
                        src={frontImage}
                        alt="Front view try-on"
                        style={{
                          width: "100%",
                          maxHeight: "350px",
                          objectFit: "contain",
                        }}
                        fallbackIcon="Front"
                      />
                    ) : (
                      <div style={{ color: "rgba(237,237,237,0.4)", fontSize: "13px" }}>
                        Generating front view...
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "rgba(83,44,134,0.7)",
                        border: "1px solid rgba(198,166,247,0.3)",
                        fontSize: 11,
                        color: "#C6A6F7",
                        fontWeight: 600,
                      }}
                    >
                      Front View
                    </div>
                  </div>

                  {/* RIGHT VIEW */}
                  <div
                    style={{
                      borderRadius: "14px",
                      background: "rgba(43,20,76,0.25)",
                      border: "1px solid rgba(237,237,237,0.12)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "260px",
                      position: "relative",
                    }}
                  >
                    {rightImage ? (
                      <SafeImage
                        src={rightImage}
                        alt="Right side view try-on"
                        style={{
                          width: "100%",
                          maxHeight: "350px",
                          objectFit: "contain",
                        }}
                        fallbackIcon="Right"
                      />
                    ) : (
                      <div style={{ color: "rgba(237,237,237,0.4)", fontSize: "13px" }}>
                        Generating right view...
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "rgba(83,44,134,0.7)",
                        border: "1px solid rgba(198,166,247,0.3)",
                        fontSize: 11,
                        color: "#C6A6F7",
                        fontWeight: 600,
                      }}
                    >
                      Right View
                    </div>
                  </div>
                </div>

                {/* Result action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => downloadResult(frontImage, "aura-tryon-front.png")}
                    style={{
                      height: 48,
                      padding: "0 24px",
                      borderRadius: 10,
                      border: "1px solid rgba(198,166,247,0.3)",
                      background: "rgba(198,166,247,0.15)",
                      color: "#EDEDED",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(198,166,247,0.25)";
                      e.currentTarget.style.borderColor = "#C6A6F7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(198,166,247,0.15)";
                      e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
                    }}
                  >
                    ⬇ Download Front
                  </button>

                  <button
                    onClick={() => downloadResult(rightImage, "aura-tryon-right.png")}
                    style={{
                      height: 48,
                      padding: "0 24px",
                      borderRadius: 10,
                      border: "1px solid rgba(198,166,247,0.3)",
                      background: "rgba(198,166,247,0.15)",
                      color: "#EDEDED",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(198,166,247,0.25)";
                      e.currentTarget.style.borderColor = "#C6A6F7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(198,166,247,0.15)";
                      e.currentTarget.style.borderColor = "rgba(198,166,247,0.3)";
                    }}
                  >
                    ⬇ Download Right
                  </button>

                  {showResultButton && (
                    <button
                      onClick={() => {
                        // Store images in memory and pass only keys via router state
                        const frontImageKey = frontImage ? storeImage(frontImage) : null;
                        const rightImageKey = rightImage ? storeImage(rightImage) : null;
                        const personPreviewKey = personPreview ? storeImage(personPreview) : null;
                        const garmentPreviewKey = garmentPreview ? storeImage(garmentPreview) : null;
                        nav("/app/tryon-result", {
                          state: {
                            frontImageKey,
                            rightImageKey,
                            personPreviewKey,
                            garmentPreviewKey,
                          },
                        });
                      }}
                      style={{
                        height: 48,
                        padding: "0 28px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #C6A6F7, #532C86)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        boxShadow: "0 4px 20px rgba(198,166,247,0.35)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(198,166,247,0.5)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(198,166,247,0.35)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      🎉 View Full Result
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
