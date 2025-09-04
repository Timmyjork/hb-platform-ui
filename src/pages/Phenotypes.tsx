import React, { useEffect, useMemo, useRef, useState } from "react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import * as phenos from "../state/phenotypes";
import { parseCSV, toCSV } from "../components/utils/csv";
import { downloadPhenotypesTemplate, parsePhenotypesXLSX, exportPhenotypesXLSX, type PhenotypeRow } from "../utils/xlsx-phenotypes";
import InfoTooltip from "../components/ui/InfoTooltip";
import { useToast } from "../components/ui/Toast";

type Scale = 1 | 2 | 3 | 4 | 5;
type Color = "light" | "yellow" | "dark" | "black";

type Draft = {
  morphology: {
    lengthMm: number; // 5..30
    massPreMg: number; // >=0
    massPostMg: number; // >=0
    color: Color | "";
    abdomenShape: Scale | 0;
    symmetry: boolean;
    notes?: string;
  };
  behavior: {
    aggression: Scale | 0;
    swarming: Scale | 0;
    hygienicPct: number; // 0..100
    winterHardiness: Scale | 0;
  };
  productivity: {
    eggsPerDay: number; // >=0
    broodDensity: Scale | 0;
    honeyKg: number; // >=0
    winterFeedKg: number; // >=0
    springDev: Scale | 0;
  };
};

const LS_KEY = "hb:phenotypes:draft" as const;

const emptyDraft: Draft = {
  morphology: {
    lengthMm: 0,
    massPreMg: 0,
    massPostMg: 0,
    color: "",
    abdomenShape: 0,
    symmetry: false,
    notes: "",
  },
  behavior: {
    aggression: 0,
    swarming: 0,
    hygienicPct: 0,
    winterHardiness: 0,
  },
  productivity: {
    eggsPerDay: 0,
    broodDensity: 0,
    honeyKg: 0,
    winterFeedKg: 0,
    springDev: 0,
  },
};

