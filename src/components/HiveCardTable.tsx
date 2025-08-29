import { useEffect, useRef, useState } from "react";

const CSV_HEADERS = [
  "Вулик №",
  "Дата",
  "Зайняті рамки",
  "Рамки розплоду",
  "Відкр.",
  "Закр.",
  "Примітка",
] as const;
const CSV_HEADER = CSV_HEADERS;

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
  id: string; // унікальний ключ
  hiveNo: string; // Вулик №
  date: string; // yyyy-mm-dd
  frames: number; // Зайняті рамки
  broodFrames: number; // Рамки розплоду
  openBrood: number; // Відкритий розплід
  sealedBrood: number; // Закритий розплід
  notes: string; // Примітка
}

function makeEmptyRow(): HiveRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    hiveNo: "",
    date: "",
    frames: 0,
    broodFrames: 0,
    openBrood: 0,
    sealedBrood: 0,
    notes: "",
  };
}

const DEFAULT_ROWS: HiveRow[] = [makeEmptyRow()];

const LS_KEY = "hiveCard.rows.v1" as const;

export default function HiveCardTable() {
  const [rows, setRows] = useState<HiveRow[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return DEFAULT_ROWS;
      const parsed = JSON.parse(raw) as Partial<HiveRow>[];
      return parsed.map((r, i) => ({
        id:
          r && typeof r.id === "string" && r.id.length
            ? r.id
            : `row-${Date.now()}-${i}`,
        hiveNo: String(r?.hiveNo ?? ""),
        date: String(r?.date ?? ""),
        frames: Number(r?.frames ?? 0),
        broodFrames: Number(r?.broodFrames ?? 0),
        openBrood: Number(r?.openBrood ?? 0),
        sealedBrood: Number(r?.sealedBrood ?? 0),
        notes: String(r?.notes ?? ""),
      }));
    } catch {
      return DEFAULT_ROWS;
    }
  });
  const fileRef = useRef<HTMLInputElement>(null);

  function updateCell<K extends keyof HiveRow>(id: string, key: K, value: HiveRow[K]) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } as HiveRow : r))
    );
  }

  function addRow() {
    const newRow = makeEmptyRow();
    setRows((prev) => [newRow, ...prev]);
  }

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(rows));
    } catch {
      /* ignore */
    }
  }, [rows]);

  function handleClear() {
    if (!confirm("Очистити всі рядки?")) return;
    setRows([]);
  }

  function handleResetTemplate() {
    if (!confirm("Повернути початковий шаблон?")) return;
    setRows(DEFAULT_ROWS);
  }

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

  type CsvRow = {
    hiveNo: string;
    date: string; // YYYY-MM-DD
    occupied: number;
    broodFrames: number;
    open: number;
    sealed: number;
    note: string;
  };

  function parseCSVText(text: string): string[][] {
    const rows: string[][] = [];
    let cur = "";
    let row: string[] = [];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (inQuotes) {
        if (ch === '"' && next === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { cur += ch; }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { row.push(cur); cur = ""; }
        else if (ch === '\r') { /* wait for \n */ }
        else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ""; }
        else { cur += ch; }
      }
    }
    if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
    return rows;
  }

  function mapCsv(rowsRaw: string[][]): CsvRow[] {
    if (!rowsRaw.length) return [];
    const header = rowsRaw[0];
    const expected = CSV_HEADER.join(",");
    const got = header.join(",");
    if (got !== expected) {
      throw new Error("Невірні заголовки CSV. Очікується: " + expected);
    }
    const out: CsvRow[] = [];
    for (let i = 1; i < rowsRaw.length; i++) {
      const r = rowsRaw[i];
      if (r.length === 1 && r[0].trim() === "") continue;
      const [hiveNo, date, occupied, broodFrames, open, sealed, note] = r;
      const num = (v: string) => {
        const n = Number(v);
        if (!Number.isFinite(n)) throw new Error(`Помилка у числовому полі (рядок ${i + 1}): "${v}"`);
        return n;
      };
      out.push({
        hiveNo: (hiveNo ?? "").trim(),
        date: (date ?? "").trim(),
        occupied: num(occupied ?? "0"),
        broodFrames: num(broodFrames ?? "0"),
        open: num(open ?? "0"),
        sealed: num(sealed ?? "0"),
        note: (note ?? "").trim(),
      });
    }
    return out;
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const raw = parseCSVText(text);
      const parsed = mapCsv(raw);
      setRows((prev) => {
        const key = (r: HiveRow) => `${r.hiveNo}#${r.date}`;
        const map = new Map(prev.map((r) => [key(r), r] as const));
        for (const r of parsed) {
          const k = `${r.hiveNo}#${r.date}`;
          const existing = map.get(k);
          const nr: HiveRow = {
            id: existing?.id ?? k,
            hiveNo: r.hiveNo,
            date: r.date,
            frames: r.occupied,
            broodFrames: r.broodFrames,
            openBrood: r.open,
            sealedBrood: r.sealed,
            notes: r.note,
          };
          map.set(k, { ...(existing ?? nr), ...nr });
        }
        return Array.from(map.values());
      });
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message: string }).message) : 'Помилка імпорту CSV';
      alert(msg);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Вуликова карта</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={addRow}
          >
            Додати рядок
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={handleClear}
          >
            Очистити
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={handleResetTemplate}
          >
            Скинути до шаблону
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
          <button
            type="button"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={handleImportClick}
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
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--divider)] hover:bg-gray-50">
                <td className="p-2">
                  <input
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={row.hiveNo}
                    onChange={(e) => updateCell(row.id, "hiveNo", e.target.value)}
                    placeholder="№"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="date"
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={row.date}
                    onChange={(e) => updateCell(row.id, "date", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={row.frames}
                    onChange={(e) => updateCell(row.id, "frames", Number(e.target.value || 0))}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={row.broodFrames}
                    onChange={(e) => updateCell(row.id, "broodFrames", Number(e.target.value || 0))}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={row.openBrood}
                    onChange={(e) => updateCell(row.id, "openBrood", Number(e.target.value || 0))}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={row.sealedBrood}
                    onChange={(e) => updateCell(row.id, "sealedBrood", Number(e.target.value || 0))}
                  />
                </td>
                <td className="p-2">
                  <textarea
                    rows={1}
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={row.notes}
                    onChange={(e) => updateCell(row.id, "notes", e.target.value)}
                    placeholder="Коментарі..."
                  />
                </td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    className="px-2 py-1 rounded-md border text-sm"
                    onClick={() => {
                      if (!confirm("Видалити рядок?")) return;
                      setRows((prev) => prev.filter((r) => r.id !== row.id));
                    }}
                  >
                    Видалити
                  </button>
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
