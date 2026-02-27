import React, { type JSX } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ ...props }: InputProps): JSX.Element {
  return (
    <input
      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-600 focus:outline-none"
      {...props}
    />
  );
}