export default function Phenotypes() {
  const [tab, setTab] = useState<"form" | "saved">("form");
  const [form, setForm] = useState<Draft>(emptyDraft);
  const [saved, setSaved] = useState<phenos.PhenotypeRecord[]>([]);
  const { push } = useToast();
  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<PhenotypeRow[]>([]);
  const [importErr, setImportErr] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setForm({ ...emptyDraft, ...(JSON.parse(raw) as Draft) });
    } catch {
      /* ignore */
    }
    setSaved(phenos.list());
  }, []);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const set = <K extends keyof Draft, P extends keyof Draft[K]>(section: K, prop: P) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const el = e.currentTarget as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    let value: unknown = el.type === "checkbox" ? (el as HTMLInputElement).checked : el.value;
    if (el.type === "number") value = el.value === "" ? 0 : Number(el.value);
    if (section !== "morphology" && section !== "behavior" && section !== "productivity") return;
    setForm((f) => ({ ...f, [section]: { ...f[section], [prop]: value } }) as Draft);
  };

  const save = () => {
    const rec = phenos.save({
      morphology: form.morphology,
      behavior: form.behavior,
      productivity: form.productivity,
    });
    setSaved((s) => [rec, ...s]);
    localStorage.removeItem(LS_KEY);
    setForm(emptyDraft);
    setTab("saved");
  };

  const reset = () => {
    setForm(emptyDraft);
    localStorage.removeItem(LS_KEY);
  };

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <button
          className={`rounded px-3 py-1.5 text-sm ${tab === "form" ? "bg-gray-900 text-white" : "border border-[var(--divider)]"}`}
          onClick={() => setTab("form")}
        >
          Форма
        </button>
        <button
          className={`rounded px-3 py-1.5 text-sm ${tab === "saved" ? "bg-gray-900 text-white" : "border border-[var(--divider)]"}`}
          onClick={() => setTab("saved")}
        >
          Збережені записи
        </button>
      </div>
      <h1 className="text-xl font-semibold mb-2">Фенотипи</h1>
      <h1 className="text-xl font-semibold mb-2">Вуликова карта (спостереження)</h1>
      <div className="text-sm text-[var(--secondary)] mb-3">
        Вуликова карта = ваші польові спостереження за 11 ознаками. Дані вносяться під час огляду сім’ї. Кожен запис має дату, ID матки (паспорт) і значення ознак. Заповнюйте чесно — ці дані впливають на аналітику та рейтинги.
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Button onClick={() => downloadPhenotypesTemplate()}>Скачати шаблон XLSX</Button>
        <Button variant="secondary" onClick={() => xlsxInputRef.current?.click()}>Імпорт XLSX</Button>
        <Button variant="secondary" onClick={() => exportPhenotypesXLSX(imported)}>Експорт XLSX</Button>
        <input
          ref={xlsxInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={async (e) => {
            const f = e.currentTarget.files?.[0];
            if (!f) return;
            try {
              setImportErr("");
              const rows = await parsePhenotypesXLSX(f);
              setImported(rows);
              push({ title: `Імпортовано записів: ${rows.length}`, tone: "success" });
            } catch (err) {
              const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as {message:string}).message) : 'Помилка імпорту';
              setImportErr(msg);
              push({ title: msg, tone: "danger" });
            } finally {
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
      {importErr && <div className="mb-2 text-sm text-red-600">{importErr}</div>}
      {/* Demo inline help block (not a form) */}
      <div className="mb-4 rounded-md border border-[var(--divider)] bg-[var(--surface)] p-3">
        <div className="text-sm font-medium">Як заповнювати (приклади)</div>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <span>Гігієнічна поведінка, %</span>
            <InfoTooltip text="Діапазон 0–100. Напр.: 92" />
          </li>
          <li className="flex items-center gap-2">
            <span>Форма черевця (1–5)</span>
            <InfoTooltip text="Шкала 1 – вузьке, 5 – широке" />
          </li>
          <li className="flex items-center gap-2">
            <span>Агресивність (1–5)</span>
            <InfoTooltip text="1 – миролюбна, 5 – агресивна" />
          </li>
        </ul>
      </div>
      {imported.length > 0 && (
        <div className="mb-2 text-sm text-[var(--secondary)]">Імпортовано записів: <b>{imported.length}</b></div>
      )}
      <p className="mb-4 text-sm text-[var(--secondary)]">
        Тут буде форма для введення фенотипічних ознак матки та колонії.
      </p>

      {tab === "form" && (<>
      {/* Морфологія */}
      <section className="mb-4">
        <div className="mb-2 text-sm font-medium">Морфологія</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Довжина тіла (мм)"
            type="number"
            min={5}
            max={30}
            step="0.1"
            value={form.morphology.lengthMm}
            onChange={set("morphology", "lengthMm")}
            hint="5–30 мм"
            error={errors.morphology?.lengthMm}
          />
          <Input
            label="Маса до (мг)"
            type="number"
            min={50}
            max={400}
            step="1"
            value={form.morphology.massPreMg}
            onChange={set("morphology", "massPreMg")}
            hint="Опційно"
            error={errors.morphology?.massPreMg}
          />
          <Input
            label="Маса після (мг)"
            type="number"
            min={50}
            max={500}
            step="1"
            value={form.morphology.massPostMg}
            onChange={set("morphology", "massPostMg")}
            hint="Опційно"
            error={errors.morphology?.massPostMg}
          />
          <Select
            label="Колір"
            value={form.morphology.color}
            onChange={set("morphology", "color")}
            items={[
              { label: "Оберіть…", value: "" },
              { label: "Світлий", value: "light" },
              { label: "Жовтий", value: "yellow" },
              { label: "Темний", value: "dark" },
              { label: "Чорний", value: "black" },
            ]}
          />
          <Select
            label="Форма черевця"
            value={String(form.morphology.abdomenShape || "")}
            onChange={(e) => setForm((f) => ({
              ...f,
              morphology: { ...f.morphology, abdomenShape: (e.target.value ? Number(e.target.value) : 0) as Scale | 0 },
            }))}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.morphology?.abdomenShape}
          />
          <Toggle
            checked={form.morphology.symmetry}
            onChange={set("morphology", "symmetry")}
            label="Симетрія"
          />
        </div>
        <div className="mt-3">
          <label className="flex w-full flex-col gap-1">
            <span className="text-xs font-medium text-[var(--secondary)]">Нотатки</span>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-[var(--divider)] bg-[var(--surface)] p-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              value={form.morphology.notes}
              onChange={set("morphology", "notes")}
              placeholder="Додаткові зауваження…"
            />
          </label>
        </div>
      </section>

      {/* Поведінка */}
      <section className="mb-4">
        <div className="mb-2 text-sm font-medium">Поведінка</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Select
            label="Агресивність (1–5)"
            value={String(form.behavior.aggression || "")}
            onChange={(e) => setForm((f) => ({
              ...f,
              behavior: { ...f.behavior, aggression: (e.target.value ? Number(e.target.value) : 0) as Scale | 0 },
            }))}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.behavior?.aggression}
          />
          <Select
            label="Ройливість (1–5)"
            value={String(form.behavior.swarming || "")}
            onChange={(e) => setForm((f) => ({
              ...f,
              behavior: { ...f.behavior, swarming: (e.target.value ? Number(e.target.value) : 0) as Scale | 0 },
            }))}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.behavior?.swarming}
          />
          <Input
            label="Гігієнічність (%)"
            type="number"
            min={0}
            max={100}
            value={form.behavior.hygienicPct}
            onChange={set("behavior", "hygienicPct")}
            hint="0–100%"
            error={errors.behavior?.hygienicPct}
          />
          <Select
            label="Зимостійкість (1–5)"
            value={String(form.behavior.winterHardiness || "")}
            onChange={(e) => setForm((f) => ({
              ...f,
              behavior: { ...f.behavior, winterHardiness: (e.target.value ? Number(e.target.value) : 0) as Scale | 0 },
            }))}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.behavior?.winterHardiness}
          />
        </div>
      </section>

      {/* Продуктивність */}
      <section className="mb-4">
        <div className="mb-2 text-sm font-medium">Продуктивність</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Input
            label="Яєць на добу"
            type="number"
            min={0}
            max={4000}
            value={form.productivity.eggsPerDay}
            onChange={set("productivity", "eggsPerDay")}
            error={errors.productivity?.eggsPerDay}
          />
          <Select
            label="Щільність розплоду (1–5)"
            value={String(form.productivity.broodDensity || "")}
            onChange={(e) => setForm((f) => ({
              ...f,
              productivity: { ...f.productivity, broodDensity: (e.target.value ? Number(e.target.value) : 0) as Scale | 0 },
            }))}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
          />
          <Input
            label="Мед, кг"
            type="number"
            min={0}
            max={200}
            step="0.1"
            value={form.productivity.honeyKg}
            onChange={set("productivity", "honeyKg")}
          />
          <Input
            label="Корм на зиму, кг"
            type="number"
            min={0}
            max={200}
            step="0.1"
            value={form.productivity.winterFeedKg}
            onChange={set("productivity", "winterFeedKg")}
          />
          <Select
            label="Весняний розвиток (1–5)"
            value={String(form.productivity.springDev || "")}
            onChange={(e) => setForm((f) => ({
              ...f,
              productivity: { ...f.productivity, springDev: (e.target.value ? Number(e.target.value) : 0) as Scale | 0 },
            }))}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
          />
        </div>
      </section>

      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={!isValid}>
          Зберегти запис
        </Button>
        <Button variant="secondary" onClick={reset}>
          Скинути
        </Button>
        {!isValid && (
          <span className="text-xs text-[var(--danger)]">Заповніть обовʼязкові поля</span>
        )}
      </div>
      </>)}

      {tab === "saved" && (
        <SavedList
          records={saved}
          onExport={() => exportCSV(saved)}
          onImport={(file) => handleImport(file, setSaved, push)}
        />
      )}
    </div>
  );
}

