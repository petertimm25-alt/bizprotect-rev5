// src/pages/dashboard/PresenterSection.tsx
import React from 'react'
import Card from '../../components/Card'

type Props = {
  data: any
  setData: React.Dispatch<React.SetStateAction<any>>
  canUploadLogo: boolean
  handleLogoChange: (file?: File | null) => void
}

export default function PresenterSection({ data, setData, canUploadLogo, handleLogoChange }: Props) {
  return (
    <section className="mt-6">
      <Card title="ข้อมูลผู้นำเสนอ (ใช้ในเอกสาร PDF)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm text-[color:var(--ink-dim)]">ชื่อ-สกุล</div>
            <input
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={(data as any).presenter?.name ?? ''}
              onChange={e =>
                setData((s: any) => ({ ...s, presenter: { ...(s as any).presenter, name: e.target.value } as any }))
              }
              placeholder="เช่น สมคิด ใจดี"
            />
          </div>
          <div>
            <div className="text-sm text-[color:var(--ink-dim)]">เบอร์โทร</div>
            <input
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={(data as any).presenter?.phone ?? ''}
              onChange={e =>
                setData((s: any) => ({ ...s, presenter: { ...(s as any).presenter, phone: e.target.value } as any }))
              }
              placeholder="08x-xxx-xxxx"
            />
          </div>
          <div>
            <div className="text-sm text-[color:var(--ink-dim)]">อีเมล</div>
            <input
              type="email"
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={(data as any).presenter?.email ?? ''}
              onChange={e =>
                setData((s: any) => ({ ...s, presenter: { ...(s as any).presenter, email: e.target.value } as any }))
              }
              placeholder="somkid@company.com"
            />
          </div>

          <div>
            <div className="text-sm text-[color:var(--ink-dim)]">บริษัท</div>
            <input
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={(data as any).presenter?.company ?? ''}
              onChange={e =>
                setData((s: any) => ({ ...s, presenter: { ...(s as any).presenter, company: e.target.value } as any }))
              }
              placeholder="เช่น บริษัทนายหน้าประกัน จำกัด"
            />
          </div>
          <div>
            <div className="text-sm text-[color:var(--ink-dim)]">เลขที่ใบอนุญาต</div>
            <input
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={(data as any).presenter?.licenseNo ?? ''}
              onChange={e =>
                setData((s: any) => ({ ...s, presenter: { ...(s as any).presenter, licenseNo: e.target.value } as any }))
              }
              placeholder="เช่น ว000000"
            />
          </div>
        </div>

        {canUploadLogo && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <div className="md:col-span-2">
              <div className="text-sm text-[color:var(--ink-dim)]">โลโก้บริษัทของคุณ หรือ ไลน์ QR Code (จะแทนที่โลโก้ BizProtect บนเอกสาร)</div>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-gold/10 file:px-3 file:py-1 file:text-gold hover:file:bg-gold/20"
                onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
              />
              <div className="text-xs text-[color:var(--ink-dim)] mt-1">แนะนำ PNG พื้นหลังโปร่ง ขนาดกว้าง ≥ 600px</div>
              {(data as any).presenter?.logoDataUrl && (
                <button
                  className="mt-2 text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10"
                  onClick={() =>
                    setData((s: any) => ({ ...s, presenter: { ...(s as any).presenter, logoDataUrl: undefined } as any }))
                  }
                >
                  ลบโลโก้
                </button>
              )}
            </div>
            <div className="md:col-span-1">
              <div className="text-sm text-[color:var(--ink-dim)] mb-2">พรีวิว</div>
              <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-center h-28">
                {(data as any).presenter?.logoDataUrl
                  ? <img src={(data as any).presenter.logoDataUrl} alt="logo preview" className="max-h-24 object-contain" />
                  : <span className="text-xs text-[color:var(--ink-dim)]">ยังไม่ได้เลือกโลโก้</span>}
              </div>
            </div>
          </div>
        )}
      </Card>
    </section>
  )
}
