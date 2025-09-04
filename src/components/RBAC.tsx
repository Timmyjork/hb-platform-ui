import React from 'react'
import { useAuth } from '../auth/useAuth'

export function RequireRole({ anyOf, children }: { anyOf: Array<ReturnType<typeof useAuth>['role']>; children: React.ReactNode }) {
  const { role } = useAuth()
  if (!anyOf.includes(role)) return null
  return <>{children}</>
}

