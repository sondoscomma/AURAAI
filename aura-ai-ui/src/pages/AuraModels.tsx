import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import laylaImg from "../assets/models/female-modern-1.png";
import omarImg from "../assets/models/male-traditional-1.png";
import amiraImg from "../assets/models/female-traditional-1.png";
import karimImg from "../assets/models/male-modern-1.png";
import nourImg from "../assets/models/female-modern-2.png";
import fahadImg from "../assets/models/male-traditional-2.png";
import saraImg from "../assets/models/female-modern-3.png";
import GenerationFlow from "../components/GenerationFlow";

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

export default function AuraModels(): JSX.Element {
  const nav = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("All Models");
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

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

  const handleContinue = (): void => {
    if (!selectedModel) return;
    // After selecting a model, go to upload garment page
    nav("/app/upload-garment", {
      state: { selected: "aura", modelName: selectedModel },
    });
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
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#C6A6F7,#532C86)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✎
          </div>
          <strong style={{ fontSize: 16, letterSpacing: "0.04em" }}>AURA AI</strong>
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
                  Select a professional Arab model for your virtual try-on.
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

            {/* MODEL GRID */}
            <div
              style={{
                marginTop: 48,
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 28,
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

            {/* CONTINUE */}
            <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end" }}>
              <button
                disabled={!selectedModel}
                onClick={handleContinue}
                style={{
                  height: 48,
                  padding: "0 32px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#C6A6F7,#532C86)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: selectedModel ? "pointer" : "not-allowed",
                  opacity: selectedModel ? 1 : 0.5,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedModel) {
                    e.currentTarget.style.boxShadow = "0 6px 28px rgba(198,166,247,0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Continue with Selected Model →
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
        height: 420,
        border: props.selected
          ? "2px solid #C6A6F7"
          : "1px solid rgba(237,237,237,0.13)",
        borderRadius: 8,
        background: "#161616",
        overflow: "hidden",
        padding: 0,
        textAlign: "left",
        cursor: "pointer",
        boxShadow: props.selected ? "0 0 0 4px rgba(198,166,247,0.18)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Model Image */}
      <div
        style={{
          height: 330,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={props.model.image}
          alt={props.model.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 20,
            display: "flex",
            gap: 8,
          }}
        >
          {props.model.tags.map((tag, index) => (
            <span
              key={tag}
              style={{
                borderRadius: 5,
                padding: "7px 12px",
                background:
                  index === 0
                    ? "rgba(198,166,247,0.6)"
                    : "rgba(237,237,237,0.28)",
                color: "#fff",
                fontSize: 12,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: 90, padding: "18px 20px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <strong style={{ fontSize: 16 }}>{props.model.name}</strong>
          <span style={{ fontSize: 13 }}>⭐ {props.model.rating}</span>
        </div>
        <div
          style={{
            marginTop: 7,
            fontSize: 12,
            color: "rgba(237,237,237,0.55)",
          }}
        >
          Height: {props.model.height} · Skin: {props.model.skin}
        </div>
      </div>
    </button>
  );
}
