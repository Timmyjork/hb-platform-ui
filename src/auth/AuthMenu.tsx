import React, { useState } from "react";
import { useAuth } from "./useAuth";
import { loginAsBuyer as storeLoginBuyer, loginAsBreeder as storeLoginBreeder, logout as storeLogout } from '../state/profile.store'
import type { RoleKey } from "./useAuth";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";

const ROLE_ITEMS = [
  { value: "buyer", label: "Пасічник" },
  { value: "breeder", label: "Маткар" },
  { value: "regional_admin", label: "Голова спілки" },
  { value: "internal", label: "Системний адміністратор" },
  { value: "global_admin", label: "Глобальний адмін" },
] as const;

export default function AuthMenu({ onRoleSync }: { onRoleSync: (r: RoleKey) => void }) {
  const { user, login, logout, setRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [role, setRoleLocal] = useState<RoleKey>(user?.role ?? "buyer");
  const [provider, setProvider] = useState<"google" | "facebook" | "email">("email");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const doLogin = () => {
    login({
      name: email || "Користувач",
      email: email || undefined,
      phone: phone || undefined,
      provider,
      role,
    });
    if (role === 'buyer') storeLoginBuyer(email)
    if (role === 'breeder') storeLoginBreeder(email)
    onRoleSync(role);
    setOpen(false);
  };

  const doSetRole = (r: RoleKey) => {
    setRole(r);
    onRoleSync(r);
  };

  if (!user) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Увійти
        </button>
        {open && (
          <Modal onClose={() => setOpen(false)} title="Вхід / Реєстрація">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button onClick={() => { storeLoginBuyer(email||'buyer@example.com'); setOpen(false) }}>Увійти як покупець</Button>
                <Button variant="secondary" onClick={() => { storeLoginBreeder(email||'breeder@example.com'); setOpen(false) }}>Увійти як маткар</Button>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-[var(--secondary)]">Обрати роль</div>
                <Select
                  value={role}
                  onChange={(e) => setRoleLocal(e.target.value as RoleKey)}
                  items={ROLE_ITEMS.map((r) => ({ label: r.label, value: r.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProvider("google")}
                  className={`rounded-md border px-3 py-2 text-sm ${provider === "google" ? "ring-2 ring-[var(--primary)]" : "border-[var(--divider)]"}`}
                >
                  Google
                </button>
                <button
                  onClick={() => setProvider("facebook")}
                  className={`rounded-md border px-3 py-2 text-sm ${provider === "facebook" ? "ring-2 ring-[var(--primary)]" : "border-[var(--divider)]"}`}
                >
                  Facebook
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <input
                  placeholder="Телефон"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <Button onClick={doLogin}>Продовжити</Button>
            </div>
          </Modal>
        )}
      </>
    );
  }

  // logged in
  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none cursor-pointer rounded-md border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-sm hover:bg-gray-50">
          {user.name || user.email || "Аккаунт"}
        </summary>
        <div className="absolute right-0 mt-1 w-56 rounded-md border border-[var(--divider)] bg-[var(--surface)] p-2 shadow-md">
          <div className="mb-2 text-xs text-[var(--secondary)]">{user.email || user.phone || user.provider}</div>
          <div className="mb-2">
            <div className="mb-1 text-xs font-medium text-[var(--secondary)]">Роль</div>
            <Select
              value={user.role}
              onChange={(e) => doSetRole(e.target.value as RoleKey)}
              items={ROLE_ITEMS.map((r) => ({ label: r.label, value: r.value }))}
            />
          </div>
          <Button variant="secondary" onClick={() => { storeLogout(); logout() }}>Вийти</Button>
        </div>
      </details>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">{title}</div>
          <button onClick={onClose} className="rounded px-2 py-1 text-sm hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
