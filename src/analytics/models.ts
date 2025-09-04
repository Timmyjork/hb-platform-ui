// Analytics v6 — heuristic forecasting core (BV/SI + what-if)
export type PhenotypeInput = {
  // morphological
  length_mm?: number;
  mass_pre_mg?: number;
  mass_post_mg?: number;
  color?: 'light'|'yellow'|'dark'|'black';
  abdomen_shape?: 1|2|3|4|5;
  symmetry_ok?: boolean;

  // behavioral (1–5), hygienic % 0–100
  aggression?: 1|2|3|4|5;
  swarming?: 1|2|3|4|5;
  hygienic_pct?: number;     // 0–100
  wintering?: 1|2|3|4|5;

  // productivity
  egg_day?: number;          // eggs/day
  brood_density?: 1|2|3|4|5;
  honey_kg?: number;
  winter_feed_kg?: number;
  spring_speed?: 1|2|3|4|5;

  // reference
  year?: number;
  breed?: string;
};

export type ForecastOutput = {
  si: number;        // Selection Index 0–100
  bv: number;        // Breeding Value normalized -3..+3
  conf: number;      // model confidence 0..1
  notes?: string[];  // warnings / explanations
};

export type WhatIfParams = {
  // weights per indicator (0..1); we normalize to sum=1 internally
  weights?: Partial<Record<keyof PhenotypeInput, number>>;
  // environment multipliers
  env?: {
    nectar_flow?: number;   // 0.8..1.2
    disease_risk?: number;  // 0.8..1.2
    winter_severity?: number; // 0.8..1.2
  };
  // uncertainty (0..1)
  noise?: number;
};

