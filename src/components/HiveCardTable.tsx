import { useRef, useState } from "react";

const CSV_HEADERS = [
  "Вулик №",
  "Дата",
  "Зайняті рамки",
  "Рамки розплоду",
  "Відкр.",
  "Закр.",
  "Примітка",
] as const;

function toCSV(rows: number) {
  const header = CSV_HEADERS.join(",");
  const emptyRow = Array(CSV_HEADERS.length).fill("").join(",");
  return [header, ...Array.from({ length: rows }, () => emptyRow)].join("\n");
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
  const fileRef = useRef<HTMLInputElement>(null);

  const updateRow = <K extends keyof HiveRow>(i: number, k: K, v: HiveRow[K]) => {
    setRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, [k]: v } as HiveRow : row)));
  };

  const addRow = () =>
    setRows((r) => [
      ...r,
      { hiveNo: "", date: "", frames: 0, broodFrames: 0, openBrood: 0, sealedBrood: 0, notes: "" },
    ]);

  function rowsToCSV(data: HiveRow[]): string {
    const header = [
      "Вулик №",
      "Дата",
      "Зайняті рамки",
      "Рамки розплоду",
      "Відкр.",
      "Закр.",
      "Примітка",
    ];
    const escape = (v: unknown) => {
      const s = String(v ?? "");
      const needs = /[",\n\r]/.test(s);
      const doubled = s.replace(/"/g, '""');
      return needs ? `"${doubled}"` : doubled;
    };
    const body = data.map((r) =>
      [r.hiveNo, r.date, r.frames, r.broodFrames, r.openBrood, r.sealedBrood, r.notes]
        .map(escape)
        .join(",")
    );
    return [header.join(","), ...body].join("\r\n");
  }

  function handleExportCSV() {
    if (!rows || rows.length === 0) {
      alert("Немає даних для експорту");
      return;
    }
    const csv = rowsToCSV(rows);
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    downloadCSV(`hive-card-${yyyy}-${mm}-${dd}.csv`, csv);
  }

  function parseCSV(text: string): string[][] {
    const rows: string[][] = [];
    let cur: string[] = [], cell = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1];
      if (inQuotes) {
        if (ch === '"' && next === '"') { cell += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { cell += ch; }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { cur.push(cell); cell = ""; }
        else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && next === '\n') i++;
          cur.push(cell); cell = "";
          if (cur.some(v => v.trim() !== "")) rows.push(cur);
          cur = [];
        } else { cell += ch; }
      }
    }
    if (cell.length || cur.length) { cur.push(cell); if (cur.some(v => v.trim() !== "")) rows.push(cur); }
    return rows;
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const rowsCsv = parseCSV(text);
    if (!rowsCsv.length) return;

    const [header, ...data] = rowsCsv;
    const normalize = (s: string) => s.trim().toLowerCase();
    const idx = (label: string) => header.findIndex((h) => normalize(h) === normalize(label));

    const map = {
      hiveNo: idx("Вулик №"),
      date: idx("Дата"),
      frames: idx("Зайняті рамки"),
      broodFrames: idx("Рамки розплоду"),
      openBrood: idx("Відкр."),
      sealedBrood: idx("Закр."),
      notes: idx("Примітка"),
    } as const;

    if (map.hiveNo < 0 || map.date < 0) {
      alert("Некоректний шаблон CSV: немає обов’язкових колонок");
      return;
    }

    const imported: HiveRow[] = data
      .map((r) => ({
        hiveNo: r[map.hiveNo] ?? "",
        date: r[map.date] ?? "",
        frames: Number(r[map.frames] ?? 0) || 0,
        broodFrames: Number(r[map.broodFrames] ?? 0) || 0,
        openBrood: Number(r[map.openBrood] ?? 0) || 0,
        sealedBrood: Number(r[map.sealedBrood] ?? 0) || 0,
        notes: r[map.notes] ?? "",
      }))
      .filter((x) =>
        [x.hiveNo, x.date, x.notes].some((v) => (v ?? "").trim() !== "") ||
        [x.frames, x.broodFrames, x.openBrood, x.sealedBrood].some((n) => Number(n) > 0)
      );

    if (!imported.length) return;
    setRows((prev) => [...prev, ...imported]);
  }

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Вуликова карта</h2>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f).finally(() => (e.currentTarget.value = ""));
            }}
          />
          <button
            type="button"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={() => fileRef.current?.click()}
          >
            Імпорт з CSV
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={handleExportCSV}
          >
            Експорт у CSV
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-md bg-[var(--primary)] text-white text-sm"
            onClick={() => downloadCSV("hive-card-template.csv", toCSV(20))}
          >
            Скачати шаблон (CSV)
          </button>
        </div>
      </div>
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
