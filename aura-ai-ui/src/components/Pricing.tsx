import type { JSX } from "react";

// Define the type for a pricing plan for better type safety and maintainability
type Plan = {
  name: string;
  price: string;
  period?: string; // Optional, e.g., "/month"
  badge?: string; // Optional, e.g., "Popular"
  features: string[];
  buttonText: string;
  buttonStyle: "primary" | "secondary"; // To differentiate button styles
};

export default function Pricing(): JSX.Element {
  // Data for the pricing plans - makes the component easy to update
  const plans: Plan[] = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "5 virtual try-ons per month",
        "Basic AI analysis",
        "Standard resolution",
      ],
      buttonText: "Get Started",
      buttonStyle: "primary",
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      badge: "Popular",
      features: [
        "Unlimited virtual try-ons",
        "Advanced AI analysis",
        "HD resolution",
        "Style recommendations",
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "secondary",
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Custom integration",
        "API access",
        "Priority support",
        "White-label options",
      ],
      buttonText: "Contact Sales",
      buttonStyle: "secondary",
    },
  ];

  return (
    // Section container with dark background and padding
    <section className="w-full bg-black py-20 px-[104px]" id="Pricing">
      {/* Constrained width container */}
      <div className="mx-auto max-w-[1440px]">
        {/* Section Header */}
        <h2 className="font-bricolage text-center text-[36px] leading-[40px] font-bold text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-center text-[16px] leading-[26px] text-white/65 mb-16">
          Flexible pricing options to suit your virtual try-on needs
        </p>

        {/* Pricing Cards Container */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center">
          {plans.map((plan, index) => (
            // Individual Pricing Card
            <div
              key={index}
              className="
                relative flex-1 max-w-sm
                border border-white/10 rounded-2xl
                bg-gradient-to-b from-gray-900/50 to-black
                p-8 lg:p-10
                transition-all duration-300 hover:border-violet-500/50
              "
            >
              {/* "Popular" Badge */}
              {plan.badge && (
                <div
                  className="
                    absolute -top-4 left-1/2 transform -translate-x-1/2
                    px-4 py-1
                    bg-gradient-to-r from-violet-600 to-purple-800
                    rounded-full
                    text-xs font-semibold text-white
                  "
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-center text-2xl font-semibold text-white mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                {plan.period && (
                  <span className="text-lg text-white/65 ml-2">{plan.period}</span>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-white/80">
                    <span className="text-violet-400 mr-3 text-lg leading-none">✓</span>
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Call-to-Action Button */}
              <button
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300
                  ${
                    plan.buttonStyle === "primary"
                      ? "bg-violet-700/60 text-white shadow-lg shadow-violet-900/30 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-900/40"
                      : "border border-violet-500/40 bg-transparent text-white hover:bg-white/5"
                  }
                `}
                style={
                  plan.buttonStyle === "primary" && plan.buttonText === "Start Free Trial"
                    ? {
                        background: "linear-gradient(90deg, #C6A6F7 0%, #532C86 100%)",
                        boxShadow: "0 8px 32px rgba(198, 166, 247, 0.25)"
                      }
                    : {}
                }
                type="button"
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}