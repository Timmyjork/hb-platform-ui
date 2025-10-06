import React, { useEffect, useMemo, useState } from "react";
import { ToastProvider, useToast } from "./components/ui/Toast";
import { AuthProvider } from './auth/useAuth'
import AuthMenu from './auth/AuthMenu'
import { NAV_BY_ROLE, type RoleKey as NewRoleKey } from './infra/rbac'
import { getAuth as getProfileAuth, onAuthChange as onProfileAuthChange, setRole as setProfileRole, type RoleKey as StoreRoleKey } from './state/profile.store'
import { parsePath, buildPath } from './router/pathRouter'
import DataTable from "./components/table/DataTable";
import type { Row as QueenRow } from "./components/table/DataTable";
import Button from "./components/ui/Button";
import CartButton from "./components/ui/CartButton";
import BeekeeperQueens from "./pages/BeekeeperQueens";
// keep Phenotypes imported by tests in other places via wrapper page
import HiveCard from "./pages/HiveCard";
import AnalyticsRatings from "./pages/AnalyticsRatings";
import AnalyticsRegional from "./pages/AnalyticsRegional";
import AnalyticsAlerts from "./pages/AnalyticsAlerts";
import AnalyticsReadOnly from './pages/AnalyticsReadOnly'
import AnalyticsWhatIf from "./pages/AnalyticsWhatIf";
import QueensCreateBatch from "./pages/QueensCreateBatch";
import Observations from './pages/Observations'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import BreederListings from './pages/BreederListings'
import BreederKYC from './pages/BreederKYC'
import KYCModeration from './pages/KYCModeration'
import Orders from './pages/Orders'
import Transfer from './pages/Transfer'
import ImportExport from './pages/ImportExport'
import ExportCenter from './pages/ExportCenter'
import SettingsDev from './pages/SettingsDev'
import Moderation from './pages/Moderation'
import BreederDashboard from './pages/BreederDashboard'
import BreedersCatalog from './pages/BreedersCatalog'
import BreederPublic from './pages/BreederPublic'
import QueenPublic from './pages/QueenPublic'
import AdminDictionaries from './pages/AdminDictionaries'
import AdminModeration from './pages/AdminModeration'
import AdminReviews from './pages/AdminReviews'
import AdminQA from './pages/AdminQA'
import AdminBreeders from './pages/AdminBreeders'
import AdminDicts from './pages/AdminDicts'
import AdminAudit from './pages/AdminAudit'
// import BuildStamp from './components/BuildStamp' // footer disabled to avoid duplication
import HeaderVersionBadge from './components/HeaderVersionBadge'
import HeaderRoleQuickSwitch from './components/HeaderRoleQuickSwitch'

// New RBAC-based nav lives in src/nav.ts

function AppIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3 6 6 .9-4.5 4.4 1.1 6.3L12 16.8 6.4 19.6l1.1-6.3L3 8.9 9 8l3-6z" />
    </svg>
  );
}

// ——— Демо-дані для таблиці маток
const demoRows: QueenRow[] = [
  { id: "UA-QUEEN-2025-001", breed: "Карніка / Peschetz", year: 2025, si: 82, bv: 12, status: "Активна" },
  { id: "UA-QUEEN-2025-014", breed: "Карпатка / Лінія Х", year: 2025, si: 79, bv: 9, status: "На продаж" },
  { id: "UA-QUEEN-2024-021", breed: "Бакфаст / B3", year: 2024, si: 84, bv: 11, status: "Активна" },
  { id: "UA-QUEEN-2023-008", breed: "Місцева / L2", year: 2023, si: 71, bv: 4, status: "Архів" },
];

