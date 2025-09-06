export type BuildInfo = {
  version: string
  progress: string
  channel: string
  commit?: string
  builtAtISO: string
}

export const BUILD_INFO: BuildInfo = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  version: (import.meta as any).env?.VITE_APP_VERSION ?? 'v0',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: (import.meta as any).env?.VITE_APP_PROGRESS ?? '—',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channel: (import.meta as any).env?.VITE_CHANNEL ?? (typeof location !== 'undefined' && location.host.includes('github.io') ? 'prod' : 'local'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commit: (import.meta as any).env?.VITE_COMMIT ? String((import.meta as any).env?.VITE_COMMIT).slice(0, 7) : undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builtAtISO: (import.meta as any).env?.VITE_BUILT_AT ?? new Date().toISOString(),
}

