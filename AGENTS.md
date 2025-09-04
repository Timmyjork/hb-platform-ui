# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (entry `main.tsx`, app shell `HBAppShell.tsx`).
- UI: `src/components/ui/*` (PascalCase components), `src/components/table/*`.
- Features: `src/pages/*` (route-level views), `src/state/*` (lightweight state modules), `src/auth/*` (auth helpers), `src/assets/*` (static assets), `public/` (served as-is).
- Styles: Tailwind utilities in `.tsx` and base styles in `src/index.css`, `src/App.css`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Type-check (`tsc -b`) and build production bundle.
- `npm run preview`: Serve the built app locally for sanity checks.
- `npm run lint`: Run ESLint on the codebase.

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts/.tsx`), 2-space indentation.
- Components: PascalCase files and exports (e.g., `Button.tsx`).
- Hooks: camelCase prefixed with `use` (e.g., `useAuth`).
- State/Modules: named exports; avoid default exports for shared modules.
- Styling: Prefer Tailwind utility classes; keep component-scoped styles minimal in `.css`.
- Linting: ESLint configured via `eslint.config.js` (React, TS, hooks, Vite refresh rules).

## Testing Guidelines
- Framework: Vitest + React Testing Library (jsdom, global matchers).
- Location: colocate as `*.test.ts(x)` next to source or under `src/__tests__/`.
- Run: `npm test` (watch), `npm run test:run` (CI), `npm run test:ui` (optional UI).
- Coverage: enabled via Vite config; generates `lcov` and text reports.

## Commit & Pull Request Guidelines
- Commits: Use Conventional Commits where possible (`feat:`, `fix:`, `chore:`). Keep messages imperative and scoped (e.g., `feat(ui): add Badge variants`).
- PRs: Include concise description, linked issue (e.g., `Closes #123`), screenshots/GIFs for UI changes, and test notes. Ensure `npm run lint` and `npm run build` pass.

## Security & Configuration Tips
- Env vars: Use Vite prefixes (`VITE_...`) and store local secrets in `.env.local` (not committed). Access via `import.meta.env`.
- Dependencies: Avoid adding unused UI libraries; prefer existing Tailwind-based components.
- Node: Use an active LTS (Node 18+ recommended).

## Analytics What-if
The page Analytics → Прогноз (what-if) provides an interactive forecaster for SI/BV based on phenotypes and hive-card proxies. Adjust key inputs and weights or environment sliders to see immediate updates. Scenarios are saved locally in `localStorage` and can be listed, duplicated, deleted, and exported to CSV. Access is available for `breeder` and `regional_admin` roles via the side navigation; `buyer` does not see this entry.

## Ratings Methodology
Breeder ratings aggregate independent beekeeper measurements with transparent rules:
- Decay: exponential time decay with configurable half-life so newer records weigh more.
- Independence: cap per-beekeeper contribution to avoid dominance of a single source.
- Outliers: optional z-score clipping reduces influence of extreme SI/BV values.
- Consistency: inverse normalized variance of SI/BV increases confidence.
- Confidence: combines source count, record count, consistency, and recency.
- Score: weighted combination of normalized SI/BV plus a confidence bonus.

## Alerts & Scheduling
Alerts detect anomalies via:
- threshold: triggers when metric crosses a configured threshold.
- zscore: computes Z=(x−μ)/σ over recent window with half-life weighting; triggers when |Z|≥z.
- ma-delta: compares moving-average between steps; triggers on percent change ≥ delta.
Half-life and minRecords reduce noise. Scheduling supports daily/weekly console deliveries (email/webhook stubs until backend). Use the Alerts page to manage rules, view signals, and set schedules.
