export type BuildInfo = {
  version: string
  progress: string
  channel: string
  commit?: string
  builtAt: string
}

export const BUILD_INFO: BuildInfo = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  version: (import.meta as any).env?.VITE_APP_VERSION ?? 'v0',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: (import.meta as any).env?.VITE_APP_PROGRESS ?? '—',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channel: (import.meta as any).env?.VITE_APP_CHANNEL ?? 'local',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commit: (import.meta as any).env?.VITE_APP_COMMIT ? String((import.meta as any).env?.VITE_APP_COMMIT).slice(0, 7) : undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builtAt: (import.meta as any).env?.VITE_APP_BUILT_AT ?? new Date().toISOString(),
}
