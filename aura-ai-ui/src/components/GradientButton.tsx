// GradientButton.tsx
import type { JSX } from "react";

type GradientButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function GradientButton({
  children,
  className = "",
  onClick,
}: GradientButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        background: "linear-gradient(to bottom, #532C86, #2B144C)",
        border: "1px solid #3AEDFF",
        borderRadius: "8px",
        color: "#FFFFFF",
        fontWeight: "bold",
        padding: "8px 24px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "14px",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#7DF2FF";
        e.currentTarget.style.filter = "brightness(1.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#3AEDFF";
        e.currentTarget.style.filter = "brightness(1)";
      }}
    >
      {children}
    </button>
  );
}