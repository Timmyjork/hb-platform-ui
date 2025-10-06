// react-jsx runtime: no explicit React import needed
import { useEffect, useState } from 'react'
import { useToast } from './ui/Toast'
import {
  setRole as setProfileRole,
  type RoleKey,
  getAuth,
  onAuthChange,
  getProfile,
  saveProfile,
} from '../state/profile.store'
import { cart as cartStore } from '../shop/cart.store'
import { useAuth } from '../auth/useAuth'

const MAP: Array<{ key: RoleKey; label: string; pageId: string }> = [
  { key: 'guest', label: 'Гість', pageId: 'shop' },
  { key: 'buyer', label: 'Пасічник', pageId: 'shop' },
  { key: 'breeder', label: 'Маткар', pageId: 'my_queens_manage' },
  { key: 'regional_admin', label: 'Голова', pageId: 'analytics_ratings' },
  { key: 'internal', label: 'Адмін', pageId: 'admin_dictionaries' },
]

export default function HeaderRoleQuickSwitch() {
  const { push } = useToast()
  const { login, setRole: setUiRole } = useAuth()
  const [currentRole, setCurrentRole] = useState<RoleKey>(() => getAuth().role)
  useEffect(() => {
    const off = onAuthChange(() => {
      try { setCurrentRole(getAuth().role) } catch { /* ignore */ }
    })
    try { setCurrentRole(getAuth().role) } catch { /* ignore */ }
    return off
  }, [])

  // dev-only guard
  const show = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mode = (import.meta as any).env?.MODE || (import.meta as any).env?.mode || 'development'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flag = String(((import.meta as any).env?.VITE_SHOW_ROLE_SWITCH) || '') === '1'
      return mode !== 'production' || flag
    } catch {
      return true
    }
  })()
  if (!show) return null

  async function go(role: RoleKey, pageId: string, label: string) {
    setProfileRole(role)
    try { setUiRole(role as any) } catch { /* noop */ }
    try {
      // DEV buyer stub login to enable cart/checkout without real auth
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mode = (import.meta as any).env?.MODE || (import.meta as any).env?.mode || 'development'
      if (mode !== 'production' && role === 'buyer') {
        login({ name: 'Пасічник DEMO', email: 'buyer@demo', phone: '', provider: 'email', role: 'buyer' })
        try {
          const p = '../state/auth.store'
          // @vite-ignore
          // @ts-ignore optional dynamic store
          const auth = await import(/* @vite-ignore */ p)
          const anyAuth = auth as unknown as any
          if (typeof anyAuth?.loginStub === 'function') {
            anyAuth.loginStub({ uid: 'buyer-demo', displayName: 'Пасічник DEMO', email: 'buyer@demo' })
          } else if (typeof anyAuth?.setAuthState === 'function') {
            anyAuth.setAuthState({ isLoggedIn: true, user: { uid: 'buyer-demo', displayName: 'Пасічник DEMO', email: 'buyer@demo' } })
          } else {
            ;(window as any).__hb_auth = { isLoggedIn: true, user: { uid: 'buyer-demo', displayName: 'Пасічник DEMO', email: 'buyer@demo' } }
          }
        } catch { /* ignore optional store */ }
      } else if (mode !== 'production' && role === 'breeder') {
        try {
          const p = getProfile('currentUser')
          const next = { ...p, breederNo: p?.breederNo || 1, regionCode: p?.regionCode || 'UA-32', defaultBreedCode: p?.defaultBreedCode || 'carpatica' }
          saveProfile(next)
        } catch { /* noop */ }
      }
    } catch { /* noop */ }
    try { cartStore.clear() } catch { /* noop */ }
    push({ title: `Роль перемкнено: ${label}`, tone: 'success' })
    try {
      const ev = new CustomEvent('hb:navigate', { detail: { role, pageId } })
      window.dispatchEvent(ev)
    } catch { /* ignore */ }
  }

  return (
    <div className="hidden items-center gap-1 md:flex">
      {MAP.map(({ key, label, pageId }) => {
        const isActive = key === currentRole
        const activeCls = 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
        const idleCls = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => go(key, pageId, label)}
            className={[
              'px-2 py-1 text-xs rounded-md border transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400',
              isActive ? activeCls : idleCls,
            ].join(' ')}
            title={label}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
