// src/routes/PlanGuard.tsx
import React from 'react'
import { useAuth } from '../lib/auth'

type Plan = 'free' | 'pro' | 'ultra'

// อ่าน override (สำหรับเทส) จาก localStorage ก่อน ถ้าไม่มีค่อยใช้ของ user
function getEffectivePlan(userPlan?: Plan | null): Plan {
  const ov = (typeof window !== 'undefined' ? localStorage.getItem('bp:plan') : '') || ''
  const low = ov.toLowerCase()
  if (low === 'free' || low === 'pro' || low === 'ultra') return low as Plan
  return (userPlan ?? 'free') as Plan
}

export default function PlanGuard(
  { requirePlan = 'ultra', children }: React.PropsWithChildren<{ requirePlan?: Plan }>
) {
  const { user, loading } = useAuth() as any
  const plan = getEffectivePlan(user?.plan)

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-sm text-[color:var(--ink-dim)]">
        กำลังตรวจสอบสิทธิ์…
      </div>
    )
  }
  // ปกติจะถูกห่อด้วย <PrivateRoute/> อยู่แล้ว ถ้าไม่มี user ก็ไม่ต้องแสดงอะไร
  if (!user) return null

  const ok =
    requirePlan === 'ultra' ? plan === 'ultra'
    : requirePlan === 'pro' ? (plan === 'pro' || plan === 'ultra')
    : true

  if (ok) return <>{children}</>

  // ไม่ redirect → แสดงการ์ดอัปเกรดแทน (จะไม่มีกระพริบ/วนลูป)
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-gold">ต้องอัปเกรดแพ็กเกจ</h2>
        <p className="mt-2 text-sm text-white/85">
          เนื้อหาส่วนนี้เปิดให้สำหรับสมาชิก <b>{requirePlan.toUpperCase()}</b> ขึ้นไปเท่านั้น<br />
          สถานะปัจจุบันของคุณ: <b>{String(plan).toUpperCase()}</b>
        </p>
        <div className="mt-4 flex gap-2">
          <a href="/pricing" className="bp-btn bp-btn-primary">ดูแพ็กเกจ</a>
          <a href="/dashboard" className="bp-btn">กลับหน้าเครื่องมือ</a>
        </div>
      </div>
    </main>
  )
}
