export type RegionUA = {
  code: string;     // ISO 3166-2 (де можливо)
  label: string;    // повна назва в Н.в.
  short: string;    // коротко = те саме (для UI фільтрів)
  slug: string;     // латинізований ключ для URL/пошуку
};

export const UA_REGIONS: RegionUA[] = [
  { code: 'UA-05', label: 'Вінницька область', short: 'Вінницька', slug: 'vinnytska' },
  { code: 'UA-07', label: 'Волинська область', short: 'Волинська', slug: 'volynska' },
  { code: 'UA-12', label: 'Дніпропетровська область', short: 'Дніпропетровська', slug: 'dnipropetrovska' },
  { code: 'UA-14', label: 'Донецька область', short: 'Донецька', slug: 'donetska' },
  { code: 'UA-18', label: 'Житомирська область', short: 'Житомирська', slug: 'zhytomyrska' },
  { code: 'UA-21', label: 'Закарпатська область', short: 'Закарпатська', slug: 'zakarpatska' },
  { code: 'UA-23', label: 'Запорізька область', short: 'Запорізька', slug: 'zaporizka' },
  { code: 'UA-26', label: 'Івано-Франківська область', short: 'Івано-Франківська', slug: 'ivano-frankivska' },
  { code: 'UA-32', label: 'Київська область', short: 'Київська', slug: 'kyivska' },
  { code: 'UA-35', label: 'Кіровоградська область', short: 'Кіровоградська', slug: 'kirovohradska' },
  { code: 'UA-44', label: 'Луганська область', short: 'Луганська', slug: 'luhanska' },
  { code: 'UA-46', label: 'Львівська область', short: 'Львівська', slug: 'lvivska' },
  { code: 'UA-48', label: 'Миколаївська область', short: 'Миколаївська', slug: 'mykolaivska' },
  { code: 'UA-51', label: 'Одеська область', short: 'Одеська', slug: 'odeska' },
  { code: 'UA-53', label: 'Полтавська область', short: 'Полтавська', slug: 'poltavska' },
  { code: 'UA-56', label: 'Рівненська область', short: 'Рівненська', slug: 'rivnenska' },
  { code: 'UA-59', label: 'Сумська область', short: 'Сумська', slug: 'sumska' },
  { code: 'UA-61', label: 'Тернопільська область', short: 'Тернопільська', slug: 'ternopilska' },
  { code: 'UA-63', label: 'Харківська область', short: 'Харківська', slug: 'kharkivska' },
  { code: 'UA-65', label: 'Херсонська область', short: 'Херсонська', slug: 'khersonska' },
  { code: 'UA-68', label: 'Хмельницька область', short: 'Хмельницька', slug: 'khmelnytska' },
  { code: 'UA-71', label: 'Черкаська область', short: 'Черкаська', slug: 'cherkaska' },
  { code: 'UA-73', label: 'Чернівецька область', short: 'Чернівецька', slug: 'chernivetska' },
  { code: 'UA-74', label: 'Чернігівська область', short: 'Чернігівська', slug: 'chernihivska' },
];

export default UA_REGIONS;

export function findRegion(q: string): (typeof UA_REGIONS)[number] | null {
  const s = (q || '').trim().toLowerCase()
  if (!s) return null
  // accept exact code UA-XX case-insensitive
  const byCode = UA_REGIONS.find(r => r.code.toLowerCase() === s)
  if (byCode) return byCode
  // accept numeric suffix like '32'
  const num = s.match(/^(ua-)?0?(\d{1,2})$/i)?.[2]
  if (num) {
    const withNum = UA_REGIONS.find(r => r.code.endsWith(`-${String(num).padStart(2,'0')}`))
    if (withNum) return withNum
  }
  const bySlug = UA_REGIONS.find(r => r.slug.toLowerCase() === s)
  if (bySlug) return bySlug
  const byShort = UA_REGIONS.find(r => r.short.toLowerCase() === s)
  if (byShort) return byShort
  const byLabel = UA_REGIONS.find(r => r.label.toLowerCase() === s)
  if (byLabel) return byLabel
  return null
}
