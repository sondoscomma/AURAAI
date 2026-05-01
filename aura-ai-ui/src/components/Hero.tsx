import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/image/hero.png";
import sparkleIcon from "../assets/icone/spark.png";
import addIcone from "../assets/icone/add.png";

export default function Hero(): JSX.Element {
  const navigate = useNavigate();

  const handleTryVirtualTryOn = () => {
    // Navigate to sign-in first
    navigate("/login");
  };


  const handleCreateAIModel = () => {
    // Navigate to sign-in first
    navigate("/login");
  };

  return (
    <section 
      className="w-full px-[104px] pb-16 pt-10"
      style={{
        background: "linear-gradient(135deg, rgba(43, 20, 76, 0.3) 0%, #161616 50%, rgba(83, 44, 134, 0.2) 100%)"
      }}
    >
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <h1 className="font-display text-[64px] leading-[72px] font-extrabold text-white">
            Step Into the Future <br />
            of Fashion{" "}
            <span className="text-violet-300">with AI</span>
            <br />
            <span className="text-violet-300">Virtual Try-On</span>
          </h1>

          <p className="mt-6 max-w-[560px] text-[16px] leading-[28px] text-white/65">
            AURA AI helps fashion brands and users create realistic virtual
            try-on visuals at scale, providing creative flexibility, accuracy,
            and full personalization control.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              onClick={handleTryVirtualTryOn}
              className="
                inline-flex items-center gap-2
                rounded-xl px-6 py-3
                text-sm font-semibold text-white
                transition
                hover:opacity-90
              "
              style={{
                background: "#532C86",
                boxShadow: "0 8px 32px rgba(83, 44, 134, 0.25)"
              }}
              type="button"
            >
              <span className="text-lg"> <img src={sparkleIcon} alt="" /></span>
              Try Virtual Try-On
            </button>

            <button
              onClick={handleCreateAIModel}
              className="
                inline-flex items-center gap-2
                rounded-xl border border-violet-500/40
                bg-transparent px-6 py-3
                text-sm font-semibold text-white
                hover:bg-white/5
                transition
              "
              type="button"
            >
              <span className="text-lg"> <img src={addIcone} alt="" /></span>
              Create AI Model
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center lg:justify-end">
          <div
            className="
              relative
              w-full max-w-[620px]
              rounded-2xl
              bg-gradient-to-br from-violet-900/60 to-violet-600/30
              p-6
              shadow-2xl shadow-violet-900/30
            "
          >
            <div className="overflow-hidden rounded-xl bg-black/30">
              <img
                src={heroImg}
                alt="Aura AI Virtual Try-On"
                className="h-[340px] w-full object-cover md:h-[360px]"
              />
            </div>

            {/* subtle glow */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-violet-700/10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
