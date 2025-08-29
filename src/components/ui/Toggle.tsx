import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export default function Toggle({ label, hint, className = "", ...rest }: Props) {
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <input type="checkbox" {...rest} />
      {label && <span className="text-sm">{label}</span>}
      {hint && <span className="ml-auto text-xs text-[var(--secondary)]">{hint}</span>}
    </label>
  );
}

