import React, { useMemo, useState } from "react";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";

type Reco = { mptId: string; score: number };

const LS_KEY = "hb_plans_v1";

export default function Pairing() {
  const { push } = useToast();

  // демо-джерела
  const queens = [
    { id: "UA-QUEEN-2025-001", label: "2025-001 / Карніка" },
    { id: "UA-QUEEN-2025-014", label: "2025-014 / Карпатка" },
  ];
  const mpts = [
    { id: "MPT-DZ-001", label: "Джезказган-001" },
    { id: "MPT-AL-002", label: "Аланія-002" },
    { id: "MPT-TR-003", label: "Трускавець-003" },
  ];

  const [queenId, setQueenId] = useState(queens[0].id);
  const [topN, setTopN] = useState(3);

  // примітивна «рекомендація»
  const recos = useMemo<Reco[]>(() => {
    return mpts
      .map((m, i) => ({ mptId: m.id, score: 100 - i * 7 - (queenId.endsWith("14") ? 5 : 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }, [queenId, topN]);

  const addToPlans = (mptId: string) => {
    const plan = {
      id: `${queenId}__${mptId}__${Date.now()}`,
      queenId,
      mptId,
      createdAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem(LS_KEY);
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      list.unshift(plan);
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      push({ title: "Додано в плани", description: `${queenId} × ${mptId}`, tone: "success" });
    } catch {
      push({ title: "Помилка збереження", tone: "danger" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="mb-1 text-xs font-medium text-[var(--secondary)]">Матка</div>
            <Select value={queenId} onChange={setQueenId} items={queens.map((q) => ({ label: q.label, value: q.id }))} />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-[var(--secondary)]">Скільки варіантів</div>
            <Select value={String(topN)} onChange={(v) => setTopN(Number(v))} items={["3", "5", "7", "10"]} />
          </div>
          <div className="flex items-end">
            <Badge tone="info" dot>Демо-рекомендації</Badge>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
        <div className="border-b border-[var(--divider)] px-4 py-3 text-sm font-medium">Найкращі МПТ</div>
        <div className="divide-y divide-[var(--divider)]">
          {recos.map((r) => {
            const meta = mpts.find((m) => m.id === r.mptId)!;
            return (
              <div key={r.mptId} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-40 font-medium">{meta.label}</div>
                  <div className="text-xs text-[var(--secondary)]">ID: {meta.id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-right text-sm font-semibold">{r.score}</div>
                  <Button size="sm" onClick={() => addToPlans(r.mptId)}>У план</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}