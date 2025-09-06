import type { PhenotypeInput } from './models'
import type { SourceMeasure } from './ratings'
import { getPhenotypes, getHiveCards, filterByDate, type PhenotypeEntry, type HiveCardEntry } from '../state/analytics'
import { forecastBVSI } from './models'
import type { RegionalMeasure } from './regional'
import { listQueens } from '../state/queens.store'
import { parseQueenId as parseQId } from '../utils/queenId'
import { listObservationsByQueen } from '../state/observations.store'
import { traitsToSI_BV } from './traits'
import type { TenTraits } from '../types/queen'

function completeTraits(base: TenTraits, patch?: Partial<TenTraits>): TenTraits {
  return { ...base, ...(patch || {}) }
}

export async function fromLatestPhenotype(): Promise<PhenotypeInput|null> {
  const rows = getPhenotypes();
  if (!rows.length) return null;
  const latest = rows.slice().sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  return mapPhenotype(latest);
}

function mapPhenotype(p: PhenotypeEntry): PhenotypeInput {
  return {
    length_mm: p.lengthMm,
    mass_pre_mg: p.massPreMg,
    mass_post_mg: p.massPostMg,
    color: (p.color as unknown as import('./models').PhenotypeInput['color']) || undefined,
    abdomen_shape: (p.abdomenShape as unknown as NonNullable<import('./models').PhenotypeInput['abdomen_shape']>) || undefined,
    symmetry_ok: p.symmetryOk,
    aggression: (p.aggression as unknown as NonNullable<import('./models').PhenotypeInput['aggression']>) || undefined,
    swarming: (p.swarming as unknown as NonNullable<import('./models').PhenotypeInput['swarming']>) || undefined,
    hygienic_pct: p.hygienePct,
    wintering: (p.winterHardiness as unknown as NonNullable<import('./models').PhenotypeInput['wintering']>) || undefined,
    egg_day: p.eggsPerDay,
    brood_density: (p.broodDensity as unknown as NonNullable<import('./models').PhenotypeInput['brood_density']>) || undefined,
    honey_kg: p.honeyKg,
    winter_feed_kg: p.winterFeedKg,
    spring_speed: (p.springDev as unknown as NonNullable<import('./models').PhenotypeInput['spring_speed']>) || undefined,
    year: p.date?.getFullYear?.() ?? undefined,
    breed: p.breed,
  };
}

export async function fromHiveMapAvg(days: number): Promise<PhenotypeInput|null> {
  const rows = getHiveCards();
  if (!rows.length) return null;
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.max(1, Math.floor(days)));
  const filtered = filterByDate(rows, from, now);
  if (!filtered.length) return null;
  return mapHiveAvg(filtered);
}

function mapHiveAvg(rows: HiveCardEntry[]): PhenotypeInput {
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
  const frames = avg(rows.map((r) => r.framesOccupied));
  const open = avg(rows.map((r) => r.broodOpen));
  const capped = avg(rows.map((r) => r.broodCapped));
  const brood = open + capped;
  // Coarse mapping: more frames/brood -> better spring_speed & brood_density, proxy honey_kg
  const spring_speed = clampToRange(Math.round(mapRange(frames, 3, 12, 2, 5)), 1, 5) as 1|2|3|4|5;
  const brood_density = clampToRange(Math.round(mapRange(brood, 2, 16, 2, 5)), 1, 5) as 1|2|3|4|5;
  const honeyRaw = (frames / 12) * 20;
  const honey_kg = Math.max(0, Math.round(honeyRaw * 10) / 10);
  return {
    spring_speed,
    brood_density,
    honey_kg,
  };
}

function mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (!Number.isFinite(x)) return outMin;
  const t = (x - inMin) / (inMax - inMin);
  return outMin + Math.max(0, Math.min(1, t)) * (outMax - outMin);
}

function clampToRange(x: number, min: number, max: number): number { return Math.min(max, Math.max(min, x)); }

