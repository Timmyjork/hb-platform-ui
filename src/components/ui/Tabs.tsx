import React from "react";

export type TabItem = { key: string; label: string; badge?: React.ReactNode };

type Props = {
  value: string;
  onChange: (key: string) => void;
  items: TabItem[];
  className?: string;
};

export default function Tabs({ value, onChange, items, className = "" }: Props) {
  return (
    <div role="tablist" aria-label="Перемикачі" className={`flex gap-2 ${className}`}>
      {items.map((it) => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={active}
            className={`h-9 rounded-md px-3 text-sm transition
              ${active
                ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                : "border border-[var(--divider)] bg-[var(--surface)] hover:bg-gray-50"
              }`}
            onClick={() => onChange(it.key)}
          >
            <span className="inline-flex items-center gap-1">
              {it.label}
              {it.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
