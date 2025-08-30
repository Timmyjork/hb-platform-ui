import { useEffect, useId, useRef, useState } from "react";

type Props = { text: string; className?: string };

export default function InfoTooltip({ text, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        ref={btnRef}
        aria-label="Підказка"
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--divider)] text-[10px] leading-none text-[var(--secondary)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      >
        i
      </button>
      {open && (
        <div
          ref={tipRef}
          role="tooltip"
          id={tipId}
          className="absolute left-1/2 z-50 mt-2 -translate-x-1/2 whitespace-pre-wrap rounded-md border border-[var(--divider)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)] shadow-md"
        >
          {text}
        </div>
      )}
    </span>
  );
}
