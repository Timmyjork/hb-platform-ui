//

import CatalogFilters from '../components/catalog/Filters'

export default function ShopCatalog() {
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Вибір маток</h1>
      <CatalogFilters />
      <div className="mt-2 text-sm text-[var(--secondary)]">Каталог лістингів (MVP)</div>
    </div>
  )
}
