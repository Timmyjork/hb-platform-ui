export type Milestone = {
  id: string
  label: string
  done: boolean
}

export const MILESTONES: Milestone[] = [
  { id: 'V01', label: 'Базовий шолл + навігація', done: true },
  { id: 'V02', label: 'Магазин (публ.)', done: true },
  { id: 'V03', label: 'Профіль маткаря', done: true },
  { id: 'V04', label: 'Вуликова карта (спостереження)', done: true },
  { id: 'V05', label: 'Паспорт ID + партії', done: true },
  { id: 'V06', label: 'Аналітика v6 (сегменти/url)', done: true },
  { id: 'V07', label: 'Рейтинги v7', done: true },
  { id: 'V08', label: 'Регіональна v8', done: true },
  { id: 'V09', label: 'Алерти v9', done: true },
  { id: 'V10', label: 'Підписки/дайджести', done: true },
  { id: 'V11', label: 'Магазин PRO (основи)', done: true },
  { id: 'V12', label: 'Публічні картки/SEO', done: true },
  { id: 'V13', label: 'Відгуки/Q&A (публ.)', done: true },
  { id: 'V14', label: 'Модерація', done: true },
  { id: 'V15', label: 'Платежі (схема)', done: true },
  { id: 'V16', label: 'Профілі PRO', done: true },
  { id: 'V17', label: 'Каталог маткарів', done: true },
  { id: 'V18', label: 'Магазин PRO ч.2', done: true },
  { id: 'V19', label: 'Експорт-центр', done: true },
  { id: 'V20', label: 'Імпорт/Експорт (adm)', done: true },
  { id: 'V21', label: 'Аудит/журнали', done: true },
  { id: 'V22', label: 'Довідники', done: true },
  { id: 'V23', label: 'Публічні сторінки', done: true },
  { id: 'V24', label: 'RBAC_NAV_V1', done: true },
]

export function computeProgress() {
  const total = MILESTONES.length
  const done = MILESTONES.filter((m) => m.done).length
  const pct = total ? Math.round((done / total) * 100) : 0

  // версію до v1 рахуємо лінійно: 0.0..1.0
  const version = (done / total).toFixed(2) // "0.50"
  const vMajor = Number(version) >= 1 ? '1.0' : version.replace(/^0\./, '0.')
  return { done, total, pct, vText: `v${vMajor}` }
}

