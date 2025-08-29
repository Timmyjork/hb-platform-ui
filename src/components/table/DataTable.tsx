// src/components/table/DataTable.tsx
import React, { useMemo, useState } from "react";
import Input from "../ui/Input";
import Badge from "../ui/Badge";

export type Row = {
  id: string;
  breed: string;
  year: number;
  si: number;
  bv: number;
  status: "Активна" | "На продаж" | "Архів";
};

export default function DataTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: keyof Row; dir: "asc" | "desc" }>({
    key: "si",
    dir: "desc",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.breed.toLowerCase().includes(q) ||
        String(r.year).includes(q)
    );
    res = res.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[sort.key] as any;
      const bv = b[sort.key] as any;
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
    });
    return res;
  }, [rows, query, sort]);

  const TH = (label: string, key?: keyof Row) => (
    <button
      className="flex w-full items-center justify-start gap-1 text-left"
      onClick={() =>
        key &&
        setSort((s) => ({
          key,
          dir: s.key === key && s.dir === "desc" ? "asc" : "desc",
        }))
      }
      aria-label={key ? `Сортувати за ${label}` : undefined}
    >
      <span>{label}</span>
      {key && (
        <span className="text-[10px] text-[var(--secondary)]">
          {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      )}
    </button>
  );

  return (
    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--divider)] px-4 py-3">
        <div className="text-sm font-medium">Дані</div>
        <div className="w-64">
          <Input
            placeholder="Пошук за ID/породою/роком…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div role="table" className="relative">
        {/* header */}
        <div
          role="rowgroup"
          className="sticky top-0 z-10 grid grid-cols-[220px_1fr_100px_100px_140px] border-b border-[var(--divider)] bg-[var(--surface)] px-4 py-2 text-xs uppercase tracking-wide text-[var(--secondary)]"
        >
          <div>{TH("ID / Назва", "id")}</div>
          <div>{TH("Порода / Лінія", "breed")}</div>
          <div>{TH("SI", "si")}</div>
          <div>{TH("BV", "bv")}</div>
          <div>{TH("Статус", "year")}</div>
        </div>

        {/* rows */}
        <div role="rowgroup" className="divide-y divide-[var(--divider)]">
          {filtered.map((r) => (
            <div
              key={r.id}
              role="row"
              className="grid grid-cols-[220px_1fr_100px_100px_140px] items-center px-4"
              style={{ height: 48 }}
            >
              <div className="truncate text-sm font-medium">{r.id}</div>
              <div className="truncate text-sm text-[var(--secondary)]">
                {r.breed} · {r.year}
              </div>
              <div className="text-sm">{r.si}</div>
              <div className="text-sm">{r.bv}</div>
              <div>
                <Badge
                  tone={
                    r.status === "Активна"
                      ? "success"
                      : r.status === "На продаж"
                      ? "info"
                      : "default"
                  }
                >
                  {r.status}
                </Badge>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-sm text-[var(--secondary)]">
              Нічого не знайдено за поточним фільтром
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
