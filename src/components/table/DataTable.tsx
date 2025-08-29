import React from "react";

export type Row = {
  id: string;
  breed: string;
  year: number;
  si: number;
  bv: number;
  status: string;
};

type Props = {
  rows: Row[];
};

type Column = {
  key: keyof Row;
  label: string;
  cell?: (row: Row) => React.ReactNode;
};

const columns: Column[] = [
  { key: "id", label: "ID" },
  { key: "breed", label: "Порода / Лінія" },
  { key: "year", label: "Рік" },
  { key: "si", label: "SI" },
  { key: "bv", label: "BV" },
  { key: "status", label: "Статус" },
];

export default function DataTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key as string} className="px-3 py-2 font-medium text-[var(--secondary)]">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[var(--divider)] hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key as string} className="px-3 py-2">
                  {c.cell ? c.cell(row) : (row[c.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
