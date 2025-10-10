import React from 'react'
import type { AppState } from '../../lib/types'
import { useAuth } from '../../lib/auth'

type Props = {
  data: AppState
  setData: React.Dispatch<React.SetStateAction<AppState>>
  canUploadLogo: boolean
  handleLogoChange: (file?: File | null) => void
}

export default function PresenterSection({
  data, setData, canUploadLogo, handleLogoChange
}: Props) {
  const { ent } = useAuth()
  const presenter = (data as any).presenter || {}

  const setPresenter = (patch: Partial<any>) =>
    setData(s => ({ ...s, presenter: { ...(s as any).presenter, ...patch } } as any))

  return (
    <section id="presenter-sec" className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-[#EBDCA6]">ข้อมูลผู้นำเสนอ (ใช้ในเอกสาร PDF)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">ชื่อผู้เสนอ</span>
          <input
            className="rounded bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={presenter.name || ''}
            onChange={(e) => setPresenter({ name: e.target.value })}
            placeholder="เช่น สมคิด ใจดี"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">เบอร์โทร</span>
          <input
            className="rounded bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={presenter.phone || ''}
            onChange={(e) => setPresenter({ phone: e.target.value })}
            placeholder="08x-xxx-xxxx"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">อีเมล</span>
          <input
            className="rounded bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={presenter.email || ''}
            onChange={(e) => setPresenter({ email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">บริษัท</span>
          <input
            className="rounded bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={presenter.company || ''}
            onChange={(e) => setPresenter({ company: e.target.value })}
            placeholder="ชื่อบริษัท"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">เลขที่ใบอนุญาต</span>
          <input
            className="rounded bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={presenter.licenseNo || ''}
            onChange={(e) => setPresenter({ licenseNo: e.target.value })}
            placeholder="เช่น 12-34-56789"
          />
        </label>

        {/* ฟิลด์ใหม่: รหัสตัวแทน */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">รหัสตัวแทน</span>
          <input
            className="rounded bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={presenter.agentCode || ''}
            onChange={(e) => setPresenter({ agentCode: e.target.value })}
            placeholder="เช่น AGT-0001"
          />
        </label>
      </div>

      {/* โลโก้ (เฉพาะ ULTRA) */}
      {canUploadLogo && (
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <span className="text-xs text-white/70">โลโก้สำหรับเอกสาร (Ultra)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
            />
            {presenter.logoDataUrl ? (
              <img src={presenter.logoDataUrl} alt="brand" className="h-8 object-contain ml-2 rounded" />
            ) : null}
          </label>
          <p className="text-[11px] text-white/60 mt-1">
            แนะนำ PNG พื้นโปร่ง ขนาด ~200×200px
          </p>
        </div>
      )}
    </section>
  )
}
