import { useMemo, useState } from "react";
import { getPhenotypes, getHiveCards, calcPhenotypeKPI, calcHiveKPI, seriesByMonth } from "../state/analytics";
import type { PhenotypeEntry, HiveCardEntry } from "../state/analytics";
import { exportCSV, exportXLSX } from "../utils/export";
import InfoTooltip from "../components/ui/InfoTooltip";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, BarChart, Bar } from "recharts";

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

  const phKPI = useMemo(() => calcPhenotypeKPI(phenos), [phenos]);
  const hcKPI = useMemo(() => calcHiveKPI(hives), [hives]);

  const phMonthly = useMemo(() => seriesByMonth<PhenotypeEntry>(
    phenos,
    (e) => e.date,
    {
      eggs: (arr) => avg(arr.map((e) => e.eggsPerDay ?? 0)),
      hygiene: (arr) => avg(arr.map((e) => e.hygienePct ?? 0)),
    }
  ), [phenos]);

  const hcMonthly = useMemo(() => seriesByMonth<HiveCardEntry>(
    hives,
    (e) => e.date,
    {
      frames: (arr) => avg(arr.map((e) => e.framesOccupied)),
      open: (arr) => avg(arr.map((e) => e.broodOpen)),
      capped: (arr) => avg(arr.map((e) => e.broodCapped)),
    }
  ), [hives]);

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

  const empty = phenos.length === 0 && hives.length === 0;

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
    </div>
  );
}
