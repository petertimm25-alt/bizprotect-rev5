import React from 'react'
import { useAuth } from '../lib/auth'

/**
 * ชื่อคีย์ต้องตรงกับ ent ใน useAuth():
 *  - ent.knowledge_full
 *  - ent.export_pdf
 *  - ent.agent_identity_on_pdf
 *  - ent.custom_branding
 * และควรมี ent.directorsMax (number) แยกต่างหาก
 */
type FeatureKey =
  | 'knowledge_full'
  | 'export_pdf'
  | 'agent_identity_on_pdf'
  | 'custom_branding'

export default function RequireFeature({
  feature,
  children,
}: {
  feature: FeatureKey
  children: React.ReactNode
}) {
  const { user, ent, plan } = useAuth() as any

  // ป้องกันกรณีโปรเจ็กต์เก่า ent ยังไม่มี:
  // ถ้าไม่มี ent ให้เดาจาก plan ชั่วคราว (free/pro/ultra)
  const fallbackEnt = React.useMemo(() => {
    const p = (plan ?? 'free') as 'free' | 'pro' | 'ultra'
    return {
      export_pdf: p !== 'free',
      knowledge_full: p !== 'free',
      agent_identity_on_pdf: p !== 'free',
      custom_branding: p === 'ultra',
    }
  }, [plan])

  const e = ent ?? fallbackEnt
  const ok = !!user && !!e?.[feature]

  if (ok) return <>{children}</>

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm">
      <div className="text-[#EBDCA6] font-medium mb-1">ต้องอัปเกรดแพ็กเกจ</div>
      <div className="text-[color:var(--ink-dim)]">
        ฟีเจอร์นี้สงวนสำหรับแผน <b>Pro</b> หรือ <b>Ultra</b> ({feature})
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => (window.location.href = '/pricing')}
          className="bp-btn bp-btn--sm"
          title="ดูแพ็กเกจ"
        >
          อัปเกรดแพ็กเกจ
        </button>
        {!user && (
          <button
            onClick={() => (window.location.href = '/login')}
            className="bp-btn bp-btn--sm bp-btn--ghost"
            title="เข้าสู่ระบบ"
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>
    </div>
  )
}
