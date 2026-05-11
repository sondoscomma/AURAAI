import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

type Plan = {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  buttonText: string;
  buttonStyle: "primary" | "secondary";
  featured?: boolean;
};

export default function Pricing(): JSX.Element {
  const nav = useNavigate();

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
      buttonStyle: "secondary",
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
      buttonStyle: "primary",
      featured: true,
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

  const handleButtonClick = (planName: string): void => {
    nav("/login", { state: { plan: planName } });
  };

  return (
    <section
      className="w-full py-20 px-[104px]"
      id="Pricing"
      style={{
        background: "linear-gradient(135deg, #161616 0%, rgba(43, 20, 76, 0.5) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <h2
          className="text-center text-[36px] leading-[40px] font-bold mb-4"
          style={{ color: "#b794f4" }}
        >
          Choose Your Plan
        </h2>
        <p className="text-center text-[16px] leading-[26px] mb-16" style={{ color: "#a0a0a0" }}>
          Flexible pricing options to suit your virtual try-on needs
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-2xl p-8 transition-all duration-300"
              style={{
                background: "#2B144C1A",
                border: "1px solid #C6A6F71A",
                borderRadius: "16px",
                boxShadow: plan.featured
                  ? "0 0 20px rgba(183, 148, 244, 0.2), inset 0 2px 8px rgba(0, 0, 0, 0.3)"
                  : "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 text-xs font-semibold text-white"
                  style={{
                    background: "#b794f4",
                    borderRadius: "20px",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-center text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-8">
                <span className="text-4xl font-bold" style={{ color: "#b794f4" }}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-base ml-2" style={{ color: "#a0a0a0" }}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-3 text-lg leading-none" style={{ color: "#b794f4" }}>
                      ✓
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: "#d1d1d1" }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className="w-full py-3 px-6 font-semibold text-sm transition-all duration-300"
                onClick={() => handleButtonClick(plan.name)}
                style={
                  plan.buttonStyle === "primary"
                    ? {
                        background: "linear-gradient(135deg, #b794f4 0%, #9f7aea 100%)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#ffffff",
                        padding: "14px 32px",
                        boxShadow: "0 4px 12px rgba(183, 148, 244, 0.3)",
                        cursor: "pointer",
                      }
                    : {
                        background: "transparent",
                        border: "2px solid #b794f4",
                        borderRadius: "8px",
                        color: "#b794f4",
                        padding: "12px 24px",
                        cursor: "pointer",
                      }
                }
                type="button"
                onMouseEnter={(e) => {
                  if (plan.buttonStyle === "primary") {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(183, 148, 244, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  } else {
                    e.currentTarget.style.background = "rgba(183, 148, 244, 0.1)";
                    e.currentTarget.style.borderColor = "#d8b5ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.buttonStyle === "primary") {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(183, 148, 244, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  } else {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#b794f4";
                  }
                }}
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