// src/pages/Phenotypes.tsx
import React, { useState } from "react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";

type Form = {
  queenId: string;

  // Морфологічні
  lengthMm?: number;
  massBeforeMg?: number;
  massAfterMg?: number;
  color?: "light" | "yellow" | "dark" | "black";
  abdomenShape?: 1 | 2 | 3 | 4 | 5;
  symmetryOk?: boolean;
  symmetryComment?: string;

  // Поведінкові
  aggression?: 1 | 2 | 3 | 4 | 5;
  swarming?: 1 | 2 | 3 | 4 | 5;
  hygienic?: number; // 0–100
  winterHardiness?: 1 | 2 | 3 | 4 | 5;

  // Продуктивні
  eggLayingPerDay?: number;
  broodDensity?: 1 | 2 | 3 | 4 | 5;
  honeyKg?: number;
  winterFeedKg?: number;
  springDev?: 1 | 2 | 3 | 4 | 5;
};

const SCALE_1_5 = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
] as const;

export default function Phenotypes() {
  const [form, setForm] = useState<Form>({ queenId: "" });
  const [saving, setSaving] = useState(false);

  function up<K extends keyof Form>(key: K, val: Form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    console.log("Phenotype payload:", form);
    setTimeout(() => {
      setSaving(false);
      alert("Фенотипи збережено (демо). Перевір консоль.");
    }, 600);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Фенотипи</h1>
        <p className="mt-1 text-sm text-[var(--secondary)]">
          Заповни значення ознак для матки/колонії. Поля необовʼязкові, окрім ідентифікатора.
        </p>

        {/* Базове */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="ID матки / колонії"
            placeholder="UA-QUEEN-2025-001"
            value={form.queenId}
            onChange={(e) => up("queenId", e.target.value)}
            required
          />
        </div>
      </div>

      <Section title="Морфологічні">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Довжина матки, мм"
            type="number"
            min={0}
            step="0.1"
            value={form.lengthMm ?? ""}
            onChange={(e) => up("lengthMm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <Input
            label="Маса до обльоту, мг"
            type="number"
            min={0}
            step="1"
            value={form.massBeforeMg ?? ""}
            onChange={(e) => up("massBeforeMg", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <Input
            label="Маса після обльоту, мг"
            type="number"
            min={0}
            step="1"
            value={form.massAfterMg ?? ""}
            onChange={(e) => up("massAfterMg", e.target.value === "" ? undefined : Number(e.target.value))}
          />

          <Select
            label="Колір тулуба"
            value={form.color ?? ""}
            onChange={(v) => up("color", (v || undefined) as Form["color"])}
            items={[
              { key: "", label: "—" },
              { key: "light", label: "Світлий" },
              { key: "yellow", label: "Жовтий" },
              { key: "dark", label: "Темний" },
              { key: "black", label: "Чорний" },
            ]}
          />
          <Select
            label="Форма черевця (1–5)"
            value={(form.abdomenShape as number) ?? ""}
            onChange={(v) => up("abdomenShape", (v ? Number(v) : undefined) as Form["abdomenShape"])}
            items={[{ key: "", label: "—" }, ...SCALE_1_5.map((i) => ({ key: String(i.value), label: i.label }))]}
          />
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.symmetryOk}
                onChange={(e) => up("symmetryOk", e.target.checked)}
              />
              Симетрія/дефекти — ок
            </label>
            <Input
              className="flex-1"
              label="Коментар"
              placeholder="За потреби уточнення"
              value={form.symmetryComment ?? ""}
              onChange={(e) => up("symmetryComment", e.target.value || undefined)}
            />
          </div>
        </div>
      </Section>

      <Section title="Поведінкові">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SelectNumber label="Агресивність / миролюбність (1–5)" value={form.aggression} onChange={(v) => up("aggression", v)} />
          <SelectNumber label="Схильність до роїння (1–5)" value={form.swarming} onChange={(v) => up("swarming", v)} />
          <Input
            label="Гігієнічна поведінка, %"
            type="number"
            min={0}
            max={100}
            step="1"
            value={form.hygienic ?? ""}
            onChange={(e) => up("hygienic", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <SelectNumber label="Зимостійкість (1–5)" value={form.winterHardiness} onChange={(v) => up("winterHardiness", v)} />
        </div>
      </Section>

      <Section title="Продуктивні">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Input
            label="Яйценосність, яєць/добу"
            type="number"
            min={0}
            step="1"
            value={form.eggLayingPerDay ?? ""}
            onChange={(e) => up("eggLayingPerDay", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <SelectNumber label="Щільність засіву (1–5)" value={form.broodDensity} onChange={(v) => up("broodDensity", v)} />
          <Input
            label="Медова продуктивність, кг"
            type="number"
            min={0}
            step="0.1"
            value={form.honeyKg ?? ""}
            onChange={(e) => up("honeyKg", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <Input
            label="Використання кормів взимку, кг"
            type="number"
            min={0}
            step="0.1"
            value={form.winterFeedKg ?? ""}
            onChange={(e) => up("winterFeedKg", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <SelectNumber label="Весняний розвиток (1–5)" value={form.springDev} onChange={(v) => up("springDev", v)} />
        </div>
      </Section>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={!form.queenId} loading={saving}>
          {saving ? "Збереження…" : "Зберегти"}
        </Button>
        <Button variant="ghost" type="button" onClick={() => setForm({ queenId: "" })}>
          Очистити
        </Button>
      </div>
    </form>
  );
}

/* Допоміжні */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium text-[var(--secondary)]">{title}</div>
      {children}
    </section>
  );
}

function SelectNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: 1 | 2 | 3 | 4 | 5;
  onChange: (v?: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <Select
      label={label}
      value={(value as number) ?? ""}
      onChange={(v) => onChange((v ? (Number(v) as 1 | 2 | 3 | 4 | 5) : undefined))}
      items={[{ key: "", label: "—" }, ...SCALE_1_5.map((i) => ({ key: String(i.value), label: i.label }))]}
    />
  );
}
