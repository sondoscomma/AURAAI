import type { JSX } from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadYourModel(): JSX.Element {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
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
      {/* HEADER */}
      <header
        style={{
          height: "65px",
          background: "#161616",
          borderBottom: "1px solid rgba(83,44,134,0.2)",
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

      {/* BODY */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          overflow: "hidden",
          padding: "0 40px",
          background: "#0d0d0d",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width: "320px",
            background: "#161616",
            borderRight: "1px solid rgba(83,44,134,0.2)",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "14px", lineHeight: "28px" }}>
            Generation Flow
          </h3>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Step id={1} title="Choose Model" subtitle="Completed" active={false} />
            <Step id={2} title="Upload Your Model" subtitle="Current step" active />
            <Step id={3} title="Upload Garment" subtitle="Next step" active={false} faded />
            <Step id={4} title="Generate & Customize" subtitle="Coming up" active={false} faded />
          </div>

          <div
            style={{
              marginTop: "24px",
              borderRadius: "8px",
              border: "1px solid rgba(83,44,134,0.2)",
              background: "rgba(83,44,134,0.1)",
              padding: "16px",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "14px" }}>Upload Instructions</h4>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "'General Sans', system-ui, sans-serif",
                fontSize: "12px",
                lineHeight: "1.7",
                color: "rgba(237,237,237,0.55)",
              }}
            >
              Upload a clear full-body image. Use JPG or PNG. Make sure the model is centered,
              visible, and standing in good lighting.
            </p>
          </div>
        </aside>

        {/* MAIN */}
        <main
          style={{
            background: "linear-gradient(155deg, #2B144C 0%, #1c0a40 52%, #532C86 100%)",
            padding: "32px",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: "896px", display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* TITLE */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(198,166,247,0.12)",
                  border: "1px solid rgba(198,166,247,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                ⬆
              </div>

              <div>
                <h1 style={{ margin: 0, fontSize: "22px", lineHeight: "28px" }}>
                  Upload Your Model
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontFamily: "'General Sans', system-ui, sans-serif",
                    fontSize: "13px",
                    color: "rgba(237,237,237,0.6)",
                  }}
                >
                  Upload a full-body model image to continue your virtual try-on flow.
                </p>
              </div>
            </div>

            {/* UPLOAD CARD */}
            <div
              style={{
                border: "1px solid rgba(237,237,237,0.16)",
                background: "#161616",
                borderRadius: "16px",
                padding: "32px",
                minHeight: "420px",
                boxSizing: "border-box",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  height: "300px",
                  borderRadius: "14px",
                  border: "1.5px dashed rgba(198,166,247,0.45)",
                  background:
                    "linear-gradient(135deg, rgba(83,44,134,0.16), rgba(198,166,247,0.08))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Uploaded model preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      background: "#0d0d0d",
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", maxWidth: "360px" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "18px",
                        margin: "0 auto",
                        background: "linear-gradient(135deg, #532C86, #2B144C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                      }}
                    >
                      ⬆
                    </div>

                    <h2 style={{ margin: "18px 0 0", fontSize: "20px" }}>
                      Click to upload model image
                    </h2>

                    <p
                      style={{
                        margin: "8px 0 0",
                        fontFamily: "'General Sans', system-ui, sans-serif",
                        fontSize: "13px",
                        lineHeight: "22px",
                        color: "rgba(237,237,237,0.55)",
                      }}
                    >
                      Upload a JPG or PNG image. Full-body photos give the best result.
                    </p>
                  </div>
                )}
              </div>

              {fileName && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(83,44,134,0.18)",
                    color: "#C6A6F7",
                    fontSize: "13px",
                  }}
                >
                  Selected file: {fileName}
                </div>
              )}

              <div
                style={{
                  marginTop: "28px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <button
                  onClick={() => nav("/app/generation")}
                  style={{
                    height: "48px",
                    padding: "12px 28px",
                    borderRadius: "8px",
                    border: "1px solid rgba(237,237,237,0.18)",
                    background: "transparent",
                    color: "#EDEDED",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  ← Back
                </button>

                <button
                  disabled={!preview}
                  onClick={() => nav("/app/upload-garment")}
                  style={{
                    height: "48px",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #C6A6F7, #532C86)",
                    color: "#fff",
                    cursor: preview ? "pointer" : "not-allowed",
                    opacity: preview ? 1 : 0.5,
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  Continue to Upload Garment →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Step(props: {
  id: number;
  title: string;
  subtitle: string;
  active: boolean;
  faded?: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        borderRadius: "10px",
        padding: "12px 14px",
        border: props.active
          ? "1px solid rgba(83,44,134,0.5)"
          : "1px solid rgba(255,255,255,0.07)",
        background: props.active ? "rgba(55,25,90,0.65)" : "rgba(255,255,255,0.02)",
        opacity: props.faded ? 0.35 : 1,
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: props.active ? "#C6A6F7" : "rgba(255,255,255,0.1)",
          color: props.active ? "#1a0033" : "rgba(255,255,255,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {props.id}
      </div>

      <div>
        <div style={{ fontSize: "13px", fontWeight: 600 }}>{props.title}</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
          {props.subtitle}
        </div>
      </div>
    </div>
  );
}