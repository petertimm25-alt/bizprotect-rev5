// src/components/HeaderNav.tsx
import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const BASE = (import.meta as any)?.env?.BASE_URL || '/'
const linkClass = ({ isActive }: { isActive: boolean }) =>
  ['transition-colors', isActive ? 'text-gold' : 'text-[color:var(--ink)] hover:text-gold'].join(' ')

export default function HeaderNav() {
  const { user, logout } = useAuth()
  const plan = user?.plan ?? 'free'
  const isProOrUltra = plan === 'pro' || plan === 'ultra'

  return (
    <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2" aria-label="BizProtect Home">
        <img src={`${BASE}brand/BizProtectLogo.png`} alt="BizProtect" className="h-20 w-20 object-contain" />
        <span className="text-2xl font-semibold text-gold">BizProtect</span>
      </Link>

      <nav className="flex items-center gap-8">
        <NavLink to="/" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/pricing" className={linkClass}>Plan</NavLink>
        <NavLink to="/knowledge" className={linkClass}>ข้อหารือกรมสรรพากร</NavLink>
      </nav>

      <div className="flex items-center gap-3">
        {/* ปุ่มปรับฟอนต์: แสดงเฉพาะ PRO/ULTRA */}
        {isProOrUltra && (
          <div
            className="hidden sm:flex items-center gap-1 rounded-lg border border-gold/60 bg-white/5 px-2 py-1 shadow-[0_0_0_1px_rgba(212,175,55,0.25),0_6px_18px_rgba(0,0,0,0.18)]"
            title="ปรับขนาดตัวอักษรทั้งเว็บไซต์ (PRO/ULTRA)"
          >
            <span className="px-2 py-1 text-xs">A-</span>
            <span className="px-2 py-1 text-xs">A</span>
            <span className="px-2 py-1 text-xs">A+</span>
          </div>
        )}

        {user ? (
          <>
            <span className="text-xs px-2 py-1 rounded bg-white/10 ring-1 ring-white/15">
              {user.name} • {plan.toUpperCase()}
            </span>
            <button onClick={logout} className="text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10">
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-xs px-3 py-1 rounded ring-1 ring-gold/60 hover:bg-gold/10 text-gold"
            title="เข้าสู่ระบบเพื่อใช้งาน (FREE ต้องล็อกอิน)"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  )
}
