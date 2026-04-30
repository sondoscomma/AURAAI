import type { JSX } from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://auraai-backend-6a8n.onrender.com";

export default function UploadYourModel(): JSX.Element {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const selectedFiles = Array.from(event.target.files || []);

    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
    setResultImage(null);
    setError("");
  }

  async function handleGenerate(): Promise<void> {
    try {
      if (files.length < 2) {
        setError("Upload at least 2 images: person image and clothing image.");
        return;
      }

      setIsGenerating(true);
      setError("");

      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const res = await fetch(`${API_URL}/api/tryon/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Try-on generation failed.");
      }

      setResultImage(`data:${data.mimeType};base64,${data.imageBase64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try-on generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadResult(): void {
    if (!resultImage) return;

    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "aura-try-on-result.png";
    link.click();
  }

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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #532C86, #2B144C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✎
          </div>

          <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.04em" }}>
            AURA AI
          </span>
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
          Back
        </button>
      </header>

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
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
          }}
        >
          <section
            style={{
              border: "1px solid rgba(237,237,237,0.16)",
              background: "#161616",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "26px" }}>AI Virtual Try-On</h1>

            <p
              style={{
                marginTop: "8px",
                color: "rgba(237,237,237,0.6)",
                fontFamily: "'General Sans', system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
              }}
            >
              Upload multiple images: one person/model image and one or more clothing reference images.
              AURA AI will generate a realistic try-on result.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: "24px",
                minHeight: "320px",
                borderRadius: "14px",
                border: "1.5px dashed rgba(198,166,247,0.45)",
                background:
                  "linear-gradient(135deg, rgba(83,44,134,0.16), rgba(198,166,247,0.08))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              {previews.length === 0 ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "76px",
                      height: "76px",
                      borderRadius: "22px",
                      margin: "0 auto",
                      background: "linear-gradient(135deg, #532C86, #2B144C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "34px",
                    }}
                  >
                    🖼️
                  </div>

                  <h2 style={{ margin: "18px 0 0", fontSize: "20px" }}>
                    Click to upload or drag images
                  </h2>

                  <p style={{ color: "rgba(237,237,237,0.55)", fontSize: "13px" }}>
                    JPEG, PNG, WEBP · Upload person + clothes images
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                  }}
                >
                  {previews.map((src, index) => (
                    <div
                      key={src}
                      style={{
                        height: "150px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#0d0d0d",
                        position: "relative",
                        border: "1px solid rgba(198,166,247,0.2)",
                      }}
                    >
                      <img
                        src={src}
                        alt={`Upload ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />

                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          borderRadius: "999px",
                          padding: "4px 9px",
                          fontSize: "11px",
                          color: "#C6A6F7",
                          background: "rgba(43,20,76,0.85)",
                        }}
                      >
                        Image {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(83,44,134,0.18)",
                color: "#C6A6F7",
                fontSize: "13px",
              }}
            >
              Fixed prompt: Make the person try on the uploaded clothes realistically.
            </div>

            {error && (
              <div style={{ marginTop: "14px", color: "#ff7b7b", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                marginTop: "22px",
                width: "100%",
                height: "52px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #C6A6F7, #532C86)",
                color: "#fff",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.65 : 1,
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {isGenerating ? "Generating Try-On..." : "Generate Try-On"}
            </button>
          </section>

          <section
            style={{
              border: "1px solid rgba(237,237,237,0.16)",
              background: "#161616",
              borderRadius: "16px",
              padding: "28px",
              minHeight: "620px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "24px" }}>Generated Result</h2>

            <p
              style={{
                marginTop: "8px",
                color: "rgba(237,237,237,0.6)",
                fontSize: "13px",
              }}
            >
              Your AI try-on image will appear here after generation.
            </p>

            <div
              style={{
                flex: 1,
                marginTop: "20px",
                borderRadius: "14px",
                background: "rgba(43,20,76,0.25)",
                border: "1px solid rgba(237,237,237,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              {resultImage ? (
                <img
                  src={resultImage}
                  alt="Generated try-on"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ color: "rgba(237,237,237,0.55)" }}>
                  {isGenerating ? "Creating your try-on image..." : "No result yet"}
                </div>
              )}
            </div>

            <button
              onClick={downloadResult}
              disabled={!resultImage}
              style={{
                marginTop: "20px",
                height: "48px",
                borderRadius: "8px",
                border: "1px solid rgba(198,166,247,0.35)",
                background: resultImage ? "rgba(83,44,134,0.35)" : "rgba(237,237,237,0.06)",
                color: "#EDEDED",
                cursor: resultImage ? "pointer" : "not-allowed",
                opacity: resultImage ? 1 : 0.45,
                fontWeight: 700,
              }}
            >
              Download Generated Image
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}