function Shell() {
  const [role, setRoleEff] = useState<StoreRoleKey>('guest')
  const [active, setActive] = useState<string>('shop')
  const items = useMemo(() => NAV_BY_ROLE[role] ?? [], [role])
  const isValid = items.some(i => i.id === active)
  const current = isValid ? active : (items[0]?.id ?? 'shop')
  useEffect(() => {
    // Initialize from profile.store and subscribe
    setRoleEff(getProfileAuth().role)
    const off = onProfileAuthChange(() => { setRoleEff(getProfileAuth().role) })
    return off
  }, [])
  useEffect(() => {
    // Parse URL path for role + page
    const base = (import.meta as any).env?.BASE_URL || '/'
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const qRole = params.get('role') as StoreRoleKey | null
    const { role: roleFromPath, pageId } = parsePath(base, typeof window !== 'undefined' ? window.location.pathname : '/')
    const nextRole = qRole || roleFromPath
    if (nextRole) { try { localStorage.setItem('hb.role', nextRole) } catch (_e) { /* ignore */ }; setProfileRole(nextRole) }
    if (pageId) setActive(pageId)
  }, [])
  useEffect(() => {
    // Keep URL in sync with current role + page
    const base = (import.meta as any).env?.BASE_URL || '/'
    const path = buildPath(base, role, current)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', path)
    }
  }, [role, current])
  useEffect(() => {
    if (!items.length) return
    if (!items.some(i => i.id === active)) {
      setActive(items[0]?.id ?? 'shop')
    }
  }, [role, items, active])
  const nav = useMemo(() => items, [items])

  return (
    <ToastProvider>
      <div
        style={
          {
            "--primary": "#0EA5E9",
            "--text": "#0F172A",
            "--secondary": "#6B7280",
            "--bg": "#F6F7F9",
            "--surface": "#FFFFFF",
            "--divider": "#E5E7EB",
            "--success": "#22C55E",
            "--warning": "#F59E0B",
            "--danger": "#EF4444",
            "--info": "#3B82F6",
          } as React.CSSProperties
        }
        className="min-h-screen bg-[var(--bg)] text-[var(--text)]"
      >
        {/* Верхня панель */}
        <header className="sticky top-0 z-40 border-b border-[var(--divider)] bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80">
          <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <AppIcon />
              <span className="text-sm font-semibold">HB Platform UI</span>
            </div>
            <div className="ml-2 hidden flex-1 items-center md:flex">
              <input
                aria-label="Пошук"
                placeholder="Пошук (⌘/Ctrl K)"
                className="w-full rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="hidden md:inline rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-sm hover:bg-gray-50" onClick={()=> setActive('shop')}>Вибір маток</button>
              <HeaderVersionBadge />
              <HeaderRoleQuickSwitch />
              {(role==='buyer' || role==='breeder') && (
                <button className="hidden md:inline rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-sm hover:bg-gray-50" onClick={()=> setActive(role==='breeder' ? 'breeder_dashboard':'my_queens')}>Мій профіль</button>
              )}
              <CartButton onClick={() => setActive('cart')} />
              <AuthMenu onRoleSync={() => { /* role changes propagate via context */ }} />
              <div className="hidden">
                <RoleSelector value={role} onChange={(v) => { try { localStorage.setItem('ui.role', v) } catch (_e) { /* ignore */ }; setProfileRole(v as StoreRoleKey) }} />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
          {/* Бокове меню */}
          <aside data-testid="nav" role="navigation" className="border-r border-[var(--divider)] bg-[var(--surface)] p-3">
            <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--secondary)]">
              Навігація
            </div>
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActive(item.id)}
                    className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                      current === item.id
                        ? "bg-[var(--primary)]/10 text-[var(--text)] ring-1 ring-[var(--primary)]"
                        : "hover:bg-gray-100"
                    }`}
                    aria-current={current === item.id ? "page" : undefined}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Головний вміст */}
          <main className="min-h-[calc(100vh-56px)] p-4 md:p-6">
            <Breadcrumb roleKey={role} activeId={current} />

            {/* Для маткаря (queens) */}
            {role === "breeder" && current === "queens" && (
              <>
                <HeaderActions />
                <section className="mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <KpiCard title="Селекційний індекс (середнє)" value="82" tone="info" hint="Оновлено щойно" />
                    <KpiCard title="Племінна цінність BV (медіана)" value="+12" tone="success" hint="Модель BLUP" />
                    <KpiCard title="Записи" value="1 248" tone="default" hint="Фільтри застосовано" />
                  </div>
                  <div className="mt-6">
                    <DataTable rows={demoRows} />
                  </div>
                </section>
              </>
            )}

            {/* Для пасічника (каталог/мої матки) */}
            {role === "buyer" && current === "catalog" && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-xl font-semibold">Мої матки / Куплені</h1>
                </div>
                <BeekeeperQueens />
              </>
            )}

            {role === "buyer" && current === "my_queens" && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-xl font-semibold">Мої матки</h1>
                </div>
                <BeekeeperQueens />
              </>
            )}

            {/* Вуликова карта */}
            {current === "observations" && <Observations />}

            {/* Вуликові карти */}
            {current === "hive_card" && <HiveCard />}

            {/* Нова партія маток (breeder) */}
            {role === "breeder" && current === "queens_batch" && <QueensCreateBatch />}

            {/* Публічні маршрути (спрощено без роутера) */}
            {typeof window !== 'undefined' && window.location.pathname.startsWith('/breeders') && <BreedersCatalog />}
            {typeof window !== 'undefined' && window.location.pathname.startsWith('/breeder/') && <BreederPublic />}
            {typeof window !== 'undefined' && (window.location.pathname.startsWith('/q/') || window.location.pathname.startsWith('/queen/')) && <QueenPublic />}

            {/* Вибір маток / Покупки */}
            {['guest','buyer','breeder','regional_admin'].includes(role) && current === 'shop' && <Shop />}
            {current === 'cart' && <Cart />}
            {role === 'buyer' && current === 'checkout' && <Checkout />}
            {/* Buyer/Regional readonly analytics + export */}
            {['buyer','regional_admin'].includes(role) && current === 'analytics_readonly' && <AnalyticsReadOnly />}
            {['guest','buyer','regional_admin'].includes(role) && current === 'ratings_public' && <AnalyticsRatings />}
            {['buyer','regional_admin'].includes(role) && current === 'export_center' && <ExportCenter />}
            {/* Breeder profile & tools */}
            {role === 'breeder' && current === 'breeder_listings' && <BreederListings />}
            {role === 'breeder' && current === 'breeder_dashboard' && <BreederDashboard />}
            {role === 'breeder' && current === 'transfer' && <Transfer />}
            {role === 'breeder' && current === 'import_export' && <ImportExport />}
            {role === 'breeder' && current === 'kyc' && <BreederKYC />}
            {role === 'internal' && current === 'kyc_moderation' && <KYCModeration />}
            {role === 'internal' && current === 'admin_dictionaries' && <AdminDictionaries />}
            {role === 'internal' && current === 'admin_moderation' && <AdminModeration />}
            {role === 'internal' && current === 'admin_reviews' && <AdminReviews />}
            {role === 'internal' && current === 'admin_qa' && <AdminQA />}
            {role === 'internal' && current === 'admin_breeders' && <AdminBreeders />}
            {role === 'internal' && current === 'admin_dicts' && <AdminDicts />}
            {role === 'internal' && current === 'admin_audit' && <AdminAudit />}
            {['internal','regional_admin'].includes(role) && current === 'moderation' && <Moderation />}
            {/* Orders */}
            {['buyer','breeder','regional_admin'].includes(role) && current === 'orders' && <Orders />}
            

            {/* Аналітика — What-if */}
            {current === "analytics_whatif" && <AnalyticsWhatIf />}

            {/* Аналітика — Рейтинги */}
            {current === "analytics_ratings" && <AnalyticsRatings />}

            {/* Аналітика — Регіони */}
            {current === "analytics_regional" && <AnalyticsRegional />}
            {current === "analytics_alerts" && <AnalyticsAlerts />}

            {/* Плейсхолдер для решти */}
            {current === "settings" && (
              <div className="p-4 text-sm text-[var(--secondary)] border rounded bg-[var(--surface)]">
                Тут скоро з’явиться функціонал. Поки що — плейсхолдер.
              </div>
            )}
            {current === 'breeders' && <BreedersCatalog />}
            {current === 'settings_dev' && <SettingsDev />}
          </main>
        </div>
      </div>
      {/* <BuildStamp /> */}
    </ToastProvider>
  );
}

export default function HBAppShell() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}

// ——— Допоміжні компоненти
function HeaderActions() {
  const { push } = useToast();
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">Колонії (Матки)</h1>
      <div className="flex items-center gap-2">
        <Button onClick={() => push({ title: "Дія виконана", tone: "success" })}>Основна дія</Button>
        <Button variant="secondary">Другорядна</Button>
      </div>
    </div>
  );
}

function RoleSelector({ value, onChange }: { value: NewRoleKey; onChange: (v: NewRoleKey) => void }) {
  const ROLES_LOCAL: Array<{ key: NewRoleKey; label: string }> = [
    { key: 'guest', label: 'Гість' },
    { key: 'buyer', label: 'Пасічник' },
    { key: 'breeder', label: 'Маткар' },
    { key: 'regional_admin', label: 'Голова спілки' },
    { key: 'internal', label: 'Системний адміністратор' },
    { key: 'global_admin', label: 'Глобальний адмін' },
  ]
  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="role">
        Роль
      </label>
      <select
        id="role"
        value={value}
        onChange={(e) => onChange(e.target.value as NewRoleKey)}
        className="rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-sm hover:bg-gray-50 focus:ring-2 focus:ring-[var(--primary)]"
        aria-label="Оберіть роль"
      >
        {ROLES_LOCAL.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Breadcrumb({ roleKey, activeId }: { roleKey: string; activeId: string }) {
  const roleLabel = ({
    guest: 'Гість', buyer: 'Пасічник', breeder: 'Маткар', regional_admin: 'Голова спілки', internal: 'Системний адміністратор', global_admin: 'Глобальний адмін',
  } as Record<string,string>)[roleKey] ?? 'Роль'
  return (
    <nav className="mb-2 text-xs text-[var(--secondary)]" aria-label="Хлібні крихти">
      <ol className="flex items-center gap-2">
        <li className="hover:underline" role="link">
          {roleLabel}
        </li>
        <li aria-hidden>→</li>
        <li className="text-[var(--text)] font-medium">{activeId}</li>
      </ol>
    </nav>
  );
}

function KpiCard({
  title,
  value,
  hint,
  tone = "default",
}: {
  title: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "info";
}) {
  const ring =
    tone === "success" ? "ring-[var(--success)]" : tone === "info" ? "ring-[var(--info)]" : "ring-[var(--divider)]";
  return (
    <div className={`rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4 shadow-sm ring-1 ${ring}`}>
      <div className="text-xs font-medium text-[var(--secondary)]">{title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--secondary)]">{hint}</div>}
    </div>
  );
}
