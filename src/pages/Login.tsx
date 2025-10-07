import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, supabase } from '../lib/auth'

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
    </svg>
  )
}

const BASE = (import.meta as any)?.env?.BASE_URL || '/'

export default function Login() {
  const nav = useNavigate()
  const { signInWithEmail, envReady, envError } = useAuth()

  const [email, setEmail] = React.useState('')
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)
  const [showGoogleHint, setShowGoogleHint] = React.useState(false)

  // อ่าน email ก่อนหน้า (จำไว้)
  React.useEffect(() => {
    const last = localStorage.getItem('bp:lastEmail') || localStorage.getItem('bp_pending_email') || ''
    if (last) setEmail(last)
  }, [])

  function validateEmail(v: string): string | null {
    const s = v.trim()
    if (!s) return 'กรุณากรอกอีเมล'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'รูปแบบอีเมลไม่ถูกต้อง'
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSent(false)

    // ตรวจ env ก่อน (ป้องกันเคสยังไม่ได้ตั้งค่า .env.local)
    if (!envReady) {
      setError(envError || 'Supabase ยังไม่พร้อมใช้งาน')
      return
    }

    const msg = validateEmail(email)
    if (msg) { setError(msg); return }

    setLoading(true)
    try {
      await signInWithEmail(email.trim())
      if (remember) localStorage.setItem('bp:lastEmail', email.trim())
      else localStorage.removeItem('bp:lastEmail')
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถส่งลิงก์ได้ โปรดลองอีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    if (!supabase) { setShowGoogleHint(true); return }
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err?.message || 'ยังไม่พร้อมใช้งาน Google Sign-in')
    }
  }

  return (
    <section className="max-w-xl mx-auto px-6 md:px-8 py-10 md:py-14">
      {/* โลโก้ + แบรนด์ */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={`${BASE}brand/BizProtectLogo.png`}
          alt="BizProtect"
          className="h-16 w-16 rounded-full border border-white/15 shadow mb-3 object-contain bg-white/5"
        />
        <h1 className="text-2xl font-semibold text-gold">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-white/70 text-sm">Keyman Corporate Policy Calculator</p>
      </div>

      {/* Card */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-2xl p-5 md:p-6 bp-card-surface bp-card-gold"
      >
        {/* Email */}
        <label className="block">
          <div className="mb-1 text-white/75">อีเมล</div>
          <input
            id="email"
            type="email"
            className="w-full h-11 md:h-12 rounded-xl px-3 bp-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        {/* Remember */}
        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-white/10"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="text-sm text-white/80">จดจำอีเมลนี้ไว้ในเครื่องนี้</span>
          </label>
          <span className="text-sm text-white/60">ล็อกอินด้วย Magic Link</span>
        </div>

        {/* Error / Success */}
        {!!error && (
          <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        {sent && (
          <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 px-3 py-2 text-sm">
            ส่งลิงก์เข้าใช้งานไปที่ <span className="font-medium">{email}</span> แล้ว โปรดตรวจกล่องจดหมาย
          </div>
        )}
        {!envReady && (
          <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-500/10 text-yellow-200 px-3 py-2 text-sm">
            {envError}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bp-btn bp-btn-primary w-full h-11 md:h-12 font-semibold"
          >
            {loading && <Spinner />} <span>ส่งลิงก์เข้าใช้งานทางอีเมล</span>
          </button>
          
          {/*<button
            type="button"
            onClick={signInWithGoogle}
            className="bp-btn w-full h-11 md:h-12 gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M21.8 12.23c0-.68-.06-1.36-.18-2.02H12v3.82h5.5c-.24 1.28-.99 2.41-2.09 3.14v2.6h3.38c1.98-1.83 3.11-4.53 3.11-7.54Z"/><path fill="currentColor" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.38-2.6c-.93.63-2.12 1-3.24 1-2.48 0-4.59-1.67-5.34-3.92H3.18v2.67C4.88 19.98 8.18 22 12 22Z"/><path fill="currentColor" d="M6.66 14.05c-.23-.68-.36-1.41-.36-2.15s.13-1.47.36-2.15V7.08H3.18A10 10 0 0 0 2 11.9c0 1.62.39 3.14 1.18 4.82l3.48-2.67Z"/><path fill="currentColor" d="M12 6.04c1.46 0 2.77.5 3.79 1.49l2.84-2.84C16.96 2.87 14.7 2 12 2 8.18 2 4.88 4.02 3.18 7.08l3.48 2.67C7.41 7.71 9.52 6.04 12 6.04Z"/>
            </svg>
            Sign in with Google
          </button>*/}
          {showGoogleHint && (
            <div className="text-xs text-white/70 text-center">
              โปรดเปิด Google OAuth ใน Supabase ก่อนใช้งานปุ่มนี้
            </div>
          )}
        </div>

        {/* Sign up hint */}
        <p className="mt-5 text-sm text-white/70">
          ยังไม่มีบัญชี?{' '}
          <Link to="/pricing" className="text-gold hover:opacity-90">
            ดูแพ็กเกจและสมัครใช้งาน
          </Link>
        </p>
      </form>

      {/* หมายเหตุความปลอดภัย */}
      <p className="mt-4 text-center text-xs text-white/50">
        เข้าระบบนี้ถือว่ายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวของ BizProtect
      </p>
    </section>
  )
}
