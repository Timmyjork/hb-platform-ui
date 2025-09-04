import type { PhenotypeInput, WhatIfParams } from './models'

export type Scenario = {
  id: string;
  name: string;
  input: PhenotypeInput;
  params: WhatIfParams;
  createdAt: string;
  updatedAt: string;
};

const LS_KEY = 'analytics:whatif:scenarios:v1';

function readAll(): Scenario[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Scenario[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: Scenario[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function listScenarios(): Scenario[] {
  return readAll();
}

export function saveScenario(s: Scenario): void {
  const all = readAll();
  const idx = all.findIndex((x) => x.id === s.id);
  if (idx >= 0) all[idx] = { ...all[idx], ...s, updatedAt: new Date().toISOString() };
  else all.push({ ...s, createdAt: s.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() });
  writeAll(all);
}

export function removeScenario(id: string): void {
  const all = readAll().filter((x) => x.id !== id);
  writeAll(all);
}

export function duplicateScenario(id: string): string {
  const all = readAll();
  const src = all.find((x) => x.id === id);
  if (!src) return '';
  const nid = `wf_${Math.random().toString(36).slice(2,8)}`;
  const now = new Date().toISOString();
  const copy: Scenario = { ...src, id: nid, name: `${src.name} (copy)`, createdAt: now, updatedAt: now };
  all.push(copy);
  writeAll(all);
  return nid;
}

