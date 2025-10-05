// src/components/HeaderNav.tsx
import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { loadFontScale, incFontScale, decFontScale, resetFontScale } from '../lib/fontScale'

const BASE = (import.meta as any)?.env?.BASE_URL || '/'
const linkClass = ({ isActive }: { isActive: boolean }) =>
  ['transition-colors', isActive ? 'text-gold' : 'text-[color:var(--ink)] hover:text-gold'].join(' ')

export default function HeaderNav() {
  const { user, loginAsDemo, logout } = useAuth()
  const plan = user?.plan ?? 'free'
  const isProOrUltra = plan === 'pro' || plan === 'ultra'

  // โหลด/เก็บค่า scale สำหรับปุ่ม A− A A+
  const [scale, setScale] = React.useState<number>(1)
  React.useEffect(() => {
    try { setScale(loadFontScale()) } catch {}
  }, [])
  const handleDec = () => setScale(decFontScale(scale))
  const handleReset = () => setScale(resetFontScale())
  const handleInc = () => setScale(incFontScale(scale))

  return (
    <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2" aria-label="BizProtect Home">
        <img src={`${BASE}brand/BizProtectLogo.png`} alt="BizProtect" className="h-20 w-20 object-contain" />
        <span className="text-2xl font-semibold text-gold">BizProtect</span>
      </Link>

      <nav className="flex items-center gap-8">
        {/* ใช้ Dashboard เป็นหน้าแรกแทน Engine/Unified */}
        <NavLink to="/" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/pricing" className={linkClass}>Plan</NavLink>
        <NavLink to="/knowledge" className={linkClass}>ข้อหารือกรมสรรพากร</NavLink>
        {/* ซ่อนเมนูที่ถูกรวมแล้ว: Engine / Proposal / แผนกรมธรรม์แนะนำ */}
        {/* <NavLink to="/proposal" className={linkClass}>Proposal</NavLink> */}
        {/* <NavLink to="/recommended-plans" className={linkClass}>แผนกรมธรรม์แนะนำ</NavLink> */}
      </nav>

      <div className="flex items-center gap-3">
        {/* ===== PRO/ULTRA: ปุ่มปรับขนาดฟอนต์ทั้งเว็บ ===== */}
        {isProOrUltra && (
          <div
            className="hidden sm:flex items-center gap-1 rounded-lg border border-gold/60 bg-white/5 px-2 py-1 shadow-[0_0_0_1px_rgba(212,175,55,0.25),0_6px_18px_rgba(0,0,0,0.18)]"
            title="ปรับขนาดตัวอักษรทั้งเว็บไซต์ (PRO/ULTRA)"
          >
            <button
              onClick={handleDec}
              className="px-2 py-1 text-xs hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/60 rounded"
              aria-label="ลดขนาดตัวอักษร"
            >
              A-
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 text-xs hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/60 rounded"
              aria-label="รีเซ็ตขนาดตัวอักษร"
            >
              A
            </button>
            <button
              onClick={handleInc}
              className="px-2 py-1 text-xs hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/60 rounded"
              aria-label="เพิ่มขนาดตัวอักษร"
            >
              A+
            </button>
          </div>
        )}

        {user ? (
          <>
            <span className="text-xs px-2 py-1 rounded bg-white/10 ring-1 ring-white/15">
              {user.name} • {user.plan.toUpperCase()}
            </span>
            <button onClick={logout} className="text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => loginAsDemo('free')} className="text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10">
              Demo (Free)
            </button>
            <button onClick={() => loginAsDemo('pro')} className="text-xs px-3 py-1 rounded ring-1 ring-gold/40 hover:bg-gold/10">
              Demo (Pro)
            </button>
            <button onClick={() => loginAsDemo('ultra')} className="text-xs px-3 py-1 rounded ring-1 ring-gold/60 hover:bg-gold/10">
              Demo (Ultra)
            </button>
          </>
        )}
      </div>
    </header>
  )
}
