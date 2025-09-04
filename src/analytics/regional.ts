export type RegionId = string;

export type RegionalMeasure = {
  regionId: RegionId;
  breederId?: string;
  beekeeperId?: string;
  date: string;      // ISO
  si?: number;       // 0..100
  bv?: number;       // -3..+3
  honey_kg?: number; egg_day?: number; brood_density?: number; hygienic_pct?: number;
};

export type RegionAggregate = {
  regionId: RegionId;
  n_sources: number;       // independent beekeepers
  m_records: number;       // records
  si_avg: number;
  bv_avg: number;
  honey_avg?: number;
  confidence: number;      // 0..1
  recency_days: number;    // avg age
};

export type RegionalParams = {
  from?: string; to?: string;          // ISO date range
  breeds?: string[]; statuses?: string[];
  recencyHalfLifeDays?: number;        // 90/180/365
  minRecords?: number; minSources?: number;
};

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const decay = (days: number, halfLife: number) => Math.pow(0.5, Math.max(0, days) / (halfLife || 120));

export function aggregateByRegion(rows: RegionalMeasure[], params?: RegionalParams): RegionAggregate[] {
  const now = new Date();
  const p = { recencyHalfLifeDays: params?.recencyHalfLifeDays ?? 180, minRecords: params?.minRecords ?? 6, minSources: params?.minSources ?? 3 };
  const byRegion = new Map<string, RegionalMeasure[]>();
  for (const r of rows) {
    if (!r.regionId) continue;
    const d = new Date(r.date);
    if (params?.from && d < new Date(params.from)) continue;
    if (params?.to && d > new Date(params.to)) continue;
    const a = byRegion.get(r.regionId) ?? [];
    a.push(r); byRegion.set(r.regionId, a);
  }
  const out: RegionAggregate[] = [];
  for (const [regionId, arr] of byRegion.entries()) {
    const m = arr.length; const n = new Set(arr.map(r=> r.beekeeperId||'anon')).size;
    if (m < (p.minRecords||0) || n < (p.minSources||0)) continue;
    const ages = arr.map(r=> Math.max(0, Math.round((now.getTime()-new Date(r.date).getTime())/(24*3600*1000))));
    const w = ages.map(d=> decay(d, p.recencyHalfLifeDays)); const wSum = w.reduce((s,v)=>s+v,0)||1;
    let siSum=0, siW=0, bvSum=0, bvW=0, honeySum=0, honeyW=0, ageSum=0;
    arr.forEach((r,i)=>{
      const wi = w[i]; ageSum += wi*ages[i];
      if (typeof r.si==='number') { siSum += wi*r.si!; siW += wi }
      if (typeof r.bv==='number') { bvSum += wi*r.bv!; bvW += wi }
      if (typeof r.honey_kg==='number') { honeySum += wi*r.honey_kg!; honeyW += wi }
    })
    const si_avg = siW>0? siSum/siW : 0; const bv_avg = bvW>0? bvSum/bvW : 0; const honey_avg = honeyW>0? honeySum/honeyW : undefined;
    const recency_days = ageSum/wSum;
    const compN = clamp(n/(p.minSources||1),0,1); const compM = clamp(m/(p.minRecords||1),0,1); const compR = clamp(1 - recency_days/(p.recencyHalfLifeDays*2),0,1);
    const confidence = clamp(0.4*compN + 0.3*compM + 0.3*compR, 0, 1);
    out.push({ regionId, n_sources:n, m_records:m, si_avg, bv_avg, honey_avg, confidence, recency_days })
  }
  return out.sort((a,b)=> ( (b.si_avg/100*0.6 + (b.bv_avg+3)/6*0.4) - (a.si_avg/100*0.6 + (a.bv_avg+3)/6*0.4) ))
}

export function compareToBenchmark(region: RegionAggregate, benchmark: RegionAggregate): { si_delta: number; bv_delta: number; score_delta: number } {
  const si_delta = region.si_avg - benchmark.si_avg;
  const bv_delta = region.bv_avg - benchmark.bv_avg;
  const score = (region.si_avg/100)*0.6 + ((region.bv_avg+3)/6)*0.4;
  const score_b = (benchmark.si_avg/100)*0.6 + ((benchmark.bv_avg+3)/6)*0.4;
  const score_delta = (score - score_b)*100;
  return { si_delta, bv_delta, score_delta };
}

