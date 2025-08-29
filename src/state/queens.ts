// src/state/queens.ts
export type Queen = {
  id: string;
  breed: string;   // Порода / лінія
  year: number;
  si: number;      // селекційний індекс (для сортування/візуалки)
  bv: number;      // племінна цінність
  status: "Активна" | "На продаж" | "Архів";
};

const LS_KEY = "hb_buyer_queens_v1";

const seed: Queen[] = [
  { id: "UA-QUEEN-2025-001", breed: "Карніка / Peschetz", year: 2025, si: 82, bv: 12, status: "Активна" },
  { id: "UA-QUEEN-2025-014", breed: "Карпатка / Лінія Х", year: 2025, si: 79, bv: 9, status: "На продаж" },
  { id: "UA-QUEEN-2024-021", breed: "Бакфаст / B3",      year: 2024, si: 84, bv: 11, status: "Активна" },
  { id: "UA-QUEEN-2023-008", breed: "Місцева / L2",      year: 2023, si: 71, bv: 4,  status: "Архів"   },
];

export function loadQueens(): Queen[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Queen[]) : seed;
  } catch {
    return seed;
  }
}

export function saveQueens(rows: Queen[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

export function removeQueen(rows: Queen[], id: string) {
  const next = rows.filter(q => q.id !== id);
  saveQueens(next);
  return next;
}

export function addQueen(rows: Queen[], q: Queen) {
  const next = [q, ...rows];
  saveQueens(next);
  return next;
}
