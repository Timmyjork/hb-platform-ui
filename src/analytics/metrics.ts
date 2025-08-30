import type { UnifiedRow } from "./selectors";

type Agg = { value: number; n: number };

const avg = (vals: number[]): Agg => {
  const a = vals.filter((v) => Number.isFinite(v));
  return { value: a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0, n: a.length };
};

export function avgEggsPerDay(rows: UnifiedRow[]): Agg {
  return avg(rows.map((r) => r.eggsPerDay ?? NaN));
}
export function avgSealedBroodFrames(rows: UnifiedRow[]): Agg {
  return avg(rows.map((r) => r.sealedBroodFrames ?? NaN));
}
export function hygienePctAvg(rows: UnifiedRow[]): Agg {
  return avg(rows.map((r) => r.hygienePct ?? NaN));
}
export function honeyKgAvg(rows: UnifiedRow[]): Agg {
  return avg(rows.map((r) => r.honeyKg ?? NaN));
}
export function springDevSpeedAvg(rows: UnifiedRow[]): Agg {
  return avg(rows.map((r) => r.springDev ?? NaN));
}

export function movingAvg(series: number[], window: number): number[] {
  if (window <= 1) return series.slice();
  const out: number[] = [];
  for (let i = 0; i < series.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1).filter((v) => Number.isFinite(v));
    out.push(slice.length ? slice.reduce((s, v) => s + v, 0) / slice.length : 0);
  }
  return out;
}

export function percentile(series: number[], p: number): number {
  const a = series.filter((v) => Number.isFinite(v)).sort((x, y) => x - y);
  if (!a.length) return 0;
  const idx = Math.min(a.length - 1, Math.max(0, Math.round((p / 100) * (a.length - 1))));
  return a[idx];
}

