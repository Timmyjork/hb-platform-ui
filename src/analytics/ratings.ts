export type SourceMeasure = {
  breederId: string;
  queenId?: string;
  date: string;        // ISO
  si?: number;         // 0..100
  bv?: number;         // -3..+3 normalized
  weight?: number;     // 0..1 (default 1)
  beekeeperId?: string;
};

export type BreederAggregate = {
  breederId: string;
  n: number;            // independent sources (beekeepers)
  m: number;            // total records
  si_avg: number;
  bv_avg: number;
  score: number;        // 0..100
  confidence: number;   // 0..1
  recency_days: number; // weighted avg age in days
  consistency: number;  // 0..1 (inverse variance)
};

export type RatingParams = {
  minRecords?: number;          // e.g., 8
  minSources?: number;          // e.g., 3
  recencyHalfLifeDays?: number; // e.g., 120
  bvWeight?: number;            // 0..1
  siWeight?: number;            // 0..1
  penaltyOutliers?: boolean;    // clip/penalize outliers
};

export function decayWeight(days: number, halfLife: number): number {
  if (!Number.isFinite(days) || !Number.isFinite(halfLife) || halfLife <= 0) return 1;
  return Math.pow(0.5, Math.max(0, days) / halfLife);
}

export function zScoreClip(x: number, mean: number, stdev: number, z = 2): number {
  if (!Number.isFinite(x) || !Number.isFinite(mean) || !Number.isFinite(stdev) || stdev <= 0) return x;
  const lo = mean - z * stdev;
  const hi = mean + z * stdev;
  return Math.min(hi, Math.max(lo, x));
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export function aggregateBreeders(rows: SourceMeasure[], params?: RatingParams): BreederAggregate[] {
  const now = new Date();
  const p = {
    minRecords: params?.minRecords ?? 8,
    minSources: params?.minSources ?? 3,
    recencyHalfLifeDays: params?.recencyHalfLifeDays ?? 120,
    bvWeight: params?.bvWeight ?? 0.4,
    siWeight: params?.siWeight ?? 0.6,
    penaltyOutliers: params?.penaltyOutliers ?? false,
  };
  const byBreeder = new Map<string, SourceMeasure[]>();
  for (const r of rows) {
    if (!r.breederId) continue;
    const arr = byBreeder.get(r.breederId) ?? [];
    arr.push(r);
    byBreeder.set(r.breederId, arr);
  }

  const out: BreederAggregate[] = [];
  for (const [breederId, arr] of byBreeder.entries()) {
    const m = arr.length;
    const sourcesSet = new Set(arr.map((r) => r.beekeeperId || r.queenId || 'anon'));
    const n = sourcesSet.size;
    if (m < (p.minRecords ?? 0) || n < (p.minSources ?? 0)) continue;

    // time decay weights
    const daysArr = arr.map((r) => {
      const d = new Date(r.date);
      const days = Math.max(0, Math.round((now.getTime() - d.getTime()) / (24 * 3600 * 1000)));
      return days;
    });
    const decays = daysArr.map((d) => decayWeight(d, p.recencyHalfLifeDays));

    // Outlier handling: compute preliminary stats
    const siVals = arr.map((r) => (typeof r.si === 'number' ? r.si! : NaN)).filter((x) => Number.isFinite(x));
    const bvVals = arr.map((r) => (typeof r.bv === 'number' ? r.bv! : NaN)).filter((x) => Number.isFinite(x));
    const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
    const stdev = (a: number[]) => {
      if (a.length < 2) return 0;
      const mu = mean(a);
      const v = a.reduce((s, v) => s + (v - mu) * (v - mu), 0) / (a.length - 1);
      return Math.sqrt(v);
    };
    const siMu = mean(siVals), siSd = stdev(siVals);
    const bvMu = mean(bvVals), bvSd = stdev(bvVals);

    // Base weights combine provided weight, decay, and independence cap.
    const baseW = arr.map((r, i) => clamp((r.weight ?? 1) * decays[i], 0, 1));
    // Cap per-beekeeper contribution to at most 50% of total weight
    const totalBase = baseW.reduce((s, v) => s + v, 0) || 1;
    const maxShare = 0.5 * totalBase;
    const byKeeperIdx = new Map<string, number[]>();
    arr.forEach((r, i) => {
      const key = r.beekeeperId || r.queenId || 'anon';
      const list = byKeeperIdx.get(key) ?? [];
      list.push(i);
      byKeeperIdx.set(key, list);
    });
    const w = baseW.slice();
    for (const [, idxs] of byKeeperIdx.entries()) {
      const sw = idxs.reduce((s, i) => s + w[i], 0);
      if (sw > maxShare && sw > 0) {
        const scale = maxShare / sw;
        for (const i of idxs) w[i] *= scale;
      }
    }
    const wSum = w.reduce((s, v) => s + v, 0) || 1;

    // Weighted averages with optional outlier clipping
    let siSum = 0, siW = 0, bvSum = 0, bvW = 0, ageSum = 0;
    const siUsed: number[] = []; const bvUsed: number[] = [];
    arr.forEach((r, i) => {
      const wi = w[i];
      ageSum += wi * daysArr[i];
      if (typeof r.si === 'number') {
        const v0 = r.si as number;
        const v = p.penaltyOutliers ? zScoreClip(v0, siMu, siSd, 2) : v0;
        siSum += wi * v; siW += wi; siUsed.push(v);
      }
      if (typeof r.bv === 'number') {
        const v0 = r.bv as number;
        const v = p.penaltyOutliers ? zScoreClip(v0, bvMu, bvSd, 2) : v0;
        bvSum += wi * v; bvW += wi; bvUsed.push(v);
      }
    });
    const si_avg = siW > 0 ? siSum / siW : 0;
    const bv_avg = bvW > 0 ? bvSum / bvW : 0;
    const recency_days = ageSum / wSum;

    // Consistency: inverse normalized variance of SI and BV
    const sdSi = stdev(siUsed);
    const sdBv = stdev(bvUsed);
    const normVar = (sdSi / 25) ** 2 * 0.5 + (sdBv / 1) ** 2 * 0.5; // 25 ~ quarter of SI range; 1 ~ third of BV range
    const consistency = 1 / (1 + normVar);

    // Confidence: function of n, m, consistency, recency
    const compN = clamp(n / (p.minSources || 1), 0, 1);
    const compM = clamp(m / (p.minRecords || 1), 0, 1);
    const compR = clamp(1 - recency_days / (p.recencyHalfLifeDays * 2), 0, 1);
    const confidence = clamp(0.3 * compN + 0.3 * compM + 0.2 * consistency + 0.2 * compR, 0, 1);

    // Score: combine SI and BV (normalized) + confidence
    const siNorm = clamp(si_avg / 100, 0, 1);
    const bvNorm = clamp((bv_avg + 3) / 6, 0, 1);
    const base = (p.siWeight * siNorm + p.bvWeight * bvNorm) / Math.max(1e-6, p.siWeight + p.bvWeight);
    const score = clamp(100 * (0.8 * base + 0.2 * confidence), 0, 100);

    out.push({ breederId, n, m, si_avg, bv_avg, score, confidence, recency_days, consistency });
  }

  // sort by score desc
  return out.sort((a, b) => b.score - a.score);
}
