// src/components/HeaderNav.tsx
import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const BASE = (import.meta as any)?.env?.BASE_URL || '/'

const LockIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2H10V6Zm8 12H7v-8h10v8Z"
    />
  </svg>
)

const Burger = ({ open }: { open: boolean }) => (
  <span className="inline-block w-5 h-5 relative" aria-hidden="true">
    <span
      className={[
        'absolute left-0 right-0 h-[2px] bg-current transition-transform',
        open ? 'top-2.5 rotate-45' : 'top-1',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-[2px] bg-current transition-opacity',
        open ? 'opacity-0' : 'top-2.5 opacity-100',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-[2px] bg-current transition-transform',
        open ? 'top-2.5 -rotate-45' : 'top-4',
      ].join(' ')}
    />
  </span>
)

const PlanBadge = ({ plan }: { plan: 'free' | 'pro' | 'ultra' }) => {
  const color =
    plan === 'ultra'
      ? 'bg-purple-500/20 text-purple-200 ring-purple-400/30'
      : plan === 'pro'
      ? 'bg-[var(--brand-accent)]/20 text-[var(--brand-accent)] ring-[var(--brand-accent)]/30'
      : 'bg-white/10 text-white/80 ring-white/20'
  return (
    <span
      className={[
        'ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
        color,
      ].join(' ')}
      title={`แผน: ${plan.toUpperCase()}`}
    >
      {plan}
    </span>
  )
}

export default function HeadNav() {
  const { user, signOut, loading, envReady, envError, ent, plan } = useAuth()
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  // ปิดเมนูเมื่อเปลี่ยนเส้นทาง (กันค้าง)
  React.useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  const baseLink =
    'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-[#EBDCA6] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'
  const activeClass = ({ isActive }: { isActive: boolean }) =>
    [
      baseLink,
      isActive ? 'text-[#EBDCA6] bg-white/5 ring-1 ring-gold/30' : '',
    ].join(' ')

  // ลิงก์คลังข้อหารือ: เปิดได้เฉพาะ ent.knowledge_full (ULTRA)
  const KnowledgeLink = () => {
    if (ent.knowledge_full) {
      return (
        <NavLink to="/knowledge" className={activeClass}>
          คลังข้อหารือ
        </NavLink>
      )
    }
    return (
      <button
        type="button"
        className={[baseLink, 'opacity-90'].join(' ')}
        onClick={() => navigate('/pricing')}
        title="ฟีเจอร์เฉพาะ Ultra — คลิกเพื่อดูแพ็กเกจ"
      >
        <LockIcon />
        คลังข้อหารือ
      </button>
    )
  }

  return (
    <>
      {/* ENV banner */}
      {!envReady && (
        <div className="w-full bg-red-500/15 text-red-200 text-xs text-center py-2">
          {envError || 'Environment ยังไม่พร้อม — โปรดตั้งค่า .env.local'}
        </div>
      )}

      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#0B1B2B]/70 bg-[#0B1B2B]/90 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="h-14 flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2" aria-label="BizProtect Home">
                <img
                  src={`${BASE}brand/BizProtectLogo.png`}
                  alt="BizProtect"
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
                />
                <span className="hidden sm:inline text-sm font-semibold tracking-wide text-[#EBDCA6]">
                  BizProtect
                </span>
              </Link>
              {/* Desktop nav — ใช้ route เดิม (ตัด Plan ออก) */}
              <nav className="hidden md:flex items-center gap-1 ml-2">
                <NavLink to="/" end className={activeClass}>
                  Home
                </NavLink>
                <NavLink to="/dashboard" className={activeClass}>
                  Calculator
                </NavLink>
                <KnowledgeLink />
              </nav>
            </div>

            {/* Right: Auth */}
            <div className="hidden md:flex items-center gap-2">
              {loading ? (
                <div className="text-xs text-white/70 animate-pulse px-3 py-1.5 rounded-lg bg-white/5">
                  Loading…
                </div>
              ) : user ? (
                <>
                  <span className="text-sm text-white/85 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10">
                    {user.email || 'user'}
                    <PlanBadge plan={plan} />
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm rounded-lg px-3 py-1.5 ring-1 ring-white/15 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    title="ออกจากระบบ"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm rounded-lg px-3 py-1.5 ring-1 ring-gold/40 text-gold hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile: burger */}
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg ring-1 ring-white/15 hover:bg-white/10"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation"
            >
              <Burger open={open} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div
          id="mobile-nav"
          className={[
            'md:hidden border-t border-white/10 transition-[max-height]',
            open ? 'max-h-72' : 'max-h-0 overflow-hidden',
          ].join(' ')}
        >
          <div className="px-4 py-2 space-y-1">
            <NavLink to="/" end className={activeClass} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={activeClass} onClick={() => setOpen(false)}>
              Calculator
            </NavLink>
            <div onClick={() => setOpen(false)}>
              <KnowledgeLink />
            </div>

            <div className="pt-2 border-t border-white/10 mt-2">
              {loading ? (
                <div className="text-xs text-white/70 px-3 py-1.5">Loading…</div>
              ) : user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/85 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10">
                    {user.email || 'user'}
                    <PlanBadge plan={plan} />
                  </span>
                  <button
                    onClick={() => {
                      setOpen(false)
                      void signOut()
                    }}
                    className="ml-2 text-sm rounded-lg px-3 py-1.5 ring-1 ring-white/15 hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex justify-center items-center text-sm rounded-lg px-3 py-1.5 ring-1 ring-gold/40 text-gold hover:bg-gold/10 w-full"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