export async function fetchBreederMeasures(): Promise<SourceMeasure[]> {
  const queens = listQueens()
  const phenos = getPhenotypes()
  const hives = getHiveCards()
  const rows: SourceMeasure[] = []
  const nowIso = new Date().toISOString()
  if (!queens.length && !phenos.length && !hives.length) {
    // mock data when local tables are empty
    for (let i=0;i<10;i++) rows.push({ breederId: 'Breeder-A', beekeeperId: `K${i}`, date: nowIso, si: 80 + (i%3)-1, bv: 1 + (i%2?0.2:-0.1) })
    for (let i=0;i<12;i++) rows.push({ breederId: 'Breeder-B', beekeeperId: `K${i}`, date: nowIso, si: 75 + (i%5)-2, bv: 0.5 + (i%3?0.1:-0.2) })
    for (let i=0;i<9;i++) rows.push({ breederId: 'Breeder-C', beekeeperId: `K${i}`, date: nowIso, si: 85 + (i%4)-1, bv: 1.2 + (i%2?0.1:-0.1) })
    return rows
  }
  // New model: queens + observations
  for (const q of queens) {
    // Ignore invalid IDs defensively
    if (!parseQId(q.id)) {
      if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
        console.warn('Ignoring queen with invalid ID in analytics adapter:', q.id)
      }
      continue
    }
    const base: { si?: number; bv?: number } = q.baseTraits ? traitsToSI_BV(q.baseTraits) : { si: undefined, bv: undefined }
    rows.push({ breederId: q.breederId || q.breedCode, beekeeperId: q.ownerUserId || 'unknown', queenId: q.id, date: q.createdAt || nowIso, si: base.si, bv: base.bv, weight: 1 })
    const obs = listObservationsByQueen(q.id)
    for (const o of obs) {
      const out = traitsToSI_BV(completeTraits(q.baseTraits, o.traits))
      rows.push({ breederId: q.breederId || q.breedCode, beekeeperId: o.observerId, queenId: q.id, date: o.date, si: out.si, bv: out.bv, weight: 1 })
    }
  }
  // Backward-compat: Map phenotypes to measures when no new-model data
  for (const p of phenos) {
    const breederId = p.breed || 'unknown'
    const beekeeperId = p.queenId ? `BKP_${p.queenId.slice(0,4)}` : 'anon'
    const dateIso = p.date.toISOString()
    let si: number | undefined
    let bv: number | undefined
    if (typeof p.hygienePct === 'number' || typeof p.eggsPerDay === 'number' || typeof p.honeyKg === 'number') {
      const out = forecastBVSI({ hygienic_pct: p.hygienePct, egg_day: p.eggsPerDay, honey_kg: p.honeyKg, breed: p.breed }, { noise: 0.2 })
      si = out.si; bv = out.bv
    }
    rows.push({ breederId, beekeeperId, queenId: p.queenId, date: dateIso, si, bv, weight: 1 })
  }
  // Map hive cards roughly as SI-only proxies via frames/brood
  for (const h of hives) {
    const breederId = h.breed || 'unknown'
    const beekeeperId = `H_${h.colonyId.slice(0,4)}`
    const dateIso = h.date.toISOString()
    const proxyHoney = Math.max(0, (h.framesOccupied ?? 0) * 1.5)
    const out = forecastBVSI({ honey_kg: proxyHoney, breed: h.breed }, { noise: 0.25 })
    rows.push({ breederId, beekeeperId, date: dateIso, si: out.si, bv: out.bv, weight: 0.8 })
  }
  return rows
}

export async function fetchRegionalMeasures(): Promise<RegionalMeasure[]> {
  const queens = listQueens()
  const phenos = getPhenotypes()
  const hives = getHiveCards()
  const rows: RegionalMeasure[] = []
  const regions = ['R-North','R-South','R-East','R-West','R-Center']
  const pickRegion = (key: string|undefined, i: number) => regions[(i + (key? key.length:0)) % regions.length]
  if (!queens.length && !phenos.length && !hives.length) {
    const now = new Date().toISOString()
    for (let i=0;i<20;i++) rows.push({ regionId: regions[i%regions.length], date: now, si: 70 + (i%10), bv: (i%5)/5 })
    return rows
  }
  // New model aggregates
  queens.forEach((q,i)=>{
    const regionId = pickRegion(q.breedCode, i)
    const date = q.createdAt
    const out = q.baseTraits ? traitsToSI_BV(q.baseTraits) : { si: 0, bv: 0 }
    rows.push({ regionId, breederId: q.breederId, beekeeperId: q.ownerUserId, date, si: out.si, bv: out.bv })
    const obs = listObservationsByQueen(q.id)
    for (const o of obs) {
      const t = traitsToSI_BV(completeTraits(q.baseTraits, o.traits))
      rows.push({ regionId, breederId: q.breederId, beekeeperId: o.observerId, date: o.date, si: t.si, bv: t.bv })
    }
  })
  // Backward-compat
  phenos.forEach((p,i)=>{
    const regionId = pickRegion(p.breed, i)
    const date = p.date.toISOString()
    const out = forecastBVSI({ hygienic_pct: p.hygienePct, egg_day: p.eggsPerDay, honey_kg: p.honeyKg, breed: p.breed }, { noise: 0.2 })
    rows.push({ regionId, breederId: p.breed, beekeeperId: p.queenId, date, si: out.si, bv: out.bv, honey_kg: p.honeyKg, egg_day: p.eggsPerDay, hygienic_pct: p.hygienePct })
  })
  hives.forEach((h,i)=>{
    const regionId = pickRegion(h.breed, i+17)
    const date = h.date.toISOString()
    const proxyHoney = Math.max(0, (h.framesOccupied ?? 0) * 1.5)
    const out = forecastBVSI({ honey_kg: proxyHoney, breed: h.breed }, { noise: 0.25 })
    rows.push({ regionId, breederId: h.breed, beekeeperId: h.colonyId, date, si: out.si, bv: out.bv, honey_kg: proxyHoney })
  })
  return rows
}
