// src/lib/auth.tsx
import React, { createContext, useContext } from 'react'
import { createClient, type User } from '@supabase/supabase-js'

type Plan = 'free' | 'pro' | 'ultra'
export type UserLite = { id: string; email: string | null; name?: string | null; plan?: Plan }

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// ---- Dev plan override (Method A): localStorage "bp:plan"
const readPlanOverride = (): Plan | null => {
  try {
    const v = (typeof window !== 'undefined' && localStorage.getItem('bp:plan')) || ''
    return v === 'free' || v === 'pro' || v === 'ultra' ? (v as Plan) : null
  } catch { return null }
}

function mapUser(u: User | null): UserLite | null {
  if (!u) return null
  const metaPlan = (u.user_metadata as any)?.plan as Plan | undefined
  const plan: Plan = readPlanOverride() ?? metaPlan ?? 'free'
  return {
    id: u.id,
    email: u.email ?? null,
    name: (u.user_metadata as any)?.name ?? null,
    plan,
  }
}

type AuthContextShape = {
  user: UserLite | null
  loading: boolean
  envReady: boolean
  envError?: string
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
  // alias เพื่อรองรับโค้ดเก่า
  logout: () => Promise<void>
}

const AuthCtx = createContext<AuthContextShape | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserLite | null>(null)
  const [loading, setLoading] = React.useState(true)

  const envReady = !!supabase
  const envError = envReady ? undefined : 'โปรดตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env.local'

  React.useEffect(() => {
    // อย่าทำ Router ซ้อน/เด้งตอนยัง loading
    if (!supabase) { setLoading(false); return }

    const boot = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(mapUser(session?.user ?? null))
      setLoading(false)
    }

    const sub = supabase.auth.onAuthStateChange((_evt, sess) => {
      setUser(mapUser(sess?.user ?? null))
    })

    boot()
    return () => sub.data.subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string) => {
    if (!supabase) throw new Error('Supabase not ready')
    localStorage.setItem('bp_pending_email', email)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) { setUser(null); return }
    await supabase.auth.signOut()
    setUser(null)
  }

  const value: AuthContextShape = {
    user, loading,
    envReady, envError,
    signInWithEmail,
    signOut,
    logout: signOut,
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
