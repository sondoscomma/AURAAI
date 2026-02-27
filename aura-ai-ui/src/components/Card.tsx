import type { JSX, ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export default function Card({ title, children, className }: CardProps): JSX.Element {
  return (
    <div className={clsx("rounded-2xl border border-neutral-900 bg-neutral-950 p-5", className)}>
      {title ? <div className="font-semibold">{title}</div> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}
