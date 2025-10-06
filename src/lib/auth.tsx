// src/lib/auth.tsx
import React from 'react'
import {
  createClient,
  type SupabaseClient,
  type AuthChangeEvent,
  type Session,
} from '@supabase/supabase-js'

type Plan = 'free' | 'pro' | 'ultra'
export type UserLite = { id: string; email: string | null; plan?: Plan }

// ---------- env & client ----------
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const envReady = !!SUPABASE_URL && !!SUPABASE_ANON_KEY
const envError = !envReady
  ? 'โปรดตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env.local'
  : undefined

export const supabase: SupabaseClient | null = envReady
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null

// ---------- context ----------
type AuthContextShape = {
  user: UserLite | null
  loading: boolean
  envReady: boolean
  envError?: string
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
  handleCallbackFromUrl: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextShape | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserLite | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let sub: ReturnType<SupabaseClient['auth']['onAuthStateChange']> | undefined

    async function init() {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data } = await supabase.auth.getSession()
      const s = data.session
      // ✅ แปลง email ให้เป็น string | null เสมอ
      setUser(s ? { id: s.user.id, email: s.user.email ?? null } : null)
      setLoading(false)

      sub = supabase.auth.onAuthStateChange(
        (evt: AuthChangeEvent, s2: Session | null) => {
          // ✅ ตรงนี้ก็เหมือนกัน
          setUser(s2 ? { id: s2.user.id, email: s2.user.email ?? null } : null)
        }
      )
    }
    init()

    return () => {
      sub?.data.subscription.unsubscribe()
    }
  }, [])

  async function signInWithEmail(email: string) {
    if (!supabase) throw new Error(envError)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    })
    if (error) throw error
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function handleCallbackFromUrl() {
    if (!supabase) throw new Error(envError)

    const urlObj = new URL(window.location.href)

    // query string ก่อน
    const qs = urlObj.searchParams
    let code = qs.get('code')
    let token_hash = qs.get('token_hash')
    let type = (qs.get('type') || undefined) as any

    // ถ้าไม่มี ลอง hash
    if (!code && !token_hash && urlObj.hash) {
      const hp = new URLSearchParams(urlObj.hash.slice(1))
      code = hp.get('code') || code
      token_hash = hp.get('token_hash') || hp.get('token') || token_hash
      type = (hp.get('type') || type) as any

      const access_token = hp.get('access_token')
      const refresh_token = hp.get('refresh_token')
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })
        if (error) throw error
        history.replaceState({}, '', `${urlObj.origin}${urlObj.pathname}`)
        return
      }
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else if (token_hash) {
      const { error } = await supabase.auth.verifyOtp({
        type: (type || 'magiclink') as any,
        token_hash,
      })
      if (error) throw error
    } else {
      throw new Error('ลิงก์ไม่ถูกต้อง: ไม่พบ code หรือ token_hash')
    }

    history.replaceState({}, '', `${urlObj.origin}${urlObj.pathname}`)
  }

  const value: AuthContextShape = {
    user,
    loading,
    envReady,
    envError,
    signInWithEmail,
    signOut,
    handleCallbackFromUrl,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
