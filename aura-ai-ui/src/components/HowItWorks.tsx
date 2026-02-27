// HowItWorks.tsx
import type { JSX } from "react";

// Define the type for a step object for better type safety
type Step = {
  number: number;
  title: string;
  description: string;
};

export default function HowItWorks(): JSX.Element {
  // Data for the steps - makes the component easy to update
  const steps: Step[] = [
    {
      number: 1,
      title: "Upload Photo",
      description:
        "Simply upload a photo of yourself or choose from our diverse range of AI models to get started.",
    },
    {
      number: 2,
      title: "Choose Clothes",
      description:
        "Browse our extensive catalog or upload your own clothing designs to see how they look.",
    },
    {
      number: 3,
      title: "See Results",
      description:
        "Get hyper-realistic virtual try-on images in seconds, ready for your creative projects.",
    },
  ];

  return (
    // Section container with dark background and padding
    <section className="w-full bg-black py-20 px-[104px]">
      {/* Constrained width container */}
      <div className="mx-auto max-w-[1440px]">
        {/* Section Title with your specified styling */}
        <h2 className="font-bricolage text-center text-[36px] leading-[40px] font-bold text-white mb-16">
          How It Works
        </h2>

        {/* Grid for the steps - responsive: 1 column on mobile, 3 on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step) => (
            // Individual step card
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              {/* Step Number Circle with Gradient */}
              <div
                className="
                  flex items-center justify-center
                  w-16 h-16 rounded-full
                  bg-gradient-to-br from-violet-600 to-purple-800
                  mb-6
                  shadow-lg shadow-violet-900/40
                "
              >
                <span className="text-2xl font-bold text-white">
                  {step.number}
                </span>
              </div>

              {/* Step Title */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-sm leading-relaxed text-white/65 max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}