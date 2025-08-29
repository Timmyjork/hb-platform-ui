import React, { useEffect, useMemo, useState } from "react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";

type Draft = {
  // Морфологія
  lengthMm: string;
  massPreMg: string;
  massPostMg: string;
  color: "" | "light" | "yellow" | "dark" | "black";
  abdomenShape: string; // 1..5
  symmetry: boolean;
  notes: string;
  // Поведінка
  aggression: string; // 1..5
  swarming: string; // 1..5
  hygienicPct: string; // 0..100
  winterHardiness: string; // 1..5
  // Продуктивність
  eggsPerDay: string;
  broodDensity: string; // 1..5
  honeyKg: string;
  winterFeedKg: string;
  springDev: string; // 1..5
};

const LS_KEY = "hb:phenotypes:draft" as const;

const emptyDraft: Draft = {
  lengthMm: "",
  massPreMg: "",
  massPostMg: "",
  color: "",
  abdomenShape: "",
  symmetry: false,
  notes: "",
  aggression: "",
  swarming: "",
  hygienicPct: "",
  winterHardiness: "",
  eggsPerDay: "",
  broodDensity: "",
  honeyKg: "",
  winterFeedKg: "",
  springDev: "",
};

export default function Phenotypes() {
  const [form, setForm] = useState<Draft>(emptyDraft);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setForm({ ...emptyDraft, ...(JSON.parse(raw) as Draft) });
    } catch {
      /* ignore */
    }
  }, []);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const onChange = (key: keyof Draft) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.currentTarget.type === "checkbox" ? (e.currentTarget as HTMLInputElement).checked : e.currentTarget.value;
    setForm((f) => ({ ...f, [key]: value } as Draft));
  };

  const save = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(form));
  };

  const reset = () => {
    setForm(emptyDraft);
    localStorage.removeItem(LS_KEY);
  };

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold mb-2">Фенотипи</h1>
      <p className="mb-4 text-sm text-[var(--secondary)]">
        Тут буде форма для введення фенотипічних ознак матки та колонії.
      </p>

      {/* Морфологія */}
      <section className="mb-4">
        <div className="mb-2 text-sm font-medium">Морфологія</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Довжина тіла (мм)"
            type="number"
            min={3}
            max={15}
            step="0.1"
            value={form.lengthMm}
            onChange={onChange("lengthMm")}
            hint="3–15 мм"
            error={errors.lengthMm}
          />
          <Input
            label="Маса до (мг)"
            type="number"
            min={50}
            max={400}
            step="1"
            value={form.massPreMg}
            onChange={onChange("massPreMg")}
            hint="Опційно"
            error={errors.massPreMg}
          />
          <Input
            label="Маса після (мг)"
            type="number"
            min={50}
            max={500}
            step="1"
            value={form.massPostMg}
            onChange={onChange("massPostMg")}
            hint="Опційно"
            error={errors.massPostMg}
          />
          <Select
            label="Колір"
            value={form.color}
            onChange={onChange("color")}
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
            value={form.abdomenShape}
            onChange={onChange("abdomenShape")}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.abdomenShape}
          />
          <Toggle
            checked={form.symmetry}
            onChange={onChange("symmetry")}
            label="Симетрія"
          />
        </div>
        <div className="mt-3">
          <label className="flex w-full flex-col gap-1">
            <span className="text-xs font-medium text-[var(--secondary)]">Нотатки</span>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-[var(--divider)] bg-[var(--surface)] p-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              value={form.notes}
              onChange={onChange("notes")}
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
            value={form.aggression}
            onChange={onChange("aggression")}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.aggression}
          />
          <Select
            label="Ройливість (1–5)"
            value={form.swarming}
            onChange={onChange("swarming")}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.swarming}
          />
          <Input
            label="Гігієнічність (%)"
            type="number"
            min={0}
            max={100}
            value={form.hygienicPct}
            onChange={onChange("hygienicPct")}
            hint="0–100%"
            error={errors.hygienicPct}
          />
          <Select
            label="Зимостійкість (1–5)"
            value={form.winterHardiness}
            onChange={onChange("winterHardiness")}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
            error={errors.winterHardiness}
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
            value={form.eggsPerDay}
            onChange={onChange("eggsPerDay")}
            error={errors.eggsPerDay}
          />
          <Select
            label="Щільність розплоду (1–5)"
            value={form.broodDensity}
            onChange={onChange("broodDensity")}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
          />
          <Input
            label="Мед, кг"
            type="number"
            min={0}
            max={200}
            step="0.1"
            value={form.honeyKg}
            onChange={onChange("honeyKg")}
          />
          <Input
            label="Корм на зиму, кг"
            type="number"
            min={0}
            max={200}
            step="0.1"
            value={form.winterFeedKg}
            onChange={onChange("winterFeedKg")}
          />
          <Select
            label="Весняний розвиток (1–5)"
            value={form.springDev}
            onChange={onChange("springDev")}
            items={[{ label: "Оберіть…", value: "" }, ...[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))]}
          />
        </div>
      </section>

      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={!isValid}>
          Зберегти
        </Button>
        <Button variant="secondary" onClick={reset}>
          Скинути
        </Button>
        {!isValid && (
          <span className="text-xs text-[var(--danger)]">Заповніть обовʼязкові поля</span>
        )}
      </div>
    </div>
  );
}

function validate(f: Draft): Partial<Record<keyof Draft, string>> {
  const e: Partial<Record<keyof Draft, string>> = {};

  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

  // Обовʼязкові: lengthMm, color, aggression, hygienicPct, eggsPerDay
  const len = num(f.lengthMm);
  if (!(len >= 3 && len <= 15)) e.lengthMm = "3–15 мм";

  if (!f.color) e.color = "Оберіть колір";

  const agg = Number(f.aggression);
  if (!(agg >= 1 && agg <= 5)) e.aggression = "1–5";

  const hyg = num(f.hygienicPct);
  if (!(hyg >= 0 && hyg <= 100)) e.hygienicPct = "0–100";

  const eggs = num(f.eggsPerDay);
  if (!(eggs >= 0 && eggs <= 4000)) e.eggsPerDay = ">= 0";

  // Додаткові (необовʼязкові) — перевіряємо, якщо вказано
  const pre = num(f.massPreMg);
  if (f.massPreMg && !(pre >= 50 && pre <= 400)) e.massPreMg = "50–400";
  const post = num(f.massPostMg);
  if (f.massPostMg && !(post >= 50 && post <= 500)) e.massPostMg = "50–500";

  const abd = Number(f.abdomenShape);
  if (f.abdomenShape && !(abd >= 1 && abd <= 5)) e.abdomenShape = "1–5";

  const swarm = Number(f.swarming);
  if (f.swarming && !(swarm >= 1 && swarm <= 5)) e.swarming = "1–5";

  const wh = Number(f.winterHardiness);
  if (f.winterHardiness && !(wh >= 1 && wh <= 5)) e.winterHardiness = "1–5";

  const dens = Number(f.broodDensity);
  if (f.broodDensity && !(dens >= 1 && dens <= 5)) e.broodDensity = "1–5";

  const hk = num(f.honeyKg);
  if (f.honeyKg && !(hk >= 0 && hk <= 200)) e.honeyKg = "0–200";
  const wk = num(f.winterFeedKg);
  if (f.winterFeedKg && !(wk >= 0 && wk <= 200)) e.winterFeedKg = "0–200";

  const sd = Number(f.springDev);
  if (f.springDev && !(sd >= 1 && sd <= 5)) e.springDev = "1–5";

  return e;
}
