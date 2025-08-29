import React from "react";
import ReactDOM from "react-dom/client";
import HBAppShell from "./HBAppShell";
import "./index.css"; // ← ОБОВʼЯЗКОВО

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HBAppShell />
  </React.StrictMode>
);
