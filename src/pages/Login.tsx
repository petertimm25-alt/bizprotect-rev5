import React from 'react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { signInWithEmail, loading, envReady, envError } = useAuth()
  const [email, setEmail] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [note, setNote] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<string | null>(null)

  const BASE = (import.meta as any)?.env?.BASE_URL || '/'
  const LOGO_URL = `${BASE}brand/BizProtectLogo.png`

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setNote(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('กรุณากรอกอีเมลให้ถูกต้อง'); return }
    try {
      setSubmitting(true)
      await signInWithEmail(email.trim())
      setNote('ส่งลิงก์เข้าใช้งานไปที่อีเมลแล้ว โปรดเช็กกล่องจดหมาย')
    } catch (e: any) {
      setErr(e?.message || 'ไม่สามารถส่งลิงก์ได้')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0b1220] to-[#0e1a33] text-[#EAEFF5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-7">
          <img src={LOGO_URL} alt="BizProtect" className="h-20 w-auto object-contain" />
          <h1 className="mt-3 text-2xl font-semibold tracking-wide text-[#D4AF37]">BizProtect</h1>
          <p className="mt-1 text-sm text-white/60">เข้าสู่ระบบเพื่อใช้งานแผน Free / Pro / Ultra</p>
        </div>

        <div className="rounded-2xl bg-[#0D1424]/80 backdrop-blur-xl ring-1 ring-[#D4AF37]/25 shadow-[0_24px_90px_rgba(212,175,55,0.10)]">
          <div className="p-6 sm:p-7">
            {!envReady && (
              <div className="mb-4 rounded-lg bg-red-500/10 text-red-300 text-xs p-3">
                {envError || 'โปรดตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env.local แล้วรีสตาร์ท dev server'}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3">
              <label className="block text-sm font-medium text-[#EBDCA6]">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-white/10 bg-[#0b1220] text-white placeholder-white/40 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]/40"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={submitting || loading || !envReady}
                className="w-full mt-2 rounded-xl bg-[#D4AF37] text-[#141414] font-semibold py-2.5 transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'กำลังส่งลิงก์…' : 'ส่งลิงก์เข้าใช้งานทางอีเมล'}
              </button>
            </form>

            {note && <p className="mt-4 text-xs text-emerald-400">{note}</p>}
            {err && <p className="mt-4 text-xs text-red-400">{err}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
