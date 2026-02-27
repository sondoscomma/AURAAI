import type { JSX } from "react";
import paintIcon from "../assets/icone/paint.png";
import shartIcon from "../assets/icone/shart.png";
import eyeIcone from "../assets/icone/eye.png";
type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Real-Time Visualization",
    desc: "See how clothes fit and look on your body in real-time with our advanced computer vision technology.",
    icon: <span className="text-[18px]"> 
        <img src={eyeIcone} alt="" style={{ width: "27px", height: "24px" }}/>
    </span>,
  },
  {
    title: "Accurate Fit Analysis",
    desc: "Our AI analyzes your body measurements to provide precise fit recommendations and sizing guidance.",
    icon: <span className="text-[18px]"> 
            <img src={shartIcon} alt="" style={{ width: "27px", height: "24px" }}/>
    </span>,
  },
  {
    title: "Style Matching",
    desc: "Discover new styles and combinations that complement your personal aesthetic and body type.",
    icon: <span className="text-[18px]">
         <img src={paintIcon} alt="" style={{ width: "27px", height: "24px" }}/>
    </span>,
  },
];

export default function Features(): JSX.Element {
  return (
    <section className="relative w-full px-[104px] py-16">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[30%] h-[420px] w-[520px] rounded-full bg-[#532C86]/20 blur-[120px]" />
        <div className="absolute right-[8%] top-[40%] h-[420px] w-[520px] rounded-full bg-[#2B144C]/25 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-display text-[32px] font-bold leading-[40px] text-[#C6A6F7]">
            Revolutionary Features
          </h2>
          <p className="mx-auto mt-3 max-w-[720px] font-body text-[14px] leading-[22px] text-white/55">
            Powered by cutting-edge AI technology to deliver the most realistic virtual
            try-on experience
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, desc, icon }: Feature): JSX.Element {
  return (
    <div
      className="
        relative overflow-hidden rounded-[16px]
        border border-white/10
        bg-white/[0.04]
        p-7
        shadow-[0_18px_60px_rgba(0,0,0,0.35)]
        backdrop-blur-md
      "
    >
      {/* gradient wash like screenshot */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_20%,rgba(83,44,134,0.25),transparent_60%),radial-gradient(120%_120%_at_80%_80%,rgba(43,20,76,0.30),transparent_60%)]" />

      <div className="relative">
        {/* Icon box */}
        <div
          className="
            flex h-[48px] w-[48px] items-center justify-center
            rounded-[10px]
            bg-white/[0.06]
            border border-white/10
          "
        >
          <span className="text-[#C6A6F7]">{icon}</span>
        </div>

        <h3 className="mt-5 font-display text-[16px] font-semibold text-white">
          {title}
        </h3>

        <p className="mt-3 font-body text-[13px] leading-[20px] text-white/55">
          {desc}
        </p>
      </div>
    </div>
  );
}
