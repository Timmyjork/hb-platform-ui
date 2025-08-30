import { applySegments, filterByDate, getHiveCards, getPhenotypes } from "../state/analytics";

export type UnifiedRow = {
  date: Date;
  queenId?: string;
  colonyId?: string;
  breed?: string;
  status?: string;
  source: "phenotypes" | "hive";
  eggsPerDay?: number;
  hygienePct?: number;
  honeyKg?: number;
  sealedBroodFrames?: number;
  springDev?: number;
  framesOccupied?: number;
};

export function selectFilteredRows(params: {
  from?: Date;
  to?: Date;
  breeds?: string[];
  statuses?: string[];
  sources?: { phenotypes: boolean; hivecards: boolean };
}): UnifiedRow[] {
  const { from, to, breeds, statuses, sources = { phenotypes: true, hivecards: true } } = params;
  const phenos = sources.phenotypes ? applySegments(filterByDate(getPhenotypes(), from, to), { breeds, statuses }) : [];
  const hives = sources.hivecards ? applySegments(filterByDate(getHiveCards(), from, to), { breeds, statuses }) : [];
  const rows: UnifiedRow[] = [];
  for (const p of phenos) {
    rows.push({
      date: p.date,
      queenId: p.queenId,
      colonyId: p.colonyId,
      breed: p.breed,
      status: p.status,
      source: "phenotypes",
      eggsPerDay: p.eggsPerDay,
      hygienePct: p.hygienePct,
      honeyKg: p.honeyKg,
      springDev: p.springDev,
    });
  }
  for (const h of hives) {
    rows.push({
      date: h.date,
      colonyId: h.colonyId,
      breed: h.breed,
      status: h.status,
      source: "hive",
      sealedBroodFrames: h.broodCapped,
      framesOccupied: h.framesOccupied,
    });
  }
  return rows.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export type Cohort = { key: string; label: string; rows: UnifiedRow[] };

export function buildCohorts(rows: UnifiedRow[], by: "breed" | "year" | "source" | "status"): Cohort[] {
  const map = new Map<string, UnifiedRow[]>();
  for (const r of rows) {
    let key = "";
    if (by === "breed") key = r.breed || "(невідомо)";
    else if (by === "status") key = r.status || "(невідомо)";
    else if (by === "source") key = r.source;
    else if (by === "year") key = String(r.date.getFullYear());
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([key, rs]) => ({ key, label: key, rows: rs }));
}

