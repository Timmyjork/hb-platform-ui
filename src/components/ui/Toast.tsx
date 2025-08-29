/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
type Toast = { id: number; title: string; tone?: "success"|"warning"|"danger"|"info"|"default" };
const Ctx = createContext<{push:(t:Omit<Toast,"id">)=>void}>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = (t: Omit<Toast,"id">) => {
    const id = Date.now();
    setItems(prev => [...prev, { id, ...t }]);
    setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 3200);
  };
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 flex w-[360px] flex-col gap-2">
        {items.map(it => (
          <div key={it.id} className={`pointer-events-auto rounded-md border bg-[var(--surface)] p-3 text-sm shadow-sm
            ${it.tone==="success" ? "border-[var(--success)]" :
              it.tone==="warning" ? "border-[var(--warning)]" :
              it.tone==="danger"  ? "border-[var(--danger)]"  :
              it.tone==="info"    ? "border-[var(--info)]"    : "border-[var(--divider)]"}`}>
            {it.title}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
