import type { JSX } from "react";
import { useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import laylaImg from "../assets/models/female-modern-1.png";
import omarImg from "../assets/models/male-traditional-1.png";
import amiraImg from "../assets/models/female-traditional-1.png";
import karimImg from "../assets/models/male-modern-1.png";
import nourImg from "../assets/models/female-modern-2.png";
import fahadImg from "../assets/models/male-traditional-2.png";
import saraImg from "../assets/models/female-modern-3.png";
import GenerationFlow from "../components/GenerationFlow";
import AuraLogo from "../components/AuraLogo";
import SafeImage from "../components/SafeImage";
import { storeImage } from "../utils/imageStore";
import { fetchGeneration, validateAndBuildImageUrl } from "../utils/apiClient";

type Filter = "All Models" | "Female" | "Male" | "Traditional Wear" | "Modern Wear";

type AuraModel = {
  name: string;
  image: string;
  height: string;
  skin: string;
  rating: string;
  tags: string[];
  gender: "Female" | "Male";
  style: "Traditional Wear" | "Modern Wear";
};

const filters: Filter[] = [
  "All Models",
  "Female",
  "Male",
  "Traditional Wear",
  "Modern Wear",
];

const models: AuraModel[] = [
  {
    name: "Layla Al-Fayed",
    image: laylaImg,
    height: "5'8",
    skin: "Olive",
    rating: "4.9",
    tags: ["Modern", "Evening Wear"],
    gender: "Female",
    style: "Modern Wear",
  },
  {
    name: "Omar Khaled",
    image: omarImg,
    height: "6'0",
    skin: "Tan",
    rating: "4.8",
    tags: ["Traditional", "Formal"],
    gender: "Male",
    style: "Traditional Wear",
  },
  {
    name: "Amira Hassan",
    image: amiraImg,
    height: "5'6",
    skin: "Fair",
    rating: "5.0",
    tags: ["Traditional", "Luxury"],
    gender: "Female",
    style: "Traditional Wear",
  },
  {
    name: "Karim Nassar",
    image: karimImg,
    height: "6'1",
    skin: "Bronze",
    rating: "4.7",
    tags: ["Modern", "Streetwear"],
    gender: "Male",
    style: "Modern Wear",
  },
  {
    name: "Nour Saad",
    image: nourImg,
    height: "5'7",
    skin: "Warm",
    rating: "4.8",
    tags: ["Modern", "Business"],
    gender: "Female",
    style: "Modern Wear",
  },
  {
    name: "Fahad Alim",
    image: fahadImg,
    height: "6'0",
    skin: "Tan",
    rating: "4.6",
    tags: ["Traditional", "Classic"],
    gender: "Male",
    style: "Traditional Wear",
  },
  {
    name: "Sara Zayed",
    image: saraImg,
    height: "5'5",
    skin: "Fair",
    rating: "4.9",
    tags: ["Modern", "Colorful"],
    gender: "Female",
    style: "Modern Wear",
  },
];

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AuraModels(): JSX.Element {
  const nav = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("All Models");
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [frontImageId, setFrontImageId] = useState<string | null>(null);
  const [rightImageId, setRightImageId] = useState<string | null>(null);

  // Garment upload state
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [garmentDragging, setGarmentDragging] = useState(false);

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesFilter =
        activeFilter === "All Models" ||
        model.gender === activeFilter ||
        model.style === activeFilter;

      const matchesSearch = model.name.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  // ── Garment upload handlers ──
  const handleGarmentFile = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!VALID_TYPES.includes(file.type)) return;
    setGarmentFile(file);
    setGarmentPreview(URL.createObjectURL(file));
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
  }, []);

  const removeGarment = (): void => {
    if (garmentPreview) URL.revokeObjectURL(garmentPreview);
    setGarmentFile(null);
    setGarmentPreview(null);
  };

  // Convert image URL to Blob using fetch (more reliable than canvas for local/Vite assets)
  const imageURLtoBlob = async (url: string): Promise<Blob> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Empty blob");
      return blob;
    } catch {
      // Fallback: use canvas approach if fetch fails (e.g. data URLs)
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Canvas context failed")); return; }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Blob conversion failed"));
          }, "image/png");
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = url;
      });
    }
  };

  const handleGenerate = async (): Promise<void> => {
    if (!selectedModel || !garmentFile) return;

    try {
      setIsGenerating(true);
      setError("");

      // Token is optional — backend supports both authenticated and guest users
      const token = localStorage.getItem("token");

      const model = models.find((m) => m.name === selectedModel);
      if (!model) return;

      // Convert the model's image URL to a Blob for FormData upload
      const modelBlob = await imageURLtoBlob(model.image);

      // Helper: generate one view via tryon API
      const generateView = async (prompt: string, direction: "front" | "right", currentGroupId: string | null): Promise<{ imageUrl: string; imageId: string; groupId: string }> => {
        const formData = new FormData();
        formData.append("images", modelBlob, "model.png");
        formData.append("images", garmentFile!, "garment.png");
        formData.append("prompt", prompt);
        formData.append("direction", direction);
        if (currentGroupId) {
          formData.append("groupId", currentGroupId);
        }

        const data = await fetchGeneration("/api/tryon/generate", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        return {
          imageUrl: validateAndBuildImageUrl(data as Record<string, unknown>),
          imageId: (data as Record<string, unknown>).imageId as string,
          groupId: (data as Record<string, unknown>).groupId as string,
        };
      };

      // Build prompt context from model attributes
      const basePrompt = `Create a realistic virtual try-on image. Dress the ${model.gender.toLowerCase()} person with the uploaded clothing. Professional ${model.tags.join(", ").toLowerCase()} style, ${model.height} tall, ${model.skin.toLowerCase()} skin, photorealistic, studio lighting, full body shot`;

      // Generate both views sequentially to avoid API overload/corruption
      const front = await generateView(`${basePrompt}, front view facing camera`, "front", null);
      const right = await generateView(`${basePrompt}, right side profile view, turned 90 degrees to the right`, "right", front.groupId);

      if (!front.imageUrl || !right.imageUrl) {
        throw new Error("One or both views failed to generate");
      }

      setGroupId(front.groupId);
      setFrontImageId(front.imageId);
      setRightImageId(right.imageId);

      // Store images in memory and pass only keys via router state
      // (avoids corruption from browser History API size limits)
      const frontImageKey = storeImage(front.imageUrl);
      const rightImageKey = storeImage(right.imageUrl);
      const garmentPreviewKey = garmentPreview ? storeImage(garmentPreview) : null;
      const modelPreviewKey = model.image ? storeImage(model.image) : null;

      // Navigate to AURA Model result page with image keys (not raw data)
      nav("/app/generation-result-model", {
        state: {
          frontImageKey,
          rightImageKey,
          modelName: model.name,
          garmentPreviewKey,
          modelPreviewKey,
          // Pass generation IDs so result page can fetch from backend
          frontImageId: front.imageId,
          rightImageId: right.imageId,
          groupId: front.groupId,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

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
          borderBottom: "1px solid rgba(83,44,134,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AuraLogo size={38} />
          <div>
            <strong style={{ fontSize: 16, letterSpacing: "0.04em" }}>AURA AI</strong>
            <div style={{ fontSize: "10px", color: "rgba(198,166,247,0.6)", letterSpacing: "0.04em" }}>
              AURA Models
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={() => nav("/app/profile")}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg,#532C86,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
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
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR - Generation Flow with Step 3 glowing */}
        <GenerationFlow activeStep={3} />

        {/* MAIN */}
        <main
          style={{
            flex: 1,
            background: "linear-gradient(155deg,#2B144C 0%,#31145f 48%,#241044 100%)",
            padding: "42px 36px",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* TOP */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 32,
                    lineHeight: "40px",
                    fontWeight: 700,
                  }}
                >
                  Choose from AURA Models
                </h1>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: "rgba(237,237,237,0.68)",
                    fontSize: 18,
                    fontFamily: "'General Sans', system-ui, sans-serif",
                  }}
                >
                  Select a professional Arab model and upload a garment to generate.
                </p>
              </div>

              <button
                type="button"
                onClick={() => nav("/app/generation")}
                style={{
                  height: 48,
                  borderRadius: 9,
                  border: "1px solid rgba(237,237,237,0.18)",
                  background: "#161616",
                  color: "#EDEDED",
                  padding: "0 22px",
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                ← Change Method
              </button>
            </div>

            {/* FILTERS */}
            <div
              style={{
                marginTop: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    style={{
                      height: 44,
                      padding: "0 26px",
                      borderRadius: 999,
                      border:
                        activeFilter === filter
                          ? "1px solid #C6A6F7"
                          : "1px solid rgba(237,237,237,0.16)",
                      background:
                        activeFilter === filter
                          ? "#C6A6F7"
                          : "#161616",
                      color:
                        activeFilter === filter
                          ? "#2B144C"
                          : "#EDEDED",
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div
                style={{
                  width: 330,
                  height: 48,
                  borderRadius: 9,
                  border: "1px solid rgba(237,237,237,0.18)",
                  background: "#161616",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 16px",
                  boxSizing: "border-box",
                }}
              >
                <span style={{ opacity: 0.45 }}>⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search models..."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#EDEDED",
                    fontSize: 15,
                  }}
                />
              </div>
            </div>

            {/* MODEL GRID - Smaller images with more spacing */}
            <div
              style={{
                marginTop: 48,
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 44,
              }}
            >
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.name}
                  model={model}
                  selected={selectedModel === model.name}
                  onSelect={() => setSelectedModel(model.name)}
                />
              ))}
            </div>

            {/* GARMENT UPLOAD SECTION */}
            <div
              style={{
                marginTop: 40,
                border: "1px solid rgba(237,237,237,0.12)",
                borderRadius: 14,
                background: "rgba(43,20,76,0.2)",
                padding: "24px 28px",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#C6A6F7",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                👕 Upload Your Garment
              </div>

              {garmentPreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <SafeImage
                      src={garmentPreview}
                      alt="Uploaded garment"
                      fallbackIcon="👕"
                      style={{
                        width: 140,
                        height: 140,
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
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(239,68,68,0.85)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#EDEDED", marginBottom: 4 }}>
                      Garment uploaded
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(237,237,237,0.5)" }}>
                      This garment will be combined with the selected AURA model
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleGarmentDragOver}
                  onDragLeave={handleGarmentDragLeave}
                  onDrop={handleGarmentDrop}
                  onClick={() => garmentInputRef.current?.click()}
                  style={{
                    minHeight: 140,
                    borderRadius: 12,
                    border: garmentDragging
                      ? "2px solid rgba(139,92,246,0.7)"
                      : "2px dashed rgba(198,166,247,0.35)",
                    background: garmentDragging
                      ? "rgba(139,92,246,0.12)"
                      : "rgba(43,20,76,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    gap: 8,
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
                  <span style={{ fontSize: 28, color: "rgba(198,166,247,0.5)" }}>📤</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                    Drag & drop or click to upload garment
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(198,166,247,0.4)" }}>
                    JPG, PNG, WEBP
                  </span>
                </div>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 18px",
                  borderRadius: 10,
                  background: "rgba(255,123,123,0.1)",
                  border: "1px solid rgba(255,123,123,0.3)",
                  fontSize: 13,
                  color: "#ff7b7b",
                }}
              >
                {error}
              </div>
            )}

            {/* GENERATE BUTTON */}
            <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", paddingBottom: 24 }}>
              <button
                disabled={!selectedModel || !garmentFile || isGenerating}
                onClick={handleGenerate}
                style={{
                  height: 52,
                  padding: "0 36px",
                  borderRadius: 10,
                  border: "none",
                  background: selectedModel && garmentFile && !isGenerating
                    ? "linear-gradient(135deg,#C6A6F7,#532C86)"
                    : "rgba(255,255,255,0.08)",
                  color: selectedModel && garmentFile && !isGenerating ? "#fff" : "rgba(255,255,255,0.3)",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: selectedModel && garmentFile && !isGenerating ? "pointer" : "not-allowed",
                  opacity: isGenerating ? 0.7 : 1,
                  transition: "all 0.3s ease",
                  boxShadow: selectedModel && garmentFile && !isGenerating
                    ? "0 8px 32px rgba(198,166,247,0.3)"
                    : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) => {
                  if (selectedModel && garmentFile && !isGenerating) {
                    e.currentTarget.style.boxShadow = "0 12px 44px rgba(198,166,247,0.45)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = selectedModel && garmentFile && !isGenerating
                    ? "0 8px 32px rgba(198,166,247,0.3)"
                    : "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isGenerating ? "Generating 2 Views..." : !selectedModel ? "🪄 Select a Model" : !garmentFile ? "🪄 Upload a Garment" : "🪄 Generate Try-On (2 Views)"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ModelCard(props: {
  model: AuraModel;
  selected: boolean;
  onSelect: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      style={{
        height: 320,
        border: props.selected
          ? "2px solid #C6A6F7"
          : "1px solid rgba(237,237,237,0.13)",
        borderRadius: 10,
        background: "#161616",
        overflow: "hidden",
        padding: 0,
        textAlign: "left",
        cursor: "pointer",
        boxShadow: props.selected ? "0 0 0 4px rgba(198,166,247,0.18)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Model Image - smaller to fit card */}
      <div
        style={{
          height: 210,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(43,20,76,0.35) 0%, rgba(22,22,22,0.9) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 14px",
          boxSizing: "border-box",
        }}
      >
        <SafeImage
          src={props.model.image}
          alt={props.model.name}
          fallbackIcon="👤"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            display: "block",
            borderRadius: 6,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 14,
            display: "flex",
            gap: 6,
          }}
        >
          {props.model.tags.map((tag, index) => (
            <span
              key={tag}
              style={{
                borderRadius: 5,
                padding: "5px 10px",
                background:
                  index === 0
                    ? "rgba(198,166,247,0.6)"
                    : "rgba(237,237,237,0.28)",
                color: "#fff",
                fontSize: 11,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: 110, padding: "14px 16px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <strong style={{ fontSize: 14 }}>{props.model.name}</strong>
          <span style={{ fontSize: 12 }}>⭐ {props.model.rating}</span>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: "rgba(237,237,237,0.55)",
          }}
        >
          Height: {props.model.height} · Skin: {props.model.skin}
        </div>
      </div>
    </button>
  );
}
