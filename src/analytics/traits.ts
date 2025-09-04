import type { TenTraits } from '../types/queen'

// просте нормування 10 полів у SI (0..100) і BV (-3..+3, Z-подібно)
export function traitsToSI_BV(t: TenTraits): { si: number; bv: number } {
  const values = [
    t.honey, t.winter, t.temperament, t.calmOnFrames,
    t.swarming, t.hygienic, t.varroaResist, t.springBuildUp,
    t.colonyStrength, Math.min(100, Math.max(0, (t.broodFrames / 12) * 100)),
  ];
  const si = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  // BV як відцентроване значення: переносимо 0..100 у -3..+3
  const bv = ((si - 50) / 50) * 3;
  return { si, bv };
}