type SectionErrors<T> = Partial<Record<keyof T, string>>;
type Errors = {
  morphology?: SectionErrors<Draft["morphology"]>;
  behavior?: SectionErrors<Draft["behavior"]>;
  productivity?: SectionErrors<Draft["productivity"]>;
};

function validate(f: Draft): Errors {
  const e: {
    morphology: SectionErrors<Draft["morphology"]>;
    behavior: SectionErrors<Draft["behavior"]>;
    productivity: SectionErrors<Draft["productivity"]>;
  } = { morphology: {}, behavior: {}, productivity: {} };

  if (!(f.morphology.lengthMm >= 5 && f.morphology.lengthMm <= 30)) e.morphology.lengthMm = "5–30 мм";
  if (!f.morphology.color) e.morphology.color = "Оберіть колір";

  if (!(f.behavior.aggression >= 1 && f.behavior.aggression <= 5)) e.behavior.aggression = "1–5";
  if (!(f.behavior.hygienicPct >= 0 && f.behavior.hygienicPct <= 100)) e.behavior.hygienicPct = "0–100";

  if (!(f.productivity.eggsPerDay >= 0 && f.productivity.eggsPerDay <= 4000)) e.productivity.eggsPerDay = ">= 0";

  if (f.morphology.massPreMg && !(f.morphology.massPreMg >= 50 && f.morphology.massPreMg <= 400)) e.morphology.massPreMg = "50–400";
  if (f.morphology.massPostMg && !(f.morphology.massPostMg >= 50 && f.morphology.massPostMg <= 500)) e.morphology.massPostMg = "50–500";

  if (f.morphology.abdomenShape && !(f.morphology.abdomenShape >= 1 && f.morphology.abdomenShape <= 5)) e.morphology.abdomenShape = "1–5";
  if (f.behavior.swarming && !(f.behavior.swarming >= 1 && f.behavior.swarming <= 5)) e.behavior.swarming = "1–5";
  if (f.behavior.winterHardiness && !(f.behavior.winterHardiness >= 1 && f.behavior.winterHardiness <= 5)) e.behavior.winterHardiness = "1–5";
  if (f.productivity.broodDensity && !(f.productivity.broodDensity >= 1 && f.productivity.broodDensity <= 5)) e.productivity.broodDensity = "1–5";
  if (f.productivity.honeyKg && !(f.productivity.honeyKg >= 0 && f.productivity.honeyKg <= 200)) e.productivity.honeyKg = "0–200";
  if (f.productivity.winterFeedKg && !(f.productivity.winterFeedKg >= 0 && f.productivity.winterFeedKg <= 200)) e.productivity.winterFeedKg = "0–200";
  if (f.productivity.springDev && !(f.productivity.springDev >= 1 && f.productivity.springDev <= 5)) e.productivity.springDev = "1–5";

  // remove empty sections
  const out: Errors = {};
  if (Object.keys(e.morphology).length) out.morphology = e.morphology;
  if (Object.keys(e.behavior).length) out.behavior = e.behavior;
  if (Object.keys(e.productivity).length) out.productivity = e.productivity;
  return out;
}

