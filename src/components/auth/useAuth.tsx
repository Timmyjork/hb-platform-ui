import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type RoleKey = "buyer" | "breeder" | "regional_admin" | "global_admin";

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
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {}
  }, []);

  const login: Ctx["login"] = (u) => {
    const next: User = { id: String(Date.now()), ...u };
    setUser(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  };

  const setRole: Ctx["setRole"] = (r) => {
    if (!user) return;
    const next = { ...user, role: r };
    setUser(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const value = useMemo(() => ({ user, login, logout, setRole }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
