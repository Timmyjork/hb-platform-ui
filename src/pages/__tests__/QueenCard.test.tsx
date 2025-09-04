import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import QueenCard from '../QueenCard'
import { AuthProvider } from '../../auth/useAuth'
import { saveQueens } from '../../state/queens.store'

function wrap(ui: React.ReactNode) {
  return <AuthProvider>{ui}</AuthProvider>
}

describe('QueenCard page', () => {
  beforeEach(() => { localStorage.clear() })

  it('owner sees observation form', async () => {
    const now = new Date().toISOString()
    saveQueens([{ id:'UA.7.45.1.25.2025', breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'25', year:2025, country:'UA', baseTraits: { honey:50,winter:50,temperament:50,calmOnFrames:50,swarming:50,hygienic:50,varroaResist:50,springBuildUp:50,colonyStrength:50,broodFrames:50 }, ownerUserId:'U1', status:'active', createdAt: now, updatedAt: now }])
    // seed auth user in LS
    localStorage.setItem('hb_auth_user_v1', JSON.stringify({ id:'U1', role:'buyer', provider:'email' }))
    render(wrap(<QueenCard queenId="UA.7.45.1.25.2025" />))
    // open Observations tab
    fireEvent.click(screen.getByRole('button', { name: 'Спостереження' }))
    await waitFor(() => expect(screen.getByLabelText('honey')).toBeInTheDocument())
  })

  it('non-owner cannot add observation', async () => {
    const now = new Date().toISOString()
    saveQueens([{ id:'UA.7.45.1.25.2025', breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'25', year:2025, country:'UA', baseTraits: { honey:50,winter:50,temperament:50,calmOnFrames:50,swarming:50,hygienic:50,varroaResist:50,springBuildUp:50,colonyStrength:50,broodFrames:50 }, ownerUserId:'U2', status:'active', createdAt: now, updatedAt: now }])
    localStorage.setItem('hb_auth_user_v1', JSON.stringify({ id:'U1', role:'buyer', provider:'email' }))
    render(wrap(<QueenCard queenId="UA.7.45.1.25.2025" />))
    fireEvent.click(screen.getByRole('button', { name: 'Спостереження' }))
    await waitFor(() => expect(screen.getByText(/Лише власник/)).toBeInTheDocument())
  })
})
