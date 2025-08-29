import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "h-8 px-3 text-sm" : "h-9 px-4 text-sm";
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-[var(--primary)] text-white hover:opacity-90 focus:ring-[var(--primary)]",
    secondary:
      "border border-[var(--divider)] bg-[var(--surface)] hover:bg-gray-50 focus:ring-[var(--primary)]",
    ghost: "hover:bg-gray-100 focus:ring-[var(--primary)]",
    danger:
      "bg-[var(--danger)] text-white hover:opacity-90 focus:ring-[var(--danger)]",
  };

  return (
    <button
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {leftIcon && !loading && <span className="mr-1.5">{leftIcon}</span>}
      {loading && (
        <span className="mr-1.5 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
      )}
      {children}
      {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
    </button>
  );
}
