/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type RoleKey = "guest" | "buyer" | "breeder" | "regional_admin" | "internal" | "global_admin";

export type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: RoleKey;
  provider: "google" | "facebook" | "email";
};

const LS_KEY = "hb_auth_user_v1";

type Ctx = {
  user: User | null;
  login: (u: Omit<User, "id">) => void;
  logout: () => void;
  setRole: (r: RoleKey) => void;
  role: RoleKey;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<RoleKey>('guest');

  useEffect(() => {
    try {
      // Prefer role from URL (?role=...) then fallback to localStorage('ui.role')
      const urlRole = new URLSearchParams(window.location.search).get('role') as RoleKey | null
      const lsRole = (localStorage.getItem('ui.role') as RoleKey | null) || null
      const allowed: RoleKey[] = ['guest','buyer','breeder','regional_admin','internal','global_admin']
      const initialRole = (urlRole && allowed.includes(urlRole)) ? urlRole : (lsRole && allowed.includes(lsRole) ? lsRole : 'guest')
      setRoleState(initialRole)
      if (initialRole) localStorage.setItem('ui.role', initialRole)
    } catch (err) {
      void err
    }
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch (err) {
      void err; // ignore malformed localStorage
    }
  }, []);

  const login = useCallback<Ctx["login"]>((u) => {
    const next: User = { id: String(Date.now()), ...u };
    setUser(next);
    setRoleState(next.role);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    localStorage.setItem('ui.role', next.role)
  }, []);

  const logout = useCallback(() => {
    setUser(null)
    try { localStorage.removeItem(LS_KEY) } catch (_e) { /* ignore */ }
    // Reset role to guest on logout and persist UI role for shell/nav
    setRoleState('guest')
    try { localStorage.setItem('ui.role', 'guest') } catch (_e) { /* ignore */ }
  }, []);

  const setRole = useCallback<Ctx["setRole"]>((r) => {
    setRoleState(r)
    localStorage.setItem('ui.role', r)
    if (user) {
      const next = { ...user, role: r };
      setUser(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
  }, [user]);

  const ctxValue = useMemo(() => ({ user, login, logout, setRole, role }), [user, login, logout, setRole, role]);
  return <AuthCtx.Provider value={ctxValue}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
