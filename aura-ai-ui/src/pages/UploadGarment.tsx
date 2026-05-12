import type { JSX } from "react";
import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GenerationFlow from "../components/GenerationFlow";
import AuraLogo from "../components/AuraLogo";
import SafeImage from "../components/SafeImage";

/** Convert a File to a base64 data-URL string */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadGarment(): JSX.Element {
  const nav = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the selected mode from Generation page
  const routeState = location.state as { selected?: string } | null;
  const selectedMode = routeState?.selected || "upload";

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = (selectedFiles: FileList | null): void => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (newFiles.length === 0) return;

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number): void => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileChange(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleContinue = async (): Promise<void> => {
    setIsConverting(true);
    try {
      // Convert first garment file to base64 for passing via router state
      const garmentBase64 = files[0] ? await fileToBase64(files[0]) : null;

      if (selectedMode === "generate") {
        // Go to Generate AI Model page with garment base64
        nav("/app/generate-ai-model", {
          state: {
            selected: "generate",
            garmentUploaded: true,
            garmentFiles: files.length,
            garmentPreview: previews[0] || null,
            garmentBase64,   // base64 data-URL for API call
          },
        });
      } else {
        // Go to Upload Your Model page (Try-On)
        nav("/app/upload-your-model", {
          state: {
            selected: "upload",
            garmentUploaded: true,
            garmentFiles: files.length,
            garmentPreview: previews[0] || null,
            garmentBase64,
          },
        });
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleSkip = (): void => {
    if (selectedMode === "generate") {
      nav("/app/generate-ai-model", {
        state: { selected: "generate", garmentUploaded: false, garmentPreview: null },
      });
    } else {
      nav("/app/upload-your-model", {
        state: { selected: "upload", garmentUploaded: false, garmentPreview: null },
      });
    }
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
      {/* ── HEADER ── */}
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
          <AuraLogo size={38} />
          <div>
            <span style={{ fontWeight: 600, fontSize: "18px", color: "#fff" }}>
              AURA AI
            </span>
            <div style={{ fontSize: "10px", color: "rgba(198,166,247,0.6)", letterSpacing: "0.04em" }}>
              {selectedMode === "generate" ? "AI Generation" : "Virtual Try-On"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => nav("/app/generation")}
            style={{
              border: "1px solid rgba(237,237,237,0.14)",
              background: "transparent",
              color: "#EDEDED",
              borderRadius: "8px",
              padding: "9px 16px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            ← Back
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
            &#x1F464;
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR - Generation Flow with Step 2 glowing */}
        <GenerationFlow activeStep={2} />

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
              maxWidth: "900px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              margin: "0 auto",
            }}
          >
            {/* Title Section */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6B46C1, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  👕
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: "36px",
                  }}
                >
                  Upload Your Garment
                </h1>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: "1.5",
                }}
              >
                Upload the clothing item you want to try on the model. You can drag and drop or click to browse. Supports JPG, PNG, and WEBP.
              </p>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                minHeight: previews.length > 0 ? "auto" : "300px",
                borderRadius: "16px",
                border: isDragging
                  ? "2px solid rgba(139, 92, 246, 0.7)"
                  : "2px dashed rgba(198, 166, 247, 0.35)",
                background: isDragging
                  ? "rgba(139, 92, 246, 0.12)"
                  : "rgba(43, 20, 76, 0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: previews.length > 0 ? "24px" : "40px 20px",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                boxShadow: isDragging
                  ? "0 0 24px rgba(139, 92, 246, 0.2)"
                  : "none",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => handleFileChange(e.target.files)}
                style={{ display: "none" }}
              />

              {previews.length === 0 ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6B46C1, #8B5CF6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                      margin: "0 auto 20px",
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    📤
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#fff",
                      marginBottom: "8px",
                    }}
                  >
                    {isDragging ? "Drop your images here" : "Drag & drop your garment here"}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: "16px",
                    }}
                  >
                    or click to browse
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "rgba(139, 92, 246, 0.15)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      fontSize: "13px",
                      color: "#C4B5FD",
                    }}
                  >
                    JPG, PNG, WEBP supported
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {previews.map((src, index) => (
                    <div
                      key={src}
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid rgba(139, 92, 246, 0.25)",
                        background: "#1A1A2A",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = "1px solid rgba(139, 92, 246, 0.5)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = "1px solid rgba(139, 92, 246, 0.25)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <SafeImage
                        src={src}
                        alt={`Garment ${index + 1}`}
                        fallbackIcon="👕"
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          padding: "10px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#C4B5FD",
                            fontWeight: 500,
                          }}
                        >
                          Garment {index + 1}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            border: "none",
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#EF4444",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.35)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add more button */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{
                      minHeight: "180px",
                      borderRadius: "12px",
                      border: "2px dashed rgba(139, 92, 246, 0.3)",
                      background: "rgba(139, 92, 246, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      gap: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = "2px dashed rgba(139, 92, 246, 0.5)";
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = "2px dashed rgba(139, 92, 246, 0.3)";
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.06)";
                    }}
                  >
                    <span style={{ fontSize: "24px", color: "#A78BFA" }}>+</span>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      Add more
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Garment info */}
            {files.length > 0 && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "10px",
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  fontSize: "13px",
                  color: "#C4B5FD",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>✓</span>
                <span>
                  {files.length} garment{files.length > 1 ? "s" : ""} uploaded — Ready to continue
                </span>
              </div>
            )}

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "14px",
                paddingBottom: "24px",
              }}
            >
              <button
                onClick={handleSkip}
                style={{
                  height: "48px",
                  padding: "0 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }}
              >
                Skip for now
              </button>

              <button
                onClick={handleContinue}
                disabled={isConverting || files.length === 0}
                style={{
                  height: "48px",
                  padding: "0 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "10px",
                  border: "none",
                  background: files.length > 0 && !isConverting
                    ? "linear-gradient(135deg, #6B46C1, #8B5CF6)"
                    : "rgba(255,255,255,0.08)",
                  color: files.length > 0 ? "#fff" : "rgba(255,255,255,0.3)",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: files.length > 0 && !isConverting ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  boxShadow: files.length > 0 && !isConverting
                    ? "0 4px 20px rgba(139, 92, 246, 0.35)"
                    : "none",
                  opacity: isConverting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (files.length > 0) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #7C4DCF, #9D6FF2)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 28px rgba(139, 92, 246, 0.5)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (files.length > 0) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #6B46C1, #8B5CF6)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(139, 92, 246, 0.35)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {isConverting ? "Preparing..." : "Continue to Generate"}
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
