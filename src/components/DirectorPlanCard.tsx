// src/components/DirectorPlanCard.tsx
import React from 'react'
import NumberInput from './NumberInput'

type Sex = 'male' | 'female'

type Props = {
  d: any
  index: number
  onChange: (id: string, patch: Record<string, any>) => void
  payYears?: number // default 7
}

const fmt0 = (n?: number) =>
  n === undefined || Number.isNaN(n)
    ? '-'
    : n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export default function DirectorPlanCard({ d, index, onChange, payYears = 7 }: Props) {
  const sex: Sex = d.sex === 'female' ? 'female' : 'male'
  const age: number = typeof d.age === 'number' ? d.age : 35
  const sumAssured: number = typeof d.sumAssured === 'number' ? d.sumAssured : 10_000_000
  const yearlyPremium: number = typeof d.personalInsurancePremium === 'number' ? d.personalInsurancePremium : 200_000
  const baseIncome: number = typeof d.annualSalary === 'number' ? d.annualSalary : 2_400_000

  const surrY7 = d.surrenderY7
  const surrAge60 = d.surrenderAge60
  const surrAge70 = d.surrenderAge70
  const surrAge99 = d.surrenderAge99

  // header mini KPIs
  const accum7 = (yearlyPremium || 0) * payYears

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="mr-auto">
          <div className="text-sm text-[color:var(--ink-dim)]">กรรมการ:</div>
          <input
            className="mt-1 w-[18rem] max-w-full rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={d.name || `ผู้บริหาร ${index + 1}`}
            onChange={(e) => onChange(d.id, { name: e.target.value })}
            placeholder="ชื่อ/ตำแหน่ง"
          />
        </div>

        {/* KPI chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
          <Kpi label="อายุ" value={`${age} ปี`} />
          <Kpi label="เพศ" value={sex === 'male' ? 'ชาย' : 'หญิง'} />
          <Kpi label="เงินได้ ม.40(1) (ปี)" value={fmt0(baseIncome)} right />
          <Kpi label="เบี้ย/ปี" value={fmt0(yearlyPremium)} right highlight />
        </div>
      </div>

      <div className="my-4 h-px bg-white/10" />

      {/* Row 1: เพศ / อายุ / รายได้ / เบี้ย */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* เพศ */}
        <div>
          <div className="text-sm text-[color:var(--ink-dim)] mb-1">เพศ</div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`sex-${d.id}`}
                className="accent-gold"
                checked={sex === 'male'}
                onChange={() => onChange(d.id, { sex: 'male' })}
              />
              <span>ชาย</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`sex-${d.id}`}
                className="accent-gold"
                checked={sex === 'female'}
                onChange={() => onChange(d.id, { sex: 'female' })}
              />
              <span>หญิง</span>
            </label>
          </div>
        </div>

        {/* อายุ */}
        <div>
          <div className="text-sm text-[color:var(--ink-dim)] mb-1">อายุ</div>
          <input
            type="number"
            min={1}
            max={80}
            value={age}
            onChange={(e) => {
              const v = Math.max(1, Math.min(80, Number(e.target.value)))
              onChange(d.id, { age: v })
            }}
            className="w-full rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            placeholder="เช่น 35"
          />
        </div>

        {/* เงินได้ ม.40(1) */}
        <div>
          <div className="text-sm text-[color:var(--ink-dim)] mb-1">เงินได้ ม.40(1) (บาท/ปี)</div>
          <NumberInput
            value={baseIncome}
            onChange={(v) => onChange(d.id, { annualSalary: v ?? 0 })}
            placeholder="2,400,000"
          />
        </div>

        {/* เบี้ย/ปี */}
        <div>
          <div className="text-sm text-[color:var(--ink-dim)] mb-1">เบี้ยประกัน (บาท/ปี)</div>
          <NumberInput
            value={yearlyPremium}
            onChange={(v) => onChange(d.id, { personalInsurancePremium: v ?? 0 })}
            placeholder="เช่น 200,000"
          />
        </div>
      </div>

      {/* Row 2: แบบประกัน + ทุน */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* แบบประกัน (read only) */}
        <div>
          <div className="text-sm text-[color:var(--ink-dim)] mb-1">แบบประกันฯ (ระบบเลือก)</div>
          <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            My Style Legacy Ultra (Unitlinked) • ชำระเบี้ย {payYears} ปี • คุ้มครองถึงอายุ 99 ปี
          </div>
        </div>

        {/* ทุนประกันชีวิต */}
        <div>
          <div className="text-sm text-[color:var(--ink-dim)] mb-1">ทุนประกันชีวิต (บาท)</div>
          <NumberInput
            value={sumAssured}
            onChange={(v) => onChange(d.id, { sumAssured: v ?? 0 })}
            placeholder="เช่น 10,000,000"
          />
        </div>
      </div>

      {/* Row 3: surrender values */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="มูลค่ารับซื้อคืน ปีที่ 7">
          <NumberInput value={surrY7} onChange={(v) => onChange(d.id, { surrenderY7: v ?? undefined })} />
        </Field>
        <Field label="มูลค่ารับซื้อคืน เมื่ออายุ 60 ปี">
          <NumberInput value={surrAge60} onChange={(v) => onChange(d.id, { surrenderAge60: v ?? undefined })} />
        </Field>
        <Field label="มูลค่ารับซื้อคืน เมื่ออายุ 70 ปี">
          <NumberInput value={surrAge70} onChange={(v) => onChange(d.id, { surrenderAge70: v ?? undefined })} />
        </Field>
        <Field label="มูลค่ารับซื้อคืน เมื่ออายุ 99 ปี">
          <NumberInput value={surrAge99} onChange={(v) => onChange(d.id, { surrenderAge99: v ?? undefined })} />
        </Field>
      </div>

      {/* Footer mini summary */}
      <div className="mt-4 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10 text-xs text-[color:var(--ink-dim)]">
        พรีวิว: เบี้ยตลอดสัญญา {payYears} ปี = <span className="text-[color:var(--ink)]">{fmt0(accum7)}</span>{' '}
        • ทุนถึงอายุ 99 ปี = <span className="text-[color:var(--ink)]">{fmt0(sumAssured)}</span>
      </div>
    </div>
  )
}

function Kpi({ label, value, right, highlight }: { label: string; value: string; right?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
      <div className="text-[10px] leading-4 text-[color:var(--ink-dim)]">{label}</div>
      <div className={['text-sm font-medium', right ? 'text-right' : '', highlight ? 'text-gold' : ''].join(' ')}>
        {value}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-[color:var(--ink-dim)] mb-1">{label}</div>
      {children}
    </div>
  )
}
