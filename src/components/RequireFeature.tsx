import React from 'react'
import { useAuth } from '../lib/auth'

/** ชื่อคีย์ต้องตรงกับ ent ใน useAuth() */
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
  const { user, ent } = useAuth()
  const ok = !!user && !!ent?.[feature]

  if (ok) return <>{children}</>

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm">
      <div className="text-[#EBDCA6] font-medium mb-1">ต้องอัปเกรดแพ็กเกจ</div>
      <div className="text-[color:var(--ink-dim)]">
        ฟีเจอร์นี้สงวนสำหรับแผน <b>Pro</b> หรือ <b>Ultra</b> (สิทธิ์ <code>knowledge_full</code>)
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
