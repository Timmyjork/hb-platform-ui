import * as XLSX from "xlsx";

export type PhenotypeRow = {
  queen_id: string;
  date: string;
  length_mm?: number;
  mass_pre_mg?: number;
  mass_post_mg?: number;
  color?: "світлий" | "жовтий" | "темний" | "чорний";
  abdomen_shape?: number;
  symmetry_ok?: "так" | "ні";
  symmetry_note?: string;
  aggression?: number;
  swarming?: number;
  hygiene_pct?: number;
  winter_hardiness?: number;
  egg_prod?: number;
  brood_density?: number;
  honey_kg?: number;
  winter_feed_kg?: number;
  spring_dev?: number;
  note?: string;
};

export const P_HEADERS = [
  "Queen ID",
  "Дата",
  "Довжина (мм)",
  "Маса до обльоту (мг)",
  "Маса після обльоту (мг)",
  "Колір (світлий/жовтий/темний/чорний)",
  "Форма черевця (1–5)",
  "Симетрія (так/ні)",
  "Коментар симетрії",
  "Агресивність (1–5)",
  "Схильність до роїння (1–5)",
  "Гігієнічна поведінка (%)",
  "Зимостійкість (1–5)",
  "Яйценосність (яєць/добу)",
  "Щільність засіву (1–5)",
  "Медова продуктивність (кг)",
  "Корма взимку (кг)",
  "Весняний розвиток (1–5)",
  "Примітка",
] as const;

export function examplePhenotypeRow(): PhenotypeRow {
  return {
    queen_id: "UA-QUEEN-2025-001",
    date: "2025-08-29",
    length_mm: 17.2,
    mass_pre_mg: 190,
    mass_post_mg: 205,
    color: "жовтий",
    abdomen_shape: 4,
    symmetry_ok: "так",
    aggression: 2,
    swarming: 2,
    hygiene_pct: 88,
    winter_hardiness: 4,
    egg_prod: 1500,
    brood_density: 4,
    honey_kg: 28,
    winter_feed_kg: 6,
    spring_dev: 4,
    note: "Сильний весняний старт",
  };
}

export function downloadPhenotypesTemplate(filename = "phenotypes-template.xlsx") {
  const demo = examplePhenotypeRow();
  const sheetData: (string | number)[][] = [
    [...P_HEADERS],
    [
      demo.queen_id,
      demo.date,
      demo.length_mm ?? "",
      demo.mass_pre_mg ?? "",
      demo.mass_post_mg ?? "",
      demo.color ?? "",
      demo.abdomen_shape ?? "",
      demo.symmetry_ok ?? "",
      demo.symmetry_note ?? "",
      demo.aggression ?? "",
      demo.swarming ?? "",
      demo.hygiene_pct ?? "",
      demo.winter_hardiness ?? "",
      demo.egg_prod ?? "",
      demo.brood_density ?? "",
      demo.honey_kg ?? "",
      demo.winter_feed_kg ?? "",
      demo.spring_dev ?? "",
      demo.note ?? "",
    ],
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Phenotypes");
  XLSX.writeFile(wb, filename);
}

export function exportPhenotypesXLSX(rows: PhenotypeRow[], filename = "phenotypes-export.xlsx") {
  const data: (string | number)[][] = [[...P_HEADERS]];
  for (const r of rows) {
    data.push([
      r.queen_id ?? "",
      r.date ?? "",
      r.length_mm ?? "",
      r.mass_pre_mg ?? "",
      r.mass_post_mg ?? "",
      r.color ?? "",
      r.abdomen_shape ?? "",
      r.symmetry_ok ?? "",
      r.symmetry_note ?? "",
      r.aggression ?? "",
      r.swarming ?? "",
      r.hygiene_pct ?? "",
      r.winter_hardiness ?? "",
      r.egg_prod ?? "",
      r.brood_density ?? "",
      r.honey_kg ?? "",
      r.winter_feed_kg ?? "",
      r.spring_dev ?? "",
      r.note ?? "",
    ]);
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Phenotypes");
  XLSX.writeFile(wb, filename);
}

export function parsePhenotypesXLSX(file: File): Promise<PhenotypeRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не вдалось прочитати файл"));
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
        const header = (rows[0] as unknown[]) ?? [];
        const want = P_HEADERS as unknown as string[];
        const ok = want.every((h, i) => (header[i] ?? "").toString().trim() === h);
        if (!ok) throw new Error("Невірні заголовки у файлі шаблону");

        const out: PhenotypeRow[] = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i] as unknown[];
          if (!r || r.length === 0) continue;
          const row: PhenotypeRow = {
            queen_id: String(r[0] ?? "").trim(),
            date: String(r[1] ?? "").trim(),
            length_mm: toNum(r[2]),
            mass_pre_mg: toNum(r[3]),
            mass_post_mg: toNum(r[4]),
            color: toStr(r[5]) as PhenotypeRow["color"],
            abdomen_shape: toInt(r[6]),
            symmetry_ok: toStr(r[7]) as PhenotypeRow["symmetry_ok"],
            symmetry_note: toStr(r[8]),
            aggression: toInt(r[9]),
            swarming: toInt(r[10]),
            hygiene_pct: toInt(r[11]),
            winter_hardiness: toInt(r[12]),
            egg_prod: toInt(r[13]),
            brood_density: toInt(r[14]),
            honey_kg: toNum(r[15]),
            winter_feed_kg: toNum(r[16]),
            spring_dev: toInt(r[17]),
            note: toStr(r[18]),
          };
          if (!row.queen_id) continue;
          out.push(row);
        }
        resolve(out);
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function toNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function toInt(v: unknown) {
  const n = Number(v);
  return Number.isInteger(n) ? n : undefined;
}
function toStr(v: unknown) {
  return v == null ? "" : String(v).trim();
}
