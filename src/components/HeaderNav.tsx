import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const BASE = (import.meta as any)?.env?.BASE_URL || '/'

// รองรับ React Router v6 (className เป็นฟังก์ชัน)
const pillClass = ({ isActive }: { isActive: boolean; isPending?: boolean; isTransitioning?: boolean }) =>
  ['bp-btn', isActive ? 'bp-btn--active' : ''].join(' ')

type Plan = 'free' | 'pro' | 'ultra'
function getEffectivePlan(userPlan?: Plan | null): Plan {
  const ov = (localStorage.getItem('bp:plan') || '').toLowerCase()
  if (ov === 'free' || ov === 'pro' || ov === 'ultra') return ov as Plan
  return (userPlan ?? 'free') as Plan
}
function readScale(): number {
  const raw = localStorage.getItem('bp:scale')
  const n = raw ? Number(raw) : 1
  return Number.isFinite(n) ? Math.min(1.4, Math.max(0.8, n)) : 1
}
function applyScale(n: number) {
  const v = Math.min(1.4, Math.max(0.8, n))
  document.documentElement.style.setProperty('--bp-font-scale', String(v))
  localStorage.setItem('bp:scale', String(v))
}

export default function HeaderNav() {
  const auth = useAuth() as any
  const user = auth?.user ?? null
  const plan = getEffectivePlan(user?.plan)
  const isProOrUltra = plan === 'pro' || plan === 'ultra'

  React.useEffect(() => { applyScale(readScale()) }, [])

  const handleLogout = React.useCallback(async () => {
    try {
      if (typeof auth?.signOut === 'function') await auth.signOut()
      else if (typeof auth?.logout === 'function') await auth.logout()
    } catch {}
  }, [auth])

  return (
    <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2" aria-label="BizProtect Home">
        <img src={`${BASE}brand/BizProtectLogo.png`} alt="BizProtect" className="h-10 w-10 object-contain" />
        <span className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--brand-accent)' }}>BizProtect</span>
      </Link>

      {/* ปุ่มเมนูแบบ Pill */}
      <nav className="bp-nav">
        <NavLink to="/" className={pillClass}>Home</NavLink>
        <NavLink to="/pricing" className={pillClass}>Pricing</NavLink>
        <NavLink to="/knowledge" className={pillClass}>Knowledge</NavLink>
        <NavLink to="/dashboard" className={pillClass}>Calculator</NavLink>
      </nav>

      <div className="bp-nav">
        {/* ปุ่มปรับฟอนต์ — PRO/ULTRA เท่านั้น */}
        {isProOrUltra && (
          <div
            className="hidden sm:flex items-center gap-1 rounded-full border border-gold/60 bg-white/5 px-2 py-1 shadow-[0_0_0_1px_rgba(212,175,55,0.25),0_6px_18px_rgba(0,0,0,0.18)]"
            title="ปรับขนาดตัวอักษรทั้งเว็บไซต์ (PRO/ULTRA)"
          >
            <button onClick={() => applyScale(readScale() - 0.05)} className="px-2 py-1 text-xs">A-</button>
            <button onClick={() => applyScale(1)} className="px-2 py-1 text-xs">A</button>
            <button onClick={() => applyScale(readScale() + 0.05)} className="px-2 py-1 text-xs">A+</button>
          </div>
        )}

        {user ? (
          <>
            <span className="text-[11px] sm:text-xs px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15">
              {user.email ?? 'ผู้ใช้'} • {String(plan).toUpperCase()}
            </span>
            <button onClick={handleLogout} className="bp-btn">Logout</button>
          </>
        ) : (
          <Link to="/login" className="bp-btn bp-btn-primary">เข้าสู่ระบบ</Link>
        )}
      </div>
    </header>
  )
}
