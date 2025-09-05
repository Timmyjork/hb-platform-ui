export type Lang = 'uk'|'en'
const LS = 'hb.lang'
let current: Lang = (localStorage.getItem(LS) as Lang) || 'uk'
let dict: Record<string,string> = {}
async function load(l: Lang) {
  try { dict = (await import(`./${l}.json`)).default as Record<string,string> } catch { dict = {} }
}
void load(current)
export function setLang(l: Lang): void { current = l; localStorage.setItem(LS, l); void load(l) }
export function getLang(): Lang { return current }
export function t(key: string, vars?: Record<string, string|number>): string {
  let s = dict[key] || key
  if (vars) for (const [k,v] of Object.entries(vars)) s = s.replace(new RegExp(`{${k}}`,'g'), String(v))
  return s
}
