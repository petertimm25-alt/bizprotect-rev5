// src/lib/auth.tsx
import React from 'react'
import type { Plan } from './roles'

export type User = {
  id: string
  name: string
  plan: Plan
  branding?: { logoUrl?: string | null } // สำหรับ Ultra
}

type Ctx = {
  user: User | null
  loginAsDemo: (plan: Plan | 'starter') => void // รองรับค่าเก่าที่ค้างในโค้ด
  logout: () => void
}

const AuthContext = React.createContext<Ctx>({
  user: null,
  loginAsDemo: () => {},
  logout: () => {},
})

const STORAGE_KEY = 'bp_user_v1'

function normalizePlan(p: any): Plan {
  if (p === 'starter') return 'free' // migrate ค่าเก่า
  if (p === 'free' || p === 'pro' || p === 'ultra') return p
  return 'free'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const u = JSON.parse(raw)
      return { ...u, plan: normalizePlan(u.plan) }
    } catch { return null }
  })

  const loginAsDemo = (plan: Plan | 'starter') => {
    const p = normalizePlan(plan)
    const u: User = { id: 'demo', name: p.toUpperCase() + ' Demo', plan: p }
    setUser(u)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)) } catch {}
  }

  const logout = () => {
    setUser(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return React.useContext(AuthContext)
}
