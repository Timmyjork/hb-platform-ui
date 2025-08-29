import React from "react";

type Props = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  dot?: boolean;
};

export default function Badge({ children, tone = "default", dot = false }: Props) {
  const tones: Record<NonNullable<Props["tone"]>, string> = {
    default: "bg-gray-100 text-[var(--text)]",
    success: "bg-[var(--success)]/10 text-[var(--success)]",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
    danger: "bg-[var(--danger)]/10 text-[var(--danger)]",
    info: "bg-[var(--info)]/10 text-[var(--info)]",
  };

  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium ${tones[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
