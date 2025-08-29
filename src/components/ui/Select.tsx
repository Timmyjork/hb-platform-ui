import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export default function Select({ label, error, className = "", children, ...rest }: Props) {
  return (
    <label className="flex w-full flex-col gap-1">
      {label && <span className="text-xs font-medium text-[var(--secondary)]">{label}</span>}
      <select
        className={`h-9 rounded-md border bg-[var(--surface)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] ${
          error ? "border-[var(--danger)]" : "border-[var(--divider)]"
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}
