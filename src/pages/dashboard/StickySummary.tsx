// src/pages/dashboard/StickySummary.tsx
import React from 'react'
import { fmt2 } from '../../components/Num'

type Props = {
  taxYear?: number
  currentThaiYear: number
  setTaxYear: (v: number | undefined) => void
  taxSaved_afterPremGross: number
  taxSavedPct_afterPremGross: number
  combinedCost: number
}

/** เลื่อนไปยัง section ตาม id (ไม่เปลี่ยนหน้า) */
function go(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  // ใช้ scrollIntoView ก่อน (รองรับ scroll-mt-* ได้เลย)
  try {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch {
    // เผื่อบางเบราว์เซอร์: คำนวณ offset ประมาณ 96px สำหรับ header
    const y = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

export default function StickySummary({
  taxYear, currentThaiYear, setTaxYear,
  taxSaved_afterPremGross, taxSavedPct_afterPremGross, combinedCost
}: Props) {
  return (
    <div className="sticky top-0 z-30 -mx-6 px-6 py-3 bg-[color:var(--page)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--page)]/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
        <label className="text-sm text-[color:var(--ink-dim)] flex items-center gap-2">
          ปีภาษีอ้างอิง:
          <input
            type="number"
            inputMode="numeric"
            className="w-24 rounded bg-white/5 px-2 py-1 ring-1 ring-white/10 text-right text-[color:var(--ink)] outline-none focus:ring-gold/60"
            value={taxYear ?? (currentThaiYear)}
            onChange={(e) => {
              const v = e.target.value.trim()
              setTaxYear(v === '' ? undefined : Number(v))
            }}
          />
        </label>

        {/* สรุปตัวเลข */}
        <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-3 mt-3">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-m font-semibold text-gold-2">ภาษีลดลง (หลังเข้าร่วมโครงการฯ)</div>
            <div className="text-m font-semibold text-right text-gold">
              {fmt2(taxSaved_afterPremGross)}{' '}
              <span className="text-l text-white/80">
                ({(taxSavedPct_afterPremGross || 0).toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-m font-semibold text-gold-2">บันทึกเป็นค่าใช้จ่าย(เบี้ย+ภาษีออกแทน)</div>
            <div className="text-l font-semibold text-right text-gold">{fmt2(combinedCost)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
