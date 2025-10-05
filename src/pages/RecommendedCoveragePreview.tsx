// src/pages/RecommendedCoveragePreview.tsx
import React from 'react'
import { Document, BlobProvider, Font } from '@react-pdf/renderer'
import RecommendedCoveragePage from '../components/pdf/RecommendedCoveragePage'
import Card from '../components/Card'
import { load } from '../lib/storage'
import { initialState } from '../lib/state'
import type { AppState } from '../lib/types'

const BASE = (import.meta as any)?.env?.BASE_URL || '/'
const F_REG = `${BASE}fonts/IBMPlexSansThaiLooped-Regular.ttf`
const F_SEMI = `${BASE}fonts/IBMPlexSansThaiLooped-SemiBold.ttf`
const F_BOLD = `${BASE}fonts/IBMPlexSansThaiLooped-Bold.ttf`

try {
  Font.register({
    family: 'PlexThaiLooped',
    fonts: [
      { src: F_REG, fontWeight: 400 },
      { src: F_SEMI, fontWeight: 600 },
      { src: F_BOLD, fontWeight: 700 },
    ],
  })
} catch {}

type Plan = 'free' | 'pro' | 'ultra'
type Sex = 'male' | 'female'

export default function RecommendedCoveragePreview() {
  // ใช้ state ปัจจุบันจาก LocalStorage (เหมือน TaxEngine)
  const [state] = React.useState<AppState>(() => load<AppState>(initialState))

  // คอนโทรลบนหน้าเพื่อทดสอบ UX
  const [plan, setPlan] = React.useState<Plan>('pro')
  const [sex, setSex] = React.useState<Sex>('male')
  const [age, setAge] = React.useState<number>(35)
  const [brandLogoDataUrl, setBrandLogoDataUrl] = React.useState<string | undefined>(undefined)

  const handleLogoFile = (f?: File | null) => {
    if (!f) { setBrandLogoDataUrl(undefined); return }
    const reader = new FileReader()
    reader.onload = () => setBrandLogoDataUrl(reader.result as string)
    reader.readAsDataURL(f)
  }

  // ตัว Document มีหน้าเดียว: RecommendedCoveragePage
  const Doc = (
    <Document>
      <RecommendedCoveragePage
        state={state}
        plan={plan}
        brandLogoDataUrl={plan === 'ultra' ? brandLogoDataUrl : undefined}
        age={age}
        sex={sex}
      />
    </Document>
  )

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="text-xl font-semibold text-gold mb-4">ทุน & แผนประกัน — UX Preview</h2>

      <Card title="ตัวเลือกสำหรับพรีวิว (เฉพาะหน้าเว็บ)">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* แผน (สิทธิ์ฟีเจอร์มีผลเฉพาะโลโก้ Ultra) */}
          <div>
            <div className="text-sm text-[color:var(--ink-dim)] mb-1">แผนผู้ใช้</div>
            <select
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={plan}
              onChange={(e) => setPlan(e.target.value as Plan)}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>

          {/* เพศ */}
          <div>
            <div className="text-sm text-[color:var(--ink-dim)] mb-1">เพศ</div>
            <div className="inline-flex rounded-lg overflow-hidden ring-1 ring-white/15">
              <button
                className={['px-3 py-1 text-sm', sex === 'male' ? 'bg-gold/20 text-gold' : 'bg-white/5 hover:bg-white/10'].join(' ')}
                onClick={() => setSex('male')}
                type="button"
              >
                ชาย
              </button>
              <button
                className={['px-3 py-1 text-sm', sex === 'female' ? 'bg-gold/20 text-gold' : 'bg-white/5 hover:bg-white/10'].join(' ')}
                onClick={() => setSex('female')}
                type="button"
              >
                หญิง
              </button>
            </div>
          </div>

          {/* อายุ */}
          <div>
            <div className="text-sm text-[color:var(--ink-dim)] mb-1">อายุ (ปี)</div>
            <input
              type="number"
              min={0}
              max={99}
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={age}
              onChange={(e) => setAge(Math.max(0, Math.min(99, Number(e.target.value || 0))))}
              placeholder="35"
            />
          </div>

          {/* Ultra logo upload */}
          <div>
            <div className="text-sm text-[color:var(--ink-dim)] mb-1">โลโก้มุมขวา (Ultra เท่านั้น)</div>
            <input
              type="file"
              accept="image/*"
              disabled={plan !== 'ultra'}
              className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-gold/10 file:px-3 file:py-1 file:text-gold disabled:opacity-50"
              onChange={(e) => handleLogoFile(e.target.files?.[0] ?? null)}
            />
            {plan === 'ultra' && brandLogoDataUrl && (
              <button
                onClick={() => handleLogoFile(null)}
                className="mt-2 text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10"
              >
                ลบโลโก้
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* พรีวิว */}
      <div className="mt-6 rounded-xl overflow-hidden ring-1 ring-white/10 bg-black/10 h-[80vh]">
        <BlobProvider document={Doc}>
          {({ url, loading, error }) => {
            if (loading) return <div className="p-6 text-center text-sm">กำลังสร้างตัวอย่าง…</div>
            if (error)   return <div className="p-6 text-center text-sm text-red-400">สร้างตัวอย่างไม่สำเร็จ</div>
            return <iframe key={url} src={url || undefined} className="w-full h-full" title="Coverage UX Preview" />
          }}
        </BlobProvider>
      </div>
    </main>
  )
}
