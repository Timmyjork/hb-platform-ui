import { useState } from "react";

export interface HiveRow {
  hiveNo: string; // Вулик №
  date: string; // yyyy-mm-dd
  frames: number; // Зайняті рамки
  broodFrames: number; // Рамки розплоду
  openBrood: number; // Відкритий розплід
  sealedBrood: number; // Закритий розплід
  notes: string; // Примітка
}

export default function HiveCardTable() {
  const [rows, setRows] = useState<HiveRow[]>([
    { hiveNo: "", date: "", frames: 0, broodFrames: 0, openBrood: 0, sealedBrood: 0, notes: "" },
  ]);

  const updateRow = <K extends keyof HiveRow>(i: number, k: K, v: HiveRow[K]) => {
    setRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, [k]: v } as HiveRow : row)));
  };

  const addRow = () =>
    setRows((r) => [
      ...r,
      { hiveNo: "", date: "", frames: 0, broodFrames: 0, openBrood: 0, sealedBrood: 0, notes: "" },
    ]);

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Вуликова карта</h2>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Вулик №",
                "Дата",
                "Зайняті рамки",
                "Рамки розплоду",
                "Відкр.",
                "Закр.",
                "Примітка",
              ].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[var(--secondary)] border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-[var(--divider)] bg-[var(--surface)] px-2 py-1"
                    value={r.hiveNo}
                    onChange={(e) => updateRow(i, "hiveNo", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    className="w-full rounded border border-[var(--divider)] bg-[var(--surface)] px-2 py-1"
                    value={r.date}
                    onChange={(e) => updateRow(i, "date", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-full rounded border border-[var(--divider)] bg-[var(--surface)] px-2 py-1"
                    value={r.frames}
                    onChange={(e) => updateRow(i, "frames", Number(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-full rounded border border-[var(--divider)] bg-[var(--surface)] px-2 py-1"
                    value={r.broodFrames}
                    onChange={(e) => updateRow(i, "broodFrames", Number(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-full rounded border border-[var(--divider)] bg-[var(--surface)] px-2 py-1"
                    value={r.openBrood}
                    onChange={(e) => updateRow(i, "openBrood", Number(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-full rounded border border-[var(--divider)] bg-[var(--surface)] px-2 py-1"
                    value={r.sealedBrood}
                    onChange={(e) => updateRow(i, "sealedBrood", Number(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2">
                  <textarea
                    className="w-full rounded border border-[var(--divider)] bg-[var(--surface)] px-2 py-1"
                    value={r.notes}
                    onChange={(e) => updateRow(i, "notes", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        className="mt-4 rounded bg-[var(--primary)] px-4 py-2 text-white"
      >
        + Додати рядок
      </button>
    </div>
  );
}
