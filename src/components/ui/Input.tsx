import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode; // наприклад, кнопка "Очистити"
};

export default function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  className = "",
  ...rest
}: Props) {
  const ariaLabel = (rest as Record<string, unknown>)["aria-label"] as string | undefined
  return (
    <label className="flex w-full flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-[var(--secondary)]">
          {label}
        </span>
      )}

      <div
        className={`flex h-9 items-center rounded-md border bg-[var(--surface)]
        ${error ? "border-[var(--danger)]" : "border-[var(--divider)]"}
        focus-within:ring-2 focus-within:ring-[var(--primary)] ${className}`}
      >
        {leftIcon && <span className="ml-2 text-[var(--secondary)]">{leftIcon}</span>}
        <input
          className="h-full w-full bg-transparent px-3 text-sm outline-none placeholder:text-[var(--secondary)]"
          aria-label={ariaLabel ?? label}
          {...rest}
        />
        {rightSlot && <span className="mr-2">{rightSlot}</span>}
      </div>

      {hint && !error && (
        <span className="text-xs text-[var(--secondary)]">{hint}</span>
      )}
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}
