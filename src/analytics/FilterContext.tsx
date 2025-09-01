/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState } from 'react'
import type { FilterState } from './filters'

export type CrossFilter = { key: 'breed'|'status'|'year'|'source'; value: string }

type Ctx = {
  global: FilterState
  setGlobal: React.Dispatch<React.SetStateAction<FilterState>>
  cross: CrossFilter[]
  addCross: (f: CrossFilter) => void
  clearCross: () => void
}

const FilterCtx = createContext<Ctx | null>(null)

export function AnalyticsFilterProvider({ initial, children }: { initial: FilterState; children: React.ReactNode }) {
  const [global, setGlobal] = useState<FilterState>(initial)
  const [cross, setCross] = useState<CrossFilter[]>([])
  const addCross = (f: CrossFilter) => setCross((prev) => (prev.find((x) => x.key === f.key && x.value === f.value) ? prev : [...prev, f]))
  const clearCross = () => setCross([])
  const value = useMemo(() => ({ global, setGlobal, cross, addCross, clearCross }), [global, cross])
  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>
}

export function useAnalyticsFilters() {
  const v = useContext(FilterCtx)
  if (!v) throw new Error('useAnalyticsFilters must be used within provider')
  return v
}
