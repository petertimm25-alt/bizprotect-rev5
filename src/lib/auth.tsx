// src/lib/auth.tsx
import React from 'react'

type Plan = 'free' | 'pro' | 'ultra'
export type User = {
  id: string
  name: string
  email?: string
  plan: Plan
}

type AuthCtx = {
  user: User | null
  login: (email: string, name?: string) => void
  logout: () => void
  setPlan: (plan: Plan) => void
}

const Ctx = React.createContext<AuthCtx | null>(null)

const LS_KEY = 'bp_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  const persist = (u: User | null) => {
    if (!u) localStorage.removeItem(LS_KEY)
    else localStorage.setItem(LS_KEY, JSON.stringify(u))
  }

  const login = (email: string, name?: string) => {
    // หลังล็อกอินครั้งแรก ให้เป็น FREE เสมอ (ไม่มีคำว่า demo อีกต่อไป)
    const u: User = {
      id: crypto.randomUUID(),
      name: name?.trim() || email.split('@')[0] || 'User',
      email,
      plan: 'free',
    }
    setUser(u)
    persist(u)
  }

  const logout = () => {
    setUser(null)
    persist(null)
  }

  const setPlan = (plan: Plan) => {
    setUser(prev => {
      if (!prev) return prev
      const next = { ...prev, plan }
      persist(next)
      return next
    })
  }

  return (
    <Ctx.Provider value={{ user, login, logout, setPlan }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
