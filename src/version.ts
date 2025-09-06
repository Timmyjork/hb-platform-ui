// Centralized build/version info for the stamp
import { computeProgress } from './config/milestones'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const git = (import.meta as any).env?.VITE_GIT_SHA || ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = (import.meta as any).env?.VITE_BUILD_NUM || ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const builtAt = (import.meta as any).env?.VITE_BUILD_AT || ''

export const BUILD = {
  ...computeProgress(), // {done,total,pct,vText}
  gitShort: git ? String(git).slice(0, 7) : 'local',
  run: run ? `#${run}` : '#local',
  ts: builtAt || new Date().toISOString().replace('T', ' ').replace(/\..+/, ' UTC'),
}

