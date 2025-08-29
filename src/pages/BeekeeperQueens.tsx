// src/pages/BeekeeperQueens.tsx
import React, { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  type Queen,
  loadQueens,
  saveQueens,
  removeQueen,
  addQueen,
} from "../state/queens";

const REASONS = [
  "Заміна на нову",
  "Зроїлась",
  "Втрата",
  "Захворіла колонія",
  "Стара",
  "Низька якість",
  "Інше",
];

export default function BeekeeperQueens() {
  const [rows, setRows] = useState<Queen[]>(() => loadQueens());
  const [q, setQ] = useState("");

  // простий пошук по id/breed
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (r) => r.id.toLowerCase().includes(s) || r.breed.toLowerCase().includes(s)
    );
  }, [rows, q]);

  function onRemove(id: string) {
    const reason = window.prompt(
      `Вкажіть причину видалення (одна з:\n${REASONS.join(
        ", "
      )}\nабо своя причина):`
    );
    if (!reason) return;
    const next = removeQueen(rows, id);
    setRows(next);
    // тут міг би бути toast “Успіх”, поки мінімально
  }

  function onAddDemo() {
    const now = Date.now();
    const num = Math.floor(now % 1000)
      .toString()
      .padStart(3, "0");
    const q: Queen = {
      id: `UA-QUEEN-2025-${num}`,
      breed: "Карніка / Demo",
      year: 2025,
      si: 76,
      bv: 8,
      status: "Активна",
    };
    const next = addQueen(rows, q);
    setRows(next);
  }

  function exportCSV() {
    const header = ["ID", "Порода / Лінія", "Рік", "SI", "BV", "Статус"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [r.id, r.breed, r.year, r.si, r.bv, r.status].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-queens.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setQ("");
  }

  // збереження при будь-якій зміні (на випадок майбутніх правок)
  React.useEffect(() => {
    saveQueens(rows);
  }, [rows]);

  return (
    <section aria-label="Мої матки / Куплені">
      {/* фільтри/дії */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Пошук за ID/породою…"
          className="w-72 rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <Button variant="secondary" onClick={resetFilters}>
          Скинути фільтри
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onAddDemo}>Додати тестову матку</Button>
          <Button variant="secondary" onClick={exportCSV}>
            Експорт CSV
          </Button>
        </div>
      </div>

      {/* таблиця */}
      <div className="overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
        <div className="grid grid-cols-[220px_1fr_100px_80px_80px_120px_120px] gap-2 border-b border-[var(--divider)] px-4 py-3 text-xs uppercase tracking-wide text-[var(--secondary)]">
          <div>ID / Назва</div>
          <div>Порода / Лінія</div>
          <div>Рік</div>
          <div>SI</div>
          <div>BV</div>
          <div>Статус</div>
          <div className="text-right">Дії</div>
        </div>

        {filtered.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[220px_1fr_100px_80px_80px_120px_120px] items-center gap-2 border-b border-[var(--divider)] px-4 py-3"
          >
            <div className="font-medium">{r.id}</div>
            <div className="truncate text-[var(--secondary)]">{r.breed}</div>
            <div>{r.year}</div>
            <div>{r.si}</div>
            <div>{r.bv}</div>
            <div>
              <Badge tone={r.status === "Активна" ? "success" : "default"} dot>
                {r.status}
              </Badge>
            </div>
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(r.id)}
                title="Видалити"
              >
                Видалити
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-[var(--secondary)]">
            Нічого не знайдено. Спробуйте інший запит або додайте тестову
            матку.
          </div>
        )}
      </div>
    </section>
  );
}
