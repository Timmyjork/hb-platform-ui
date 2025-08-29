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