function exportCSV(records: phenos.PhenotypeRecord[]) {
  if (!records.length) return;
  const csv = toCSV(records as unknown as Record<string, unknown>[]);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "phenotypes.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function SavedList({ records, onExport, onImport }: { records: phenos.PhenotypeRecord[]; onExport: () => void; onImport: (file: File) => void }) {
  const [inputId] = useState(() => `csv_${Math.random().toString(36).slice(2)}`);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="mt-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">Збережені записи</div>
        <div className="flex items-center gap-2">
          <input ref={inputRef} id={inputId} type="file" accept=".csv" className="hidden" onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            if (f) onImport(f);
            e.currentTarget.value = '';
          }} />
          <Button onClick={() => inputRef.current?.click()}>Імпорт CSV</Button>
          <Button onClick={onExport} disabled={records.length === 0}>Експорт CSV</Button>
        </div>
      </div>
      {records.length === 0 ? (
        <div className="text-sm text-[var(--secondary)]">Немає збережених записів</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--divider)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Коротко</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-[var(--divider)]">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">L={r.morphology.lengthMm} мм; Hyg={r.behavior.hygienicPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function handleImport(file: File, setSaved: React.Dispatch<React.SetStateAction<phenos.PhenotypeRecord[]>>, push: ReturnType<typeof useToast>["push"]) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result ?? '');
      const rows = parseCSV(text);
      const mapped = rows.map((r) => phenos.fromFlat(r as Record<string, string | number>));
      const res = phenos.upsertMany(mapped);
      setSaved(phenos.list());
      push({ title: `Імпортовано: додано ${res.added}, оновлено ${res.updated}`, tone: 'success' });
    } catch {
      push({ title: 'Помилка імпорту CSV', tone: 'danger' });
    }
  };
  reader.onerror = () => push({ title: 'Помилка читання файлу', tone: 'danger' });
  reader.readAsText(file);
}
