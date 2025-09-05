import React from "react";
import ReactDOM from "react-dom/client";
import HBAppShell from "./HBAppShell";
import { applyDevSecurity } from './infra/security'
import "./index.css"; // ← ОБОВʼЯЗКОВО
import { seedPublic } from './seed/public'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HBAppShell />
  </React.StrictMode>
);
applyDevSecurity()
// Dev/test: seed public data if empty
if (import.meta.env?.DEV) {
  try { seedPublic() } catch { /* noop */ }
}
