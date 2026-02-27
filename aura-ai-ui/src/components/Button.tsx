import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500/60 disabled:opacity-60";
  const styles = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white",
    secondary: "bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800",
    ghost: "hover:bg-neutral-900 text-white",
  };

  return <button className={clsx(base, styles[variant], className)} {...props} />;
}
