import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


// use your real images
import uploadImg from "../assets/genration/upload.png";
import aiImg from "../assets/genration/ai.png";
import modelsImg from "../assets/genration/models.png";

type Step = { id: number; title: string; subtitle: string; state: "current" | "next" | "later" };
type ModelChoice = "upload" | "generate" | "aura";

const steps: Step[] = [
  { id: 1, title: "Choose Model", subtitle: "Current step", state: "current" },
  { id: 2, title: "Upload Garment", subtitle: "Next step", state: "next" },
  { id: 3, title: "Generate & Customize", subtitle: "Coming up", state: "later" },
  { id: 4, title: "Results & Download", subtitle: "Final step", state: "later" },
];

export default function Generation(): JSX.Element {
  const nav = useNavigate();
  const [selected, setSelected] = useState<ModelChoice | null>(null);

  const cards = useMemo(
    () => [
      {
        id: "upload" as const,
        image: uploadImg,
        title: "Upload Your Model",
        desc: "Upload a full-body image of a model or yourself to generate personalized try-on results.",
        meta: "JPG / PNG supported",
      },
      {
        id: "generate" as const,
        image: aiImg,
        title: "Generate AI Model",
        desc: "Describe your desired model and let AURA AI create it using generative AI.",
        meta: "AI-powered generation",
      },
      {
        id: "aura" as const,
        image: modelsImg,
        title: "Choose from AURA Models",
        desc: "Select from a curated collection of professional AURA full-body models.",
        meta: "Professional models",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      {/* Top bar */}
      <header className="h-[64px] border-b border-white/10">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#532C86]">
              <span className="text-sm">✎</span>
            </div>
            <div className="font-semibold tracking-wide">AURA AI</div>
          </div>

          <div className="flex items-center gap-3 text-white/70">
            <button className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:bg-white/5">
              ?
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:bg-white/5">
              👤
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-[320px_1fr]">
        {/* Left sidebar */}
        <aside className="min-h-[calc(100vh-64px)] border-r border-[#532C86]/20 bg-[#161616] p-6">
          <div className="text-sm font-semibold text-white/90">Generation Flow</div>

          <div className="mt-4 space-y-3">
            {steps.map((s) => (
              <StepItem key={s.id} step={s} />
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold">Instructions</div>
            <p className="mt-2 text-xs leading-5 text-white/60">
              Select how you want to create or choose the model for your virtual try-on experience. You can
              upload your own photo, generate an AI model, or choose from our curated collection.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-h-[calc(100vh-64px)] bg-[#2b144c] p-8">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
              <span>👤</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Choose Your Model</h1>
              <p className="mt-1 max-w-[720px] text-sm text-white/60">
                Select how you want to create or choose the model for your virtual try-on experience.
              </p>
            </div>
          </div>

          {/* Selectable cards */}
          <div className="mt-6 grid max-w-[980px] grid-cols-1 gap-6 md:grid-cols-3">
            {cards.map((c) => (
              <ChoiceCard
                key={c.id}
                image={c.image}
                title={c.title}
                desc={c.desc}
                meta={c.meta}
                selected={selected === c.id}
                onSelect={() => setSelected(c.id)}
              />
            ))}
          </div>

          {/* Continue button */}
          <div className="mt-8 flex max-w-[980px] justify-end">
            <button
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                nav("/app/upload-garment", { state: { selected } });
              }}
              className={[
                "flex h-[44px] w-[320px] items-center justify-center gap-2 rounded-xl text-sm transition",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Continue to Upload Garment <span className="translate-y-[1px]">→</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function StepItem({ step }: { step: Step }): JSX.Element {
  const isCurrent = step.state === "current";
  const isNext = step.state === "next";

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border p-4",
        isCurrent ? "border-[#532C86]/40 bg-[#2b144c]/30" : "border-white/10 bg-black/10",
        isNext ? "opacity-60" : "",
        step.state === "later" ? "opacity-40" : "",
      ].join(" ")}
    >
      <div
        className={[
          "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold",
          isCurrent ? "bg-[#c6a6f7] text-black" : "bg-white/10 text-white/70",
        ].join(" ")}
      >
        {step.id}
      </div>
      <div>
        <div className="text-sm font-semibold">{step.title}</div>
        <div className="text-xs text-white/60">{step.subtitle}</div>
      </div>
    </div>
  );
}

function ChoiceCard(props: {
  image: string;
  title: string;
  desc: string;
  meta: string;
  selected: boolean;
  onSelect: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={[
        "text-left rounded-2xl border bg-black/30 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition",
        props.selected ? "border-[#c6a6f7]/70 ring-2 ring-[#c6a6f7]/30" : "border-white/10 hover:border-white/20",
      ].join(" ")}
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <img src={props.image} alt="" className="h-[160px] w-full object-cover" />
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">{props.title}</div>
        <p className="mt-2 text-xs leading-5 text-white/60">{props.desc}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-[#c6a6f7]">✦ {props.meta}</div>
          <div className={["text-xs", props.selected ? "text-white" : "text-white/60"].join(" ")}>
            {props.selected ? "Selected" : "Select"}
          </div>
        </div>
      </div>
    </button>
  );
}