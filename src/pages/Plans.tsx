import React, { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";

type PlanItem = { id: string; queenId: string; mptId: string; createdAt: string };
const LS_KEY = "hb_plans_v1";

export default function Plans() {
  const { push } = useToast();
  const [items, setItems] = useState<PlanItem[]>([]);

  const load = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      setItems(raw ? (JSON.parse(raw) as PlanItem[]) : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => { load(); }, []);

  const clear = () => {
    localStorage.removeItem(LS_KEY);
    load();
    push({ title: "Список очищено", tone: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Плани спарювання</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={load}>Оновити</Button>
          <Button onClick={clear}>Очистити</Button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
        <div className="border-b border-[var(--divider)] px-4 py-3 text-sm font-medium">
          Заплановані пари <Badge tone="info">{items.length}</Badge>
        </div>
        {items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-[var(--secondary)]">Поки що порожньо. Додай у Pairing → «У план».</div>
        ) : (
          <div className="divide-y divide-[var(--divider)]">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex flex-col">
                  <div className="font-medium">{p.queenId} × {p.mptId}</div>
                  <div className="text-xs text-[var(--secondary)]">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <Badge tone="success" dot>заплановано</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}