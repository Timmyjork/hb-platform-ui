import React from "react";
import { exportCSV, exportXLSX } from "../../utils/export";

type Row = Record<string, unknown> & { date?: Date };

export default function DrilldownModal({ rows, onClose }: { rows: Row[]; onClose: () => void }) {
  const headers = React.useMemo(() => {
    const base = ["date", "queenId", "colonyId", "breed", "status", "source", "eggsPerDay", "hygienePct", "honeyKg", "sealedBroodFrames", "springDev", "framesOccupied"];
    // Include any extra keys present
    const others = new Set<string>();
    for (const r of rows) Object.keys(r).forEach((k) => others.add(k));
    return Array.from(new Set([...base, ...others]));
  }, [rows]);

  const flatRows = rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const h of headers) o[h] = h === "date" && r.date instanceof Date ? r.date.toISOString().slice(0, 10) : (r as Record<string, unknown>)[h];
    return o;
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Drill-down</div>
          <div className="flex items-center gap-2 text-sm">
            <button className="rounded-md border px-2 py-1" onClick={() => exportCSV("drilldown.csv", flatRows)}>Export CSV</button>
            <button className="rounded-md border px-2 py-1" onClick={() => exportXLSX("drilldown.xlsx", { Rows: flatRows })}>Export XLSX</button>
            <button className="rounded-md border px-2 py-1" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto border border-[var(--divider)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => <th key={h} className="px-2 py-1 text-left border-b">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {flatRows.map((r, i) => (
                <tr key={i} className="border-t">
                  {headers.map((h) => <td key={h} className="px-2 py-1">{String(r[h] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
