import type { Breed, Region } from '../types/dictionaries'
import { listBreeds, listRegions } from '../state/dictionaries.store'
import UA_REGIONS, { findRegion as findRegionConst } from '../constants/regions.ua'

export function normalizeCode(input: string): string {
  const s = (input || '').trim().toLowerCase()
  if (!s) return ''
  // replace whitespace/underscore with dash
  let norm = s.replace(/[\s_]+/g, '-')
  // remove invalid chars
  norm = norm.replace(/[^a-z0-9-]/g, '')
  // collapse multiple dashes
  norm = norm.replace(/-+/g, '-')
  // trim dashes
  norm = norm.replace(/^-+/, '').replace(/-+$/, '')
  return norm
}

export function matchBreed(input: string): string | null {
  const q = (input || '').trim().toLowerCase()
  if (!q) return null
  const rows: Breed[] = listBreeds()
  // exact code
  const byCode = rows.find(b => b.code.toLowerCase() === q)
  if (byCode) return byCode.code
  // exact label
  const byLabel = rows.find(b => b.label.trim().toLowerCase() === q)
  if (byLabel) return byLabel.code
  // exact synonym
  const bySyn = rows.find(b => (b.synonyms || []).some(s => s.trim().toLowerCase() === q))
  if (bySyn) return bySyn.code
  // contains in label or synonyms (simple fuzzy)
  const contains = rows.find(b => b.label.toLowerCase().includes(q) || (b.synonyms || []).some(s => s.includes(q)))
  if (contains) return contains.code
  return null
}

export function matchRegion(input: string): string | null {
  const q = (input || '').trim().toLowerCase()
  if (!q) return null
  const rows: Region[] = listRegions()
  // exact code (lower-kebab)
  const byCode = rows.find(r => r.code.toLowerCase() === q)
  if (byCode) return byCode.code
  // exact label
  const byLabel = rows.find(r => r.label.trim().toLowerCase() === q)
  if (byLabel) return byLabel.code
  // numeric/ISO via constants
  const regConst = findRegionConst(input)
  if (regConst) {
    // constants use slug matching our codes
    const bySlug = rows.find(r => r.code === regConst.slug)
    if (bySlug) return bySlug.code
  }
  // contains in label
  const contains = rows.find(r => r.label.toLowerCase().includes(q))
  if (contains) return contains.code
  // slug by constants
  const bySlug2 = UA_REGIONS.find(r => r.slug === q)
  if (bySlug2) {
    const found = rows.find(r => r.code === bySlug2.slug)
    if (found) return found.code
  }
  return null
}

