import * as XLSX from "xlsx";

export type HiveRow = {
  hiveNo: string;        // Вулик №
  date: string;          // Дата (YYYY-MM-DD)
  occupied: number;      // Зайняті рамки
  broodFrames: number;   // Рамки розплоду (усього)
  open: number;          // Відкр.
  capped: number;        // Закр.
  note?: string;         // Примітка
};

export function exportHiveRowsToXLSX(rows: HiveRow[], filename = "hive-cards.xlsx") {
  const sheetData = [
    ["Вулик №","Дата","Зайняті рамки","Рамки розплоду","Відкр.","Закр.","Примітка"],
    ...rows.map(r => [
      r.hiveNo, r.date, r.occupied, r.broodFrames, r.open, r.capped, r.note ?? ""
    ]),
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "HiveCards");
  XLSX.writeFile(wb, filename);
}

