import React, { type JSX } from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function GradientButton({
  className,
  children,
  ...props
}: Props): JSX.Element {
  return (
    <button
      className={clsx(
        "h-[40px] px-[24px] py-[8px]",
        "rounded-[8px]",
        "text-sm font-semibold text-white",
        "bg-[linear-gradient( 90deg, #C6A6F7 0%, #532C86 100%)]",
        "shadow-[0_6px_20px_rgba(83,44,134,0.35)]",
        "hover:brightness-110 active:scale-[0.98]",
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
