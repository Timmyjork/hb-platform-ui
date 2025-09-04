export type MetricKey = 'si' | 'bv' | 'honey_kg' | 'egg_day' | 'hygienic_pct';

export type AlertRule = {
  id: string;
  title: string;
  scope: 'global' | 'region' | 'breeder';
  scopeId?: string;
  metric: MetricKey;
  mode: 'threshold' | 'zscore' | 'ma-delta';
  threshold?: number;
  z?: number;
  maWindow?: number;
  deltaPct?: number; // e.g. 20 means >=20%
  minRecords?: number;
  halfLifeDays?: number;
  enabled: boolean;
};

export type AlertSignal = {
  ruleId: string;
  at: string;
  scope: AlertRule['scope'];
  scopeId?: string;
  metric: MetricKey;
  value: number | null;
  contextCount: number;
  kind: 'warning' | 'critical';
};

export type TimePoint = { at: string; value: number | null };

export function zScore(value: number, mean: number, stdev: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(mean) || !Number.isFinite(stdev) || stdev === 0) return 0;
  return (value - mean) / stdev;
}

export function movingAverage(series: TimePoint[], window: number): TimePoint[] {
  if (window <= 0) return series.slice();
  const out: TimePoint[] = [];
  const vals: number[] = [];
  for (let i = 0; i < series.length; i++) {
    const v = Number(series[i].value);
    if (Number.isFinite(v)) vals.push(v);
    if (vals.length > window) vals.shift();
    const mean = vals.length ? vals.reduce((s, x) => s + x, 0) / vals.length : NaN;
    out.push({ at: series[i].at, value: Number.isFinite(mean) ? mean : null });
  }
  return out;
}

export function decayWeight(days: number, halfLife: number): number {
  if (!Number.isFinite(days) || !Number.isFinite(halfLife) || halfLife <= 0) return 1;
  return Math.pow(0.5, Math.max(0, days) / halfLife);
}

function weightedStats(points: TimePoint[], halfLife?: number): { mean: number; stdev: number; count: number } {
  if (!points.length) return { mean: 0, stdev: 0, count: 0 };
  const now = new Date(points[points.length - 1].at);
  let wsum = 0, vsum = 0;
  const vals: { v: number; w: number }[] = [];
  for (const p of points) {
    if (!Number.isFinite(Number(p.value))) continue;
    const days = (now.getTime() - new Date(p.at).getTime()) / (24 * 3600 * 1000);
    const w = halfLife ? decayWeight(days, halfLife) : 1;
    vals.push({ v: Number(p.value), w });
    wsum += w; vsum += w * Number(p.value);
  }
  const mean = wsum > 0 ? vsum / wsum : 0;
  let varsum = 0, wcount = 0;
  for (const { v, w } of vals) { varsum += w * (v - mean) * (v - mean); wcount += w; }
  const stdev = wcount > 0 ? Math.sqrt(varsum / wcount) : 0;
  return { mean, stdev, count: vals.length };
}

export function detectAnomalies(series: TimePoint[], rule: AlertRule): AlertSignal[] {
  if (!rule.enabled) return [];
  const signals: AlertSignal[] = [];
  const minN = rule.minRecords ?? 3;
  if (!series.length) return signals;
  const halfLife = rule.halfLifeDays;
  const window = rule.maWindow ?? 5;
  if (rule.mode === 'threshold') {
    for (const p of series) {
      const v = Number(p.value);
      if (!Number.isFinite(v)) continue;
      if (typeof rule.threshold === 'number') {
        const crit = v >= rule.threshold;
        const warn = !crit && v >= rule.threshold * 0.9;
        if (crit || warn) {
          const ctx = Math.min(series.length, Math.max(minN, 1));
          signals.push({ ruleId: rule.id, at: p.at, scope: rule.scope, scopeId: rule.scopeId, metric: rule.metric, value: v, contextCount: ctx, kind: crit ? 'critical' : 'warning' });
        }
      }
    }
    return signals;
  }

  if (rule.mode === 'zscore') {
    for (let i = 1; i < series.length; i++) {
      const ctx = series.slice(Math.max(0, i - Math.max(minN, 5)), i);
      if (ctx.length < minN) continue;
      const { mean, stdev } = weightedStats(ctx, halfLife);
      const v = Number(series[i].value);
      if (!Number.isFinite(v)) continue;
      const z = zScore(v, mean, stdev);
      const lim = rule.z ?? 2.5;
      if (Math.abs(z) >= lim) {
        signals.push({ ruleId: rule.id, at: series[i].at, scope: rule.scope, scopeId: rule.scopeId, metric: rule.metric, value: v, contextCount: ctx.length, kind: Math.abs(z) >= lim + 1 ? 'critical' : 'warning' });
      }
    }
    return signals;
  }

  // ma-delta
  const ma = movingAverage(series, window);
  for (let i = window + 1; i < ma.length; i++) {
    const prev = Number(ma[i - 1].value);
    const curr = Number(ma[i].value);
    if (!Number.isFinite(prev) || !Number.isFinite(curr) || prev === 0) continue;
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    const lim = rule.deltaPct ?? 20;
    const ctx = series.slice(Math.max(0, i - window), i + 1);
    if (ctx.length < minN) continue;
    if (Math.abs(pct) >= lim) {
      signals.push({ ruleId: rule.id, at: series[i].at, scope: rule.scope, scopeId: rule.scopeId, metric: rule.metric, value: Number(series[i].value), contextCount: ctx.length, kind: Math.abs(pct) >= lim * 1.5 ? 'critical' : 'warning' });
    }
  }
  return signals;
}

// Fetch series helper (demo/local)
export type FetchSeriesParams = { from?: string; to?: string; scope: AlertRule['scope']; scopeId?: string; metric: MetricKey };
export async function fetchMetricSeries(p: FetchSeriesParams): Promise<TimePoint[]> {
  // Build a simple synthetic series for now, trending upward with noise so rules can trigger in tests.
  const now = new Date();
  const out: TimePoint[] = [];
  const N = 30;
  for (let i = N - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const base = p.metric === 'si' ? 70 : p.metric === 'bv' ? 0.5 : p.metric === 'honey_kg' ? 10 : p.metric === 'egg_day' ? 1000 : 80;
    const trend = (N - i) * (p.metric === 'si' ? 0.4 : p.metric === 'bv' ? 0.02 : 0.1);
    const noise = (i % 5 === 0) ? 3 : 0;
    const v = base + trend + noise;
    out.push({ at: d.toISOString(), value: v });
  }
  return out;
}

