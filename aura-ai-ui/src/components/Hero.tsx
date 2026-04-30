// Hero.tsx
import type { JSX } from "react";
import heroImg from "../assets/image/hero.png";
import sparkleIcon from "../assets/icone/spark.png";
import addIcone from "../assets/icone/add.png";

export default function Hero(): JSX.Element {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-[104px] pb-16 pt-10 overflow-hidden">
      {/* Premium gradient background matching Aura AI brand */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#2B144C]/40 via-[#161616] to-[#161616]" />
      
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-2">
        {/* LEFT CONTENT */}
        <div className="space-y-8">
          {/* Main Headline - Against Font Style */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-[64px] leading-[1.1] font-extrabold text-white">
            Step Into the Future{" "}
            <br className="hidden sm:block" />
            of Fashion{" "}
            <span className="bg-gradient-to-r from-[#C6A6F7] to-[#532C86] bg-clip-text text-transparent">
              with AI
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#C6A6F7] via-[#532C86] to-[#2B144C] bg-clip-text text-transparent">
              Virtual Try-On
            </span>
          </h1>

          {/* Subheading - General Sans / Body copy */}
          <p className="max-w-[560px] text-base sm:text-lg text-white/70 leading-relaxed font-light">
            AURA AI helps fashion brands and users create realistic virtual
            try-on visuals at scale, providing creative flexibility, accuracy,
            and full personalization control.
          </p>

          {/* CTA Buttons - Bricolage Grotesque Bold */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 pt-4">
            {/* Primary Button - Indigo Velvet */}
            <button
              className="
                inline-flex items-center justify-center gap-3
                rounded-[12px] bg-gradient-to-br from-[#532C86] to-[#2B144C]
                px-8 py-4
                text-base font-semibold text-white
                shadow-xl shadow-[#532C86]/40
                hover:shadow-2xl hover:shadow-[#532C86]/60
                hover:from-[#6B3BA8] hover:to-[#3D1D5F]
                transition-all duration-300
                border border-[#C6A6F7]/30
                hover:border-[#C6A6F7]/60
              "
              type="button"
            >
              <img src={sparkleIcon} alt="" className="w-5 h-5" />
              Try Virtual Try-On
            </button>

            {/* Secondary Button - Outline style */}
            <button
              className="
                inline-flex items-center justify-center gap-3
                rounded-[12px]
                px-8 py-4
                text-base font-semibold text-white
                border-2 border-[#C6A6F7]/40
                bg-transparent
                hover:border-[#C6A6F7]/70
                hover:bg-[#532C86]/10
                transition-all duration-300
              "
              type="button"
            >
              <img src={addIcone} alt="" className="w-5 h-5" />
              Create AI Model
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT - Image Container */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[620px]">
            {/* Outer glow effect using Indigo Velvet */}
            <div className="absolute -inset-8 rounded-[28px] bg-gradient-to-br from-[#532C86]/20 to-[#2B144C]/10 blur-2xl" />
            
            {/* Image container with gradient border effect - Luxury frame */}
            <div
              className="
                relative
                rounded-[20px]
                bg-gradient-to-br from-[#532C86]/40 via-[#2B144C]/30 to-[#161616]
                p-1
              "
            >
              <div className="overflow-hidden rounded-[18px] bg-[#0F0F0F]">
                <img
                  src={heroImg}
                  alt="Aura AI Virtual Try-On"
                  className="h-[340px] w-full object-cover md:h-[380px] lg:h-[420px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}