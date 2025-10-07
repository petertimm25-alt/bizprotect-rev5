import React from 'react'
import Card from '../../components/Card'
import NumberInput from '../../components/NumberInput'
import { emptyIfZero, fmt2 } from '../../components/Num'

type Props = {
  company: any
  interest: number
  actualCIT: number
  disallow_base: number
  onChange: (patch: Partial<any>) => void
  onClear: () => void
}

export default function CompanySection({
  company, interest, actualCIT, disallow_base, onChange, onClear
}: Props) {
  return (
    <section id="company-sec" className="grid gap-6">
      <Card title="ข้อมูลบริษัท">
        <div className="mb-3 flex items-center">
          <div className="text-sm text-[color:var(--ink-dim)]">กรอกข้อมูลตั้งต้นของบริษัท</div>
          <button onClick={onClear} className="ml-auto text-xs bp-btn bp-btn--sm bp-btn--ghost disabled:opacity-40 hover:text-gold">ล้างข้อมูล</button>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="text-sm text-[color:var(--ink-dim)]">ชื่อบริษัท</div>
          <input
            className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={company.name ?? ''}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="ชื่อบริษัท"
          />

          <div className="text-sm text-[color:var(--ink-dim)]">รายได้รวม (Income)</div>
          <NumberInput
            value={emptyIfZero(company.companyIncome)}
            onChange={v => onChange({ companyIncome: v ?? 0 })}
            placeholder="สมมุติฐาน หรือจาก DBD"
          />

          <div className="text-sm text-[color:var(--ink-dim)]">รายจ่ายรวม (Expense)</div>
          <NumberInput
            value={emptyIfZero(company.companyExpense)}
            onChange={v => onChange({ companyExpense: v ?? 0 })}
            placeholder="สมมุติฐาน หรือจาก DBD"
          />

          <div className="text-sm text-[color:var(--ink-dim)]">ดอกเบี้ยจ่าย (Interest expense)</div>
          <NumberInput
            value={emptyIfZero(interest)}
            onChange={v => onChange({ interestExpense: v ?? 0 })}
            placeholder="สมมุติฐาน หรือจาก DBD"
          />

          <div className="text-sm text-[color:var(--ink-dim)]">ภาษีเงินได้จริง</div>
          <NumberInput
            value={emptyIfZero(actualCIT)}
            onChange={v => onChange({ actualCIT: v ?? 0 })}
            placeholder="สมมุติฐาน หรือจาก DBD"
          />

          <div className="text-sm text-[color:var(--ink-dim)]">บวกกลับค่าใช้จ่ายต้องห้าม<br/>(คำนวณจากงบจริง)</div>
          <span className="text-[#FF4D4D] font-bold">{fmt2(disallow_base)}</span>
        </div>
      </Card>
    </section>
  )
}
