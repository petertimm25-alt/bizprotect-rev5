// src/pages/Login.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = React.useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    login(email.trim())
    nav('/', { replace: true })
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold text-gold mb-4">เข้าสู่ระบบ</h1>
      <p className="text-sm text-[color:var(--ink-dim)] mb-6">
        เข้าสู่ระบบเพื่อใช้งานแผน <span className="text-gold font-medium">FREE</span> (ไม่มี Demo)
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="อีเมลของคุณ"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg px-3 py-2 bg-white/5 ring-1 ring-white/15 outline-none focus:ring-gold"
          required
        />
        <button
          type="submit"
          className="w-full rounded-lg px-4 py-2 ring-1 ring-gold/60 hover:bg-gold/10 text-gold"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </main>
  )
}
