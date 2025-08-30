import { useMemo, useState } from "react";
import { getPhenotypes, getHiveCards, calcPhenotypeKPI, calcHiveKPI, seriesByMonth, filterByDate, uniqueValues, applySegments } from "../state/analytics";
import type { PhenotypeEntry, HiveCardEntry } from "../state/analytics";
import { exportCSV, exportXLSX } from "../utils/export";
import InfoTooltip from "../components/ui/InfoTooltip";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, BarChart, Bar } from "recharts";
import { selectFilteredRows, buildCohorts, type UnifiedRow } from "../analytics/selectors";
import { avgEggsPerDay, honeyKgAvg, hygienePctAvg, movingAvg } from "../analytics/metrics";
import DrilldownModal from "../components/analytics/DrilldownModal";

function KPIStat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="flex items-center justify-between text-xs text-[var(--secondary)]">
        <span>{label}</span>
        {hint && <InfoTooltip text={hint} />}
      </div>
      <div className="mt-1 text-xl font-semibold">{typeof value === 'number' ? (Number.isFinite(value) ? value.toFixed(1) : '—') : value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span>{title}</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState<'overview' | 'phenotypes' | 'hive'>('overview');
  const phenos = useMemo(() => getPhenotypes(), []);
  const hives = useMemo(() => getHiveCards(), []);

  // Date range (last 6 months by default)
  const now = new Date();
  const defTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const tmp = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const defFrom = `${tmp.getFullYear()}-${String(tmp.getMonth() + 1).padStart(2, '0')}`;
  const [fromMonth, setFromMonth] = useState(defFrom);
  const [toMonth, setToMonth] = useState(defTo);

  const fromDate = useMemo(() => monthToStart(fromMonth), [fromMonth]);
  const toDate = useMemo(() => monthToEnd(toMonth), [toMonth]);

  const phenosFiltered = useMemo(() => filterByDate(phenos, fromDate, toDate), [phenos, fromDate, toDate]);
  const hivesFiltered = useMemo(() => filterByDate(hives, fromDate, toDate), [hives, fromDate, toDate]);

  // Segmentation state and available options
  const breedOptions = useMemo(() => {
    const a = uniqueValues<PhenotypeEntry, 'breed'>(phenosFiltered, 'breed')
    const b = uniqueValues<HiveCardEntry, 'breed'>(hivesFiltered, 'breed')
    return Array.from(new Set([...a, ...b])).sort((x, y) => x.localeCompare(y))
  }, [phenosFiltered, hivesFiltered]);
  const statusOptions = useMemo(() => {
    const a = uniqueValues<PhenotypeEntry, 'status'>(phenosFiltered, 'status')
    const b = uniqueValues<HiveCardEntry, 'status'>(hivesFiltered, 'status')
    return Array.from(new Set([...a, ...b])).sort((x, y) => x.localeCompare(y))
  }, [phenosFiltered, hivesFiltered]);
  const [selBreeds, setSelBreeds] = useState<string[]>([]);
  const [selStatuses, setSelStatuses] = useState<string[]>([]);
  const [sources, setSources] = useState<{ phenotypes: boolean; hivecards: boolean }>({ phenotypes: true, hivecards: true });

  // URL sync (mount -> state, state -> URL)
  useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    const uFrom = sp.get('from'); const uTo = sp.get('to');
    const uBreeds = sp.get('breeds'); const uStatuses = sp.get('statuses'); const uSources = sp.get('sources');
    if (uFrom) setFromMonth(uFrom);
    if (uTo) setToMonth(uTo);
    if (uBreeds) setSelBreeds(uBreeds.split(',').filter(Boolean));
    if (uStatuses) setSelStatuses(uStatuses.split(',').filter(Boolean));
    if (uSources) {
      const parts = new Set(uSources.split(',').filter(Boolean));
      setSources({ phenotypes: parts.has('phenotypes'), hivecards: parts.has('hivecards') });
    }
  }, []);

  useMemo(() => {
    const sp = new URLSearchParams();
    if (fromMonth) sp.set('from', fromMonth);
    if (toMonth) sp.set('to', toMonth);
    if (selBreeds.length) sp.set('breeds', selBreeds.join(','));
    if (selStatuses.length) sp.set('statuses', selStatuses.join(','));
    const src: string[] = []; if (sources.phenotypes) src.push('phenotypes'); if (sources.hivecards) src.push('hivecards');
    if (src.length) sp.set('sources', src.join(','));
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState(null, '', url);
  }, [fromMonth, toMonth, selBreeds, selStatuses, sources]);

  const phenosSeg = useMemo(() => (sources.phenotypes ? applySegments(phenosFiltered, { breeds: selBreeds, statuses: selStatuses }) : []), [phenosFiltered, selBreeds, selStatuses, sources]);
  const hivesSeg = useMemo(() => (sources.hivecards ? applySegments(hivesFiltered, { breeds: selBreeds, statuses: selStatuses }) : []), [hivesFiltered, selBreeds, selStatuses, sources]);

  const phKPI = useMemo(() => calcPhenotypeKPI(phenosSeg), [phenosSeg]);
  const hcKPI = useMemo(() => calcHiveKPI(hivesSeg), [hivesSeg]);

  const phMonthly = useMemo(() => seriesByMonth<PhenotypeEntry>(
    phenosSeg,
    (e) => e.date,
    {
      eggs: (arr) => avg(arr.map((e) => e.eggsPerDay ?? 0)),
      hygiene: (arr) => avg(arr.map((e) => e.hygienePct ?? 0)),
    }
  ), [phenosSeg]);

  const hcMonthly = useMemo(() => seriesByMonth<HiveCardEntry>(
    hivesSeg,
    (e) => e.date,
    {
      frames: (arr) => avg(arr.map((e) => e.framesOccupied)),
      open: (arr) => avg(arr.map((e) => e.broodOpen)),
      capped: (arr) => avg(arr.map((e) => e.broodCapped)),
    }
  ), [hivesSeg]);

  function avg(vs: number[]) { return vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : 0; }

  function exportAllCSV() {
    const rows = hcMonthly.map((p) => ({ month: p.month, frames: p.frames as number, open: p.open as number, capped: p.capped as number }));
    exportCSV('analytics-monthly.csv', rows);
  }

  function exportAllXLSX() {
    const phRows = phMonthly.map((p) => ({ month: p.month, eggs: p.eggs as number, hygiene: p.hygiene as number }));
    const hcRows = hcMonthly.map((p) => ({ month: p.month, frames: p.frames as number, open: p.open as number, capped: p.capped as number }));
    exportXLSX('analytics.xlsx', { PhenotypesMonthly: phRows, HiveMonthly: hcRows });
  }

  const empty = phenosSeg.length === 0 && hivesSeg.length === 0;

  // Cohort compare additions
  const [breakdown, setBreakdown] = useState<'breed' | 'year' | 'source' | 'status'>('breed');
  const unified = useMemo<UnifiedRow[]>(() => selectFilteredRows({ from: fromDate, to: toDate, breeds: selBreeds, statuses: selStatuses, sources }), [fromDate, toDate, selBreeds, selStatuses, sources]);
  const cohorts = useMemo(() => buildCohorts(unified, breakdown), [unified, breakdown]);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [metric, setMetric] = useState<'eggs' | 'honey' | 'hygiene'>('hygiene');
  const [smooth, setSmooth] = useState<boolean>(false);
  const [drillRows, setDrillRows] = useState<UnifiedRow[] | null>(null);

  const cohortSeries = useMemo(() => {
    const byMonth = (rows: UnifiedRow[]) => seriesByMonth(rows, (r) => r.date, { v: (arr) => {
      if (metric === 'eggs') return avgEggsPerDay(arr).value;
      if (metric === 'honey') return honeyKgAvg(arr).value;
      return hygienePctAvg(arr).value;
    }});
    const out: Record<string, Array<{ month: string; v: number }>> = {};
    const chosen = selectedCohorts.length ? cohorts.filter(c => selectedCohorts.includes(c.key)) : cohorts.slice(0, 2);
    for (const c of chosen) {
      const pts = byMonth(c.rows) as Array<{ month: string; v: number }>;
      out[c.key] = smooth ? pts.map((p, i, arr) => ({ month: p.month, v: movingAvg(arr.map(x => x.v), 3)[i] })) : pts;
    }
    return out;
  }, [cohorts, selectedCohorts, metric, smooth]);

  return (
    <div className="p-4">
      <div className="mb-3 flex gap-2">
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='overview'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={() => setTab('overview')}>Огляд</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='phenotypes'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={() => setTab('phenotypes')}>Фенотипи</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='hive'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={() => setTab('hive')}>Вуликові карти</button>
        <div className="ml-auto flex gap-2">
          <button className="rounded-md border px-3 py-1.5 text-sm" onClick={exportAllCSV}>Експорт аналітики (CSV)</button>
          <button className="rounded-md border px-3 py-1.5 text-sm" onClick={exportAllXLSX}>Експорт аналітики (XLSX)</button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-[var(--secondary)]">Період:</span>
        <input aria-label="Від місяця" type="month" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} className="rounded-md border px-2 py-1 text-sm" />
        <span className="text-sm">—</span>
        <input aria-label="До місяця" type="month" value={toMonth} onChange={(e) => setToMonth(e.target.value)} className="rounded-md border px-2 py-1 text-sm" />
      </div>
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <div className="mb-1 text-xs font-medium text-[var(--secondary)]">Порода/лінія</div>
          <div className="flex flex-wrap gap-2">
            {breedOptions.map((b) => (
              <label key={b} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={selBreeds.includes(b)} onChange={(e) => setSelBreeds((prev) => e.target.checked ? [...prev, b] : prev.filter((x) => x !== b))} /> {b}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-[var(--secondary)]">Статус</div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <label key={s} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={selStatuses.includes(s)} onChange={(e) => setSelStatuses((prev) => e.target.checked ? [...prev, s] : prev.filter((x) => x !== s))} /> {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-[var(--secondary)]">Джерело</div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-1"><input type="checkbox" checked={sources.phenotypes} onChange={(e) => setSources((p) => ({ ...p, phenotypes: e.target.checked }))} /> Фенотипи</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={sources.hivecards} onChange={(e) => setSources((p) => ({ ...p, hivecards: e.target.checked }))} /> Вуликові карти</label>
            <button className="ml-auto rounded-md border px-2 py-1" onClick={() => { setSelBreeds([]); setSelStatuses([]); setSources({ phenotypes: true, hivecards: true }); setFromMonth(defFrom); setToMonth(defTo); }}>Скинути</button>
          </div>
        </div>
      </div>

      {/* Breakdown & cohorts */}
      {!empty && (
        <div className="mb-3 rounded-md border border-[var(--divider)] bg-[var(--surface)] p-3">
          <div className="mb-2 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--secondary)]">Breakdown:</span>
              {(['breed','year','source','status'] as const).map((b) => (
                <label key={b} className="flex items-center gap-1"><input type="radio" name="breakdown" checked={breakdown===b} onChange={() => setBreakdown(b)} /> {b}</label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--secondary)]">Metric:</span>
              <select value={metric} onChange={(e) => setMetric(e.target.value as 'eggs'|'honey'|'hygiene')} className="rounded-md border px-2 py-1">
                <option value="hygiene">Hygiene %</option>
                <option value="eggs">Eggs/Day</option>
                <option value="honey">Honey kg</option>
              </select>
              <label className="ml-2 flex items-center gap-1"><input type="checkbox" checked={smooth} onChange={(e)=>setSmooth(e.target.checked)} /> Smooth</label>
            </div>
          </div>
          <div className="text-xs font-medium text-[var(--secondary)] mb-1">Cohorts</div>
          <div className="flex flex-wrap gap-2">
            {cohorts.map((c) => (
              <label key={c.key} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={selectedCohorts.includes(c.key)} onChange={(e)=> setSelectedCohorts((prev)=> e.target.checked ? (prev.length<4?[...prev,c.key]:prev) : prev.filter(k=>k!==c.key))} /> {c.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {empty && (
        <div className="rounded-md border border-[var(--divider)] bg-[var(--surface)] p-4 text-sm text-[var(--secondary)]">
          Даних поки немає. Імпортуйте записи на сторінках “Фенотипи” та “Вуликові карти”.
        </div>
      )}

      {!empty && tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <KPIStat label="Маток (унік.)" value={phKPI.countQueens} hint="Унікальні Queen ID" />
            <KPIStat label="Сер. яєць/добу" value={phKPI.avgEggsPerDay} />
            <KPIStat label="Сер. гігієна %" value={phKPI.avgHygienePct} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ChartCard title="Сер. зайняті рамки по місяцях">
              <LineChart data={hcMonthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Line type="monotone" dataKey="frames" stroke="#0EA5E9" />
              </LineChart>
            </ChartCard>
            <ChartCard title="Сер. гігієна по місяцях">
              <BarChart data={phMonthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Bar dataKey="hygiene" fill="#22C55E" />
              </BarChart>
            </ChartCard>
          </div>
        </div>
      )}

      {!empty && tab === 'phenotypes' && (
        <div className="space-y-4">
          {phenosSeg.length === 0 && (
            <div className="rounded-md border border-[var(--divider)] bg-[var(--surface)] p-4 text-sm text-[var(--secondary)]">Немає записів за обраний період</div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <KPIStat label="Маток (унік.)" value={phKPI.countQueens} />
            <KPIStat label="Сер. яєць/добу" value={phKPI.avgEggsPerDay} />
            <KPIStat label="Сер. гігієна %" value={phKPI.avgHygienePct} />
            <KPIStat label="Темперамент (1–5)" value={phKPI.avgTemperament} />
            <KPIStat label="Зимостійкість (1–5)" value={phKPI.avgWinterHardiness} />
            <KPIStat label="Весняний розв. (1–5)" value={phKPI.avgSpringDev} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ChartCard title="Яйценосність по місяцях">
              <LineChart data={phMonthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Line type="monotone" dataKey="eggs" stroke="#0EA5E9" />
              </LineChart>
            </ChartCard>
            <ChartCard title="Гігієна по місяцях">
              <BarChart data={phMonthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Bar dataKey="hygiene" fill="#22C55E" />
              </BarChart>
            </ChartCard>
          </div>
        </div>
      )}

      {!empty && tab === 'hive' && (
        <div className="space-y-4">
          {hivesSeg.length === 0 && (
            <div className="rounded-md border border-[var(--divider)] bg-[var(--surface)] p-4 text-sm text-[var(--secondary)]">Немає записів за обраний період</div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <KPIStat label="Колоній (унік.)" value={hcKPI.countColonies} />
            <KPIStat label="Сер. зайняті рамки" value={hcKPI.avgFramesOccupied} />
            <KPIStat label="Сер. відкритий розплід" value={hcKPI.avgBroodOpen} />
            <KPIStat label="Сер. закритий розплід" value={hcKPI.avgBroodCapped} />
            <KPIStat label="Частка відкритого" value={hcKPI.broodRatio} hint="open/(open+capped)" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ChartCard title="Сер. зайняті рамки">
              <LineChart data={hcMonthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Line type="monotone" dataKey="frames" stroke="#0EA5E9" />
              </LineChart>
            </ChartCard>
            <ChartCard title="Розплід (відкр. vs закр.)">
              <BarChart data={hcMonthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Bar dataKey="open" stackId="a" fill="#0EA5E9" name="Відкр." />
                <Bar dataKey="capped" stackId="a" fill="#EF4444" name="Закр." />
              </BarChart>
            </ChartCard>
          </div>
        </div>
      )}

      {!empty && (
        <div className="space-y-3">
          <ChartCard title="Cohort compare">
            <LineChart data={Object.values(cohortSeries)[0] || []} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RTooltip />
              <Legend />
              {Object.entries(cohortSeries).map(([key, pts], idx) => (
                <Line key={key} type="monotone" data={pts} dataKey="v" name={key} stroke={["#0EA5E9","#22C55E","#F59E0B","#EF4444"][idx%4]} />
              ))}
            </LineChart>
          </ChartCard>
          <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
            <div className="text-sm font-medium mb-2">Cohort summary</div>
            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Cohort</th>
                    <th className="px-2 py-1 text-left">N</th>
                    <th className="px-2 py-1 text-left">Avg Eggs/Day</th>
                    <th className="px-2 py-1 text-left">Honey kg</th>
                    <th className="px-2 py-1 text-left">Hygiene %</th>
                    <th className="px-2 py-1 text-left">Sealed brood</th>
                    <th className="px-2 py-1 text-left">Spring Dev</th>
                    <th className="px-2 py-1 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.filter(c=> selectedCohorts.length? selectedCohorts.includes(c.key): true).slice(0,4).map((c) => {
                    const eggs = avgEggsPerDay(c.rows); const hon = honeyKgAvg(c.rows); const hyg = hygienePctAvg(c.rows);
                    const sealed = c.rows.map(r=> r.sealedBroodFrames ?? 0).filter(v=>v>0);
                    const spring = c.rows.map(r=> r.springDev ?? 0).filter(v=>v>0);
                    const n = Math.max(eggs.n, hon.n, hyg.n);
                    return (
                      <tr key={c.key} className="border-t">
                        <td className="px-2 py-1">{c.label}</td>
                        <td className="px-2 py-1">{n}</td>
                        <td className="px-2 py-1">{eggs.value.toFixed(1)}</td>
                        <td className="px-2 py-1">{hon.value.toFixed(1)}</td>
                        <td className="px-2 py-1">{hyg.value.toFixed(1)}</td>
                        <td className="px-2 py-1">{sealed.length ? (sealed.reduce((a,b)=>a+b,0)/sealed.length).toFixed(1): '0.0'}</td>
                        <td className="px-2 py-1">{spring.length ? (spring.reduce((a,b)=>a+b,0)/spring.length).toFixed(1): '0.0'}</td>
                        <td className="px-2 py-1"><button className="rounded-md border px-2 py-1" onClick={()=>setDrillRows(c.rows)}>Drill-down</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {drillRows && <DrilldownModal rows={drillRows} onClose={()=>setDrillRows(null)} />}
    </div>
  );
}

function monthToStart(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const [y, m] = s.split('-').map(Number);
  if (!y || !m) return undefined;
  return new Date(y, m - 1, 1, 0, 0, 0, 0);
}
function monthToEnd(s: string | undefined): Date | undefined {
  const start = monthToStart(s);
  if (!start) return undefined;
  return new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
}