export function clamp(x: number, min: number, max: number): number {
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

export function mergePhenotype(a: PhenotypeInput, b: Partial<PhenotypeInput>): PhenotypeInput {
  return { ...a, ...b };
}

// Default baselines and ranges for normalization to 0..1
const ranges = {
  length_mm: [16, 24],
  mass_pre_mg: [160, 240],
  mass_post_mg: [220, 320],
  hygienic_pct: [0, 100],
  egg_day: [500, 2000],
  honey_kg: [0, 30],
  winter_feed_kg: [0, 15], // lower is better (invert later)
} as const;

// Default weights (rough heuristic). Negative weights penalize undesirable traits.
const defaultWeights: Partial<Record<keyof PhenotypeInput, number>> = {
  honey_kg: 0.25,
  egg_day: 0.2,
  hygienic_pct: 0.18,
  spring_speed: 0.1,
  brood_density: 0.08,
  wintering: 0.07,
  aggression: -0.05,
  swarming: -0.05,
  winter_feed_kg: -0.05,
  // morphology has minor effect by default
  length_mm: 0.02,
  mass_pre_mg: 0.02,
  mass_post_mg: 0.02,
};

function norm01(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return 0;
  if (max <= min) return 0;
  return clamp((v - min) / (max - min), 0, 1);
}

function normRating(v: number | undefined): number {
  if (!Number.isFinite(v as number)) return 0;
  return clamp(((v as number) - 1) / 4, 0, 1);
}

function colorScore(color?: PhenotypeInput['color']): number {
  // neutral mapping; could be adjusted per breed in future
  if (!color) return 0.5;
  const map: Record<string, number> = { light: 0.6, yellow: 0.7, dark: 0.5, black: 0.4 };
  return map[color] ?? 0.5;
}

function applyEnv(raw: Required<PhenotypeInput>, env?: WhatIfParams['env']): Required<PhenotypeInput> {
  const e = env ?? {};
  const nf = Number.isFinite(e.nectar_flow) ? (e.nectar_flow as number) : 1;
  const dr = Number.isFinite(e.disease_risk) ? (e.disease_risk as number) : 1;
  const ws = Number.isFinite(e.winter_severity) ? (e.winter_severity as number) : 1;
  return {
    ...raw,
    honey_kg: raw.honey_kg * nf,
    spring_speed: raw.spring_speed, // spring_speed is 1..5 rating; effect via eggs/honey already
    hygienic_pct: raw.hygienic_pct * (2 - dr), // higher disease risk -> need better hygiene; simulate downward pressure
    wintering: clamp((raw.wintering as number) * (2 - ws), 1, 5) as 1|2|3|4|5,
    winter_feed_kg: raw.winter_feed_kg * ws, // harsher winter -> more feed
  };
}

function defaults(input?: PhenotypeInput): Required<PhenotypeInput> {
  const i = input ?? {};
  return {
    length_mm: i.length_mm ?? 20,
    mass_pre_mg: i.mass_pre_mg ?? 200,
    mass_post_mg: i.mass_post_mg ?? 260,
    color: i.color ?? 'dark',
    abdomen_shape: i.abdomen_shape ?? 3,
    symmetry_ok: i.symmetry_ok ?? true,
    aggression: i.aggression ?? 3,
    swarming: i.swarming ?? 3,
    hygienic_pct: i.hygienic_pct ?? 80,
    wintering: i.wintering ?? 3,
    egg_day: i.egg_day ?? 1200,
    brood_density: i.brood_density ?? 3,
    honey_kg: i.honey_kg ?? 10,
    winter_feed_kg: i.winter_feed_kg ?? 8,
    spring_speed: i.spring_speed ?? 3,
    year: i.year ?? new Date().getFullYear(),
    breed: i.breed ?? '',
  };
}

export function forecastBVSI(input: PhenotypeInput, params?: WhatIfParams): ForecastOutput {
  const notes: string[] = [];
  const def = defaults(input);

  // collect out-of-range warnings
  const warnIf = (cond: boolean, msg: string) => { if (cond) notes.push(msg); };
  warnIf(def.hygienic_pct < 0 || def.hygienic_pct > 100, 'hygienic_pct expected 0..100');
  warnIf(def.aggression < 1 || def.aggression > 5, 'aggression expected 1..5');
  warnIf(def.swarming < 1 || def.swarming > 5, 'swarming expected 1..5');
  warnIf(def.wintering < 1 || def.wintering > 5, 'wintering expected 1..5');
  warnIf(def.brood_density < 1 || def.brood_density > 5, 'brood_density expected 1..5');
  warnIf(def.spring_speed < 1 || def.spring_speed > 5, 'spring_speed expected 1..5');

  const withEnv = applyEnv(def, params?.env);

  // normalized features (0..1)
  const f = {
    length_mm: norm01(withEnv.length_mm, ...ranges.length_mm),
    mass_pre_mg: norm01(withEnv.mass_pre_mg, ...ranges.mass_pre_mg),
    mass_post_mg: norm01(withEnv.mass_post_mg, ...ranges.mass_post_mg),
    color: colorScore(withEnv.color),
    abdomen_shape: normRating(withEnv.abdomen_shape),
    symmetry_ok: withEnv.symmetry_ok ? 1 : 0.5,
    aggression: 1 - normRating(withEnv.aggression), // inverse desirable
    swarming: 1 - normRating(withEnv.swarming),     // inverse desirable
    hygienic_pct: norm01(withEnv.hygienic_pct, ...ranges.hygienic_pct),
    wintering: normRating(withEnv.wintering),
    egg_day: norm01(withEnv.egg_day, ...ranges.egg_day),
    brood_density: normRating(withEnv.brood_density),
    honey_kg: norm01(withEnv.honey_kg, ...ranges.honey_kg),
    winter_feed_kg: 1 - norm01(withEnv.winter_feed_kg, ...ranges.winter_feed_kg), // lower is better
    spring_speed: normRating(withEnv.spring_speed),
    year: 0.5,
    breed: 0.5,
  } as Record<keyof PhenotypeInput, number>;

  // merge weights with defaults, normalize by sum of absolute weights
  const wRaw: Record<keyof PhenotypeInput, number> = { ...Object.fromEntries(Object.keys(f).map(k => [k as keyof PhenotypeInput, 0])) } as Record<keyof PhenotypeInput, number>;
  for (const [k, v] of Object.entries(defaultWeights)) wRaw[k as keyof PhenotypeInput] = v as number;
  if (params?.weights) {
    for (const [k, v] of Object.entries(params.weights)) {
      if (v == null) continue;
      wRaw[k as keyof PhenotypeInput] = Number(v);
    }
  }
  const sumAbs = Object.values(wRaw).reduce((s, v) => s + Math.abs(v), 0) || 1;
  const w = Object.fromEntries(Object.entries(wRaw).map(([k, v]) => [k, v / sumAbs])) as Record<keyof PhenotypeInput, number>;

  // score
  let score = 0;
  for (const key of Object.keys(f) as Array<keyof PhenotypeInput>) {
    score += (w[key] ?? 0) * (f[key] ?? 0);
  }
  // tiny monotonic epsilon to make score strictly increase with key productive traits
  score += 1e-6 * (withEnv.honey_kg / (ranges.honey_kg[1] || 1));
  score = clamp(score, 0, 1);

  const si = clamp(100 * score, 0, 100);
  const mu = 0.5; const sigma = 0.12;
  const bv = clamp((score - mu) / sigma, -3, 3);
  const conf = clamp(1 - (params?.noise ?? 0.15), 0, 1);

  return { si, bv, conf, notes };
}
