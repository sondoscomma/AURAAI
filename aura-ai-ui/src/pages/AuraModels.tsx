import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Filter = "All Models" | "Female" | "Male" | "Traditional Wear" | "Modern Wear";

type AuraModel = {
  name: string;
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
    height: "5'8",
    skin: "Olive",
    rating: "4.9",
    tags: ["Modern", "Evening Wear"],
    gender: "Female",
    style: "Modern Wear",
  },
  {
    name: "Omar Khaled",
    height: "6'0",
    skin: "Tan",
    rating: "4.8",
    tags: ["Traditional", "Formal"],
    gender: "Male",
    style: "Traditional Wear",
  },
  {
    name: "Amira Hassan",
    height: "5'6",
    skin: "Fair",
    rating: "5.0",
    tags: ["Traditional", "Luxury"],
    gender: "Female",
    style: "Traditional Wear",
  },
  {
    name: "Karim Nassar",
    height: "6'1",
    skin: "Bronze",
    rating: "4.7",
    tags: ["Modern", "Streetwear"],
    gender: "Male",
    style: "Modern Wear",
  },
  {
    name: "Nour Saad",
    height: "5'7",
    skin: "Warm",
    rating: "4.8",
    tags: ["Modern", "Business"],
    gender: "Female",
    style: "Modern Wear",
  },
  {
    name: "Fahad Alim",
    height: "6'0",
    skin: "Tan",
    rating: "4.6",
    tags: ["Traditional", "Classic"],
    gender: "Male",
    style: "Traditional Wear",
  },
  {
    name: "Sara Zayed",
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
          <span style={{ opacity: 0.7 }}>?</span>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#532C86,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            👤
          </div>
        </div>
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
            padding: "32px 24px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 17, lineHeight: "28px" }}>
            Generation Flow
          </h3>

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <Step active id={1} title="Choose Model" subtitle="Current step" />
            <Step id={2} title="Upload Garment" subtitle="Next step" faded />
            <Step id={3} title="Generate & Customize" subtitle="Coming up" faded />
            <Step id={4} title="Results & Download" subtitle="Final step" faded />
          </div>

          <div
            style={{
              marginTop: 34,
              borderRadius: 10,
              border: "1px solid rgba(83,44,134,0.2)",
              background: "rgba(83,44,134,0.1)",
              padding: 20,
            }}
          >
            <h4 style={{ margin: 0, fontSize: 16 }}>Instructions</h4>
            <p
              style={{
                margin: "14px 0 0",
                fontSize: 14,
                lineHeight: "24px",
                color: "rgba(237,237,237,0.62)",
                fontFamily: "'General Sans', system-ui, sans-serif",
              }}
            >
              Browse our curated collection of high-quality Arab 3D models. Select a
              model that best fits your garment&apos;s style and target audience.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 28 }}>
            <Metric label="TOTAL MODELS" value="124" />
            <Metric label="NEW TODAY" value="8" />
          </div>
        </aside>

        {/* MAIN */}
        <main
          style={{
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
                ▼ Advanced Filters
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
                marginTop: 68,
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
                onClick={() => nav("/app/upload-garment", { state: { model: selectedModel } })}
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

function Step(props: {
  id: number;
  title: string;
  subtitle: string;
  active?: boolean;
  faded?: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderRadius: 10,
        padding: "17px 20px",
        border: props.active
          ? "1px solid rgba(198,166,247,0.45)"
          : "1px solid rgba(237,237,237,0.07)",
        background: props.active ? "rgba(83,44,134,0.28)" : "rgba(255,255,255,0.02)",
        opacity: props.faded ? 0.35 : 1,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: props.active ? "#C6A6F7" : "rgba(237,237,237,0.1)",
          color: props.active ? "#2B144C" : "rgba(237,237,237,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        {props.id}
      </div>

      <div>
        <div style={{ fontSize: 16, color: props.active ? "#C6A6F7" : "#EDEDED" }}>
          {props.title}
        </div>
        <div style={{ fontSize: 13, color: "rgba(237,237,237,0.5)" }}>
          {props.subtitle}
        </div>
      </div>
    </div>
  );
}

function Metric(props: { label: string; value: string }): JSX.Element {
  return (
    <div
      style={{
        borderRadius: 7,
        background: "rgba(83,44,134,0.75)",
        padding: "13px 15px",
      }}
    >
      <div style={{ fontSize: 10, color: "rgba(237,237,237,0.55)" }}>
        {props.label}
      </div>
      <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700 }}>{props.value}</div>
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
      }}
    >
      {/* image placeholder for now */}
      <div
        style={{
          height: 330,
          position: "relative",
          background:
            "linear-gradient(145deg, rgba(237,237,237,0.85), rgba(83,44,134,0.55))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(22,22,22,0.5)",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        Model Image

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