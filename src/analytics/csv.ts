import type { PhenotypeInput, WhatIfParams, ForecastOutput } from './models'
import { downloadBlob } from '../utils/export'

function esc(v: unknown): string {
  const s = String(v ?? '')
  const needs = /[",\n\r]/.test(s)
  const d = s.replace(/"/g, '""')
  return needs ? `"${d}"` : d
}

export function toCsvRow(s: { input: PhenotypeInput; params: WhatIfParams; out: ForecastOutput }): string {
  const flat: Record<string, unknown> = {
    // input
    length_mm: s.input.length_mm,
    mass_pre_mg: s.input.mass_pre_mg,
    mass_post_mg: s.input.mass_post_mg,
    color: s.input.color,
    abdomen_shape: s.input.abdomen_shape,
    symmetry_ok: s.input.symmetry_ok,
    aggression: s.input.aggression,
    swarming: s.input.swarming,
    hygienic_pct: s.input.hygienic_pct,
    wintering: s.input.wintering,
    egg_day: s.input.egg_day,
    brood_density: s.input.brood_density,
    honey_kg: s.input.honey_kg,
    winter_feed_kg: s.input.winter_feed_kg,
    spring_speed: s.input.spring_speed,
    year: s.input.year,
    breed: s.input.breed,
    // params
    noise: s.params.noise,
    nectar_flow: s.params.env?.nectar_flow,
    disease_risk: s.params.env?.disease_risk,
    winter_severity: s.params.env?.winter_severity,
    // weights (only key ones we expose in UI)
    w_honey_kg: s.params.weights?.honey_kg,
    w_egg_day: s.params.weights?.egg_day,
    w_hygienic_pct: s.params.weights?.hygienic_pct,
    w_aggression: s.params.weights?.aggression,
    w_swarming: s.params.weights?.swarming,
    w_wintering: s.params.weights?.wintering,
    w_spring_speed: s.params.weights?.spring_speed,
    w_brood_density: s.params.weights?.brood_density,
    w_winter_feed_kg: s.params.weights?.winter_feed_kg,
    // output
    si: s.out.si,
    bv: s.out.bv,
    conf: s.out.conf,
    notes: (s.out.notes ?? []).join('; '),
  }
  const headers = Object.keys(flat)
  const values = headers.map((h) => esc(flat[h]))
  return values.join(',')
}

export function downloadCsv(rows: string[], filename: string): void {
  const csv = rows.join('\r\n')
  const name = filename.endsWith('.csv') ? filename : `${filename}.csv`
  downloadBlob(name, 'text/csv;charset=utf-8', csv)
}
