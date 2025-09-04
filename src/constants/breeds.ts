export type Breed = {
  code: string;          // стабільний ключ для зберігання
  label: string;         // те, що показуємо в UI
  latin?: string;        // латинська/наукова назва (якщо є)
  synonyms?: string[];   // варіанти написання для пошуку/імпорту
};

export const BREEDS: Breed[] = [
  {
    code: 'carpatica',
    label: 'Карпатська бджола',
    latin: 'Apis mellifera carpatica',
    synonyms: ['карпатка', 'карпатська'],
  },
  {
    code: 'ukr_steppe',
    label: 'Українська степова бджола',
    latin: 'Apis mellifera sossimai',
    synonyms: ['українська степова', 'степова'],
  },
  {
    code: 'mellifera',
    label: 'Європейська темна бджола',
    latin: 'Apis mellifera mellifera',
    synonyms: ['чорна', 'середньоєвропейська', 'європейська темна'],
  },
  {
    code: 'carnica',
    label: 'Карніка',
    latin: 'Apis mellifera carnica',
    synonyms: ['країнська', 'країніка', 'карніка'],
  },
  {
    code: 'buckfast',
    label: 'Бакфаст',
    latin: 'Buckfast (selective hybrid)',
    synonyms: ['бакфаст', 'buckfast'],
  },
  {
    code: 'ligustica',
    label: 'Італійська (Лігустіка)',
    latin: 'Apis mellifera ligustica',
    synonyms: ['італійська', 'лігустика', 'ligustica'],
  },
  {
    code: 'caucasica',
    label: 'Кавказька',
    latin: 'Apis mellifera caucasica',
    synonyms: ['кавказька', 'caucasica'],
  },
  {
    code: 'middle_russian',
    label: 'Середньоруська',
    latin: 'Apis mellifera mellifera (популяція)',
    synonyms: ['середньоруська', 'middle russian'],
  },
  {
    code: 'primorsky',
    label: 'Приморська',
    latin: 'Primorsky (selective population)',
    synonyms: ['приморська', 'primorsky'],
  },
  {
    code: 'anatoliaca',
    label: 'Анатолійська',
    latin: 'Apis mellifera anatoliaca',
    synonyms: ['анатолійська', 'anatoliaca'],
  },
  {
    code: 'macedonica',
    label: 'Македонська',
    latin: 'Apis mellifera macedonica',
    synonyms: ['македонська', 'macedonica'],
  },
  {
    code: 'siciliana',
    label: 'Сицилійська',
    latin: 'Apis mellifera siciliana',
    synonyms: ['сицилійська', 'siciliana', 'sicula'],
  },
  // універсальні варіанти:
  {
    code: 'local_mixed',
    label: 'Місцева/мішана',
    synonyms: ['місцева', 'помісь', 'мішана', 'local', 'mixed'],
  },
  {
    code: 'custom_line',
    label: 'Лінія / Екопопуляція (власна назва)',
    synonyms: ['лінія', 'екопопуляція', 'line', 'strain'],
  },
];

export default BREEDS;

// Helper: match input (code/label/synonym) to canonical breed code
export function matchBreed(input: string): string | null {
  const q = (input || '').trim().toLowerCase();
  if (!q) return null;
  for (const b of BREEDS) {
    if (b.code.toLowerCase() === q) return b.code;
    if (b.label.toLowerCase() === q) return b.code;
    if (b.synonyms?.some((s) => s.toLowerCase() === q)) return b.code;
  }
  return null;
}

// Mapping between breed slug code and numeric lineage for passport IDs (1..99)
const BREED_NUMERIC: Record<string, number> = {
  carnica: 1,
  carpatica: 2,
  buckfast: 3,
  ligustica: 4,
  ukr_steppe: 5,
  caucasica: 6,
  mellifera: 7,
  local_mixed: 8,
  custom_line: 9,
};

export function breedSlugToLineageCode(slug: string): string {
  const n = BREED_NUMERIC[slug as keyof typeof BREED_NUMERIC];
  return String(n || 1);
}

export function lineageCodeToBreedSlug(code: string): string | null {
  const n = Number(code);
  const found = Object.entries(BREED_NUMERIC).find(([, v]) => v === n);
  return found?.[0] ?? null;
}
