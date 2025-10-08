// src/pages/dashboard/DirectorsSection.tsx
import React from 'react'
import Card from '../../components/Card'
import NumberInput from '../../components/NumberInput'
import { pitTax, marginalRate, progressiveGrossUp } from '../../lib/tax'
import { emptyIfZero, fmt2 } from '../../components/Num'

// ===== Types (กันพลาด any) =====
type Sex = 'male' | 'female'

type Director = {
  id: string
  name?: string | null
  sex?: Sex
  age?: number | null
  annualSalary?: number | null
  personalInsurancePremium?: number | null
  sumAssured?: number | null
  surrenderY7?: number | null
  surrenderAge60?: number | null
  surrenderAge70?: number | null
  surrenderAge99?: number | null
  // เผื่อฟิลด์อื่นในอนาคต
  [k: string]: unknown
}

type Props = {
  directors: Director[]
  limit: number
  setData: React.Dispatch<React.SetStateAction<any>>
  personalExpense: number
  personalAllowance: number
  recProductName: string
  recPayYears: string
  recCoverage: string
  setRecFields: (p: Partial<{ recProductName: string; recPayYears: string; recCoverage: string }>) => void
}

// ===== Safe getters =====
const getSex = (d: Director): Sex => (d.sex === 'female' ? 'female' : 'male')
const getAge = (d: Director): number => (typeof d.age === 'number' && !Number.isNaN(d.age) ? d.age : 35)
const getSumAssured = (d: Director): number =>
  typeof d.sumAssured === 'number' && !Number.isNaN(d.sumAssured) ? d.sumAssured : 10_000_000
const getPremium = (d: Director): number =>
  typeof d.personalInsurancePremium === 'number' && !Number.isNaN(d.personalInsurancePremium)
    ? d.personalInsurancePremium
    : 200_000
const getSurr = (d: Director, key: keyof Director): number | undefined => {
  const v = d[key]
  return typeof v === 'number' && !Number.isNaN(v) ? v : undefined
}

// ===== Component =====
export default function DirectorsSection({
  directors, limit, setData, personalExpense, personalAllowance,
  recProductName, recPayYears, recCoverage, setRecFields
}: Props) {
  // อายุแบบ draft ต่อคน (ใน section นี้เท่านั้น)
  const [ageDraft, setAgeDraft] = React.useState<Record<string, string>>({})

  // ซิงก์ ageDraft เมื่อรายการกรรมการเปลี่ยน
  React.useEffect(() => {
    setAgeDraft(prev => {
      const next = { ...prev }
      directors.forEach(d => {
        if (next[d.id] === undefined) {
          next[d.id] = d.age != null ? String(d.age) : ''
        }
      })
      // ล้าง entry ที่ไม่มีแล้ว
      Object.keys(next).forEach(id => {
        if (!directors.find(d => d.id === id)) delete next[id]
      })
      return next
    })
  }, [directors])

  const canAdd = directors.length < limit

  const addDirector = () => {
    if (!canAdd) return
    setData((s: any) => ({
      ...s,
      company: {
        ...s.company,
        directors: [
          ...s.company.directors,
          {
            id: String(Date.now()),
            name: `ผู้บริหาร ${s.company.directors.length + 1}`,
            annualSalary: undefined as any,
            personalInsurancePremium: undefined as any,
          } as Director,
        ],
      },
    }))
  }

  const removeLast = () =>
    setData((s: any) => ({
      ...s,
      company: { ...s.company, directors: s.company.directors.slice(0, -1) },
    }))

  return (
    <section id="directors-sec" className="space-y-4">
      {/* ฟิลด์ “แบบประกันฯ แนะนำ” — กำหนดครั้งเดียว ใช้กับทุกกรรมการ */}
      <Card title="แบบประกันฯ แนะนำ (ใช้กับผู้บริหารทุกคน)">
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={recProductName}
            onChange={(e) => setRecFields({ recProductName: e.target.value })}
            placeholder="ชื่อแบบประกัน เช่น My Style Legacy Ultra"
          />
          <input
            className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={recPayYears}
            onChange={(e) => setRecFields({ recPayYears: e.target.value })}
            placeholder="ชำระเบี้ย(ปี) เช่น 7 ปี"
          />
          <input
            className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
            value={recCoverage}
            onChange={(e) => setRecFields({ recCoverage: e.target.value })}
            placeholder="ระยะเวลาคุ้มครอง เช่น ถึงอายุ 99 ปี"
          />
        </div>
        <div className="text-xs text-[color:var(--ink-dim)] mt-2">
          * ทั้ง 3 ฟิลด์เก็บเป็น string เพื่อรองรับหลายบริษัทประกัน
        </div>
      </Card>

      {/* ปุ่มเพิ่ม/ลบ */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={removeLast}
          className="bp-btn bp-btn--sm bp-btn--ghost disabled:opacity-40 hover:text-gold"
          disabled={directors.length === 0}
          title={directors.length === 0 ? 'ไม่มีรายการให้ลบ' : 'ลบผู้บริหารคนสุดท้าย'}
        >
          - ลบ
        </button>
        <button
          onClick={addDirector}
          className="bp-btn bp-btn--sm bp-btn--ghost disabled:opacity-40 hover:text-gold-2"
          disabled={!canAdd}
          title={canAdd ? 'เพิ่มผู้บริหาร' : `ครบสูงสุด ${limit} คนแล้ว`}
        >
          + เพิ่ม (สูงสุด {limit})
        </button>
      </div>

      {directors.length === 0 && (
        <Card title="ยังไม่มีรายชื่อผู้บริหาร">
          <div className="text-sm text-[color:var(--ink-dim)]">
            โปรดเพิ่มรายชื่อกรรมการในส่วนนี้ แล้วกำหนดรายละเอียดรายคน
          </div>
        </Card>
      )}

      {directors.map((d, idx) => {
        const sex = getSex(d)
        const age = getAge(d)
        const sumAssured = getSumAssured(d)
        const yearlyPremium = getPremium(d)

        const surrY7 = getSurr(d, 'surrenderY7')
        const surrAge60 = getSurr(d, 'surrenderAge60')
        const surrAge70 = getSurr(d, 'surrenderAge70')
        const surrAge99 = getSurr(d, 'surrenderAge99')

        // PIT trio preview (กัน NaN ทุกทางเข้า)
        const base = typeof d.annualSalary === 'number' && !Number.isNaN(d.annualSalary) ? d.annualSalary : 0
        const prem =
          typeof d.personalInsurancePremium === 'number' && !Number.isNaN(d.personalInsurancePremium)
            ? d.personalInsurancePremium
            : 0

        const safeExpense = Number.isFinite(personalExpense) ? personalExpense : 0
        const safeAllowance = Number.isFinite(personalAllowance) ? personalAllowance : 0

        const g3 = progressiveGrossUp(base, prem, safeExpense + safeAllowance)
        const tax1 = Math.max(0, base - safeExpense - safeAllowance)
        const pit1 = pitTax(tax1)
        const tax2 = Math.max(0, base + prem - safeExpense - safeAllowance)
        const pit2 = pitTax(tax2)
        const tax3 = Math.max(0, base + prem + g3 - safeExpense - safeAllowance)
        const pit3 = pitTax(tax3)
        const netY1 = base - pit1
        const netY2 = base - pit2
        const netY3 = base - pit3 + g3

        // helper อัปเดตฟิลด์ของ director แบบ immutable ปลอดภัย
        const patchDirector = (patch: Partial<Director>) =>
          setData((s: any) => ({
            ...s,
            company: {
              ...s.company,
              directors: s.company.directors.map((x: Director) => (x.id === d.id ? { ...x, ...patch } : x)),
            },
          }))

        return (
          <Card key={d.id}>
            <details open={idx === 0}>
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <div className="text-l">
                  <span className="text-[#EBDCA6] font-medium">{d.name || `ผู้บริหาร ${idx + 1}`}</span>
                </div>
                <div className="text-xs text-[color:var(--ink-dim)] hover:text-gold">คลิกเพื่อดู/ซ่อน</div>
              </summary>

              {/* ฟอร์มกรอก */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* ชื่อ/ตำแหน่ง */}
                <div>
                  <div className="text-sm text-[color:var(--ink-dim)] mb-1">ชื่อ/ตำแหน่ง</div>
                  <input
                    className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                    value={d.name ?? ''}
                    onChange={e => patchDirector({ name: e.target.value })}
                    placeholder="เช่น กรรมการผู้จัดการ"
                  />
                </div>

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
                        onChange={() => patchDirector({ sex: 'male' })}
                      />
                      <span>ชาย</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`sex-${d.id}`}
                        className="accent-gold"
                        checked={sex === 'female'}
                        onChange={() => patchDirector({ sex: 'female' })}
                      />
                      <span>หญิง</span>
                    </label>
                  </div>
                </div>

                {/* อายุ (draft) */}
                <div>
                  <div className="text-sm text-[color:var(--ink-dim)] mb-1">อายุ</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ageDraft[d.id] ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '')
                      setAgeDraft(s => ({ ...s, [d.id]: raw }))
                    }}
                    onBlur={() => {
                      const raw = (ageDraft[d.id] ?? '').replace(/[^\d]/g, '')
                      if (raw === '') {
                        patchDirector({ age: undefined })
                        return
                      }
                      let n = Math.floor(Number(raw))
                      if (!Number.isNaN(n)) {
                        n = Math.max(1, Math.min(80, n))
                        patchDirector({ age: n })
                        setAgeDraft(s => ({ ...s, [d.id]: String(n) }))
                      }
                    }}
                    placeholder="เช่น 35"
                    className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                  />
                </div>

                {/* เงินได้ 40(1) */}
                <div>
                  <div className="text-sm text-[color:var(--ink-dim)] mb-1">เงินได้ ม.40(1) (บาท/ปี)</div>
                  <NumberInput
                    value={emptyIfZero(d.annualSalary as any)}
                    onChange={(v) => patchDirector({ annualSalary: v ?? null })}
                    placeholder="เช่น 1,200,000"
                  />
                </div>
              </div>

              {/* ตัวเลขกรมธรรม์ */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[color:var(--ink-dim)] mb-1">ทุนประกันชีวิต (บาท)</div>
                  <NumberInput
                    value={sumAssured}
                    onChange={(v) => patchDirector({ sumAssured: v ?? 0 })}
                    placeholder="เช่น 10,000,000"
                  />
                </div>
                <div>
                  <div className="text-sm text-[color:var(--ink-dim)] mb-1">เบี้ยประกัน (บาท/ปี)</div>
                  <NumberInput
                    value={yearlyPremium}
                    onChange={(v) => patchDirector({ personalInsurancePremium: v ?? 0 })}
                    placeholder="เช่น 200,000"
                  />
                </div>
              </div>

              {/* มูลค่ารับซื้อคืน */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {([
                  ['มูลค่ารับซื้อคืน ปีที่ 7', 'surrenderY7', surrY7],
                  ['มูลค่ารับซื้อคืน เมื่ออายุ 60 ปี', 'surrenderAge60', surrAge60],
                  ['มูลค่ารับซื้อคืน เมื่ออายุ 70 ปี', 'surrenderAge70', surrAge70],
                  ['มูลค่ารับซื้อคืน เมื่ออายุ 99 ปี', 'surrenderAge99', surrAge99],
                ] as const).map(([label, key, val]) => (
                  <div key={key}>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">{label}</div>
                    <NumberInput
                      value={val}
                      onChange={(v) => patchDirector({ [key]: v ?? undefined } as Partial<Director>)}
                      placeholder="*กรอกข้อมูลจากแอปฯ"
                    />
                  </div>
                ))}
              </div>

              {/* Preview PIT */}
              <div className="mt-4 text-[13px] text-[color:var(--ink-dim)]">
                *กรอกข้อมูลที่ได้จากแอปพลิเคชั่นของแต่ละบริษัทประกันฯ เพื่อแสดงข้อมูลในตารางสรุปภาพรวมด้านล่าง
              </div>
              <div className="mt-4 text-xs text-[color:var(--ink-dim)]">
                พรีวิว ภ.ง.ด.91: เงินสุทธิ/ปี ก่อนฯ {fmt2(netY1)} • หลังฯมีเบี้ย {fmt2(netY2)} • หลังฯมีเบี้ย+ภาษีแทน {fmt2(netY3)}
              </div>

              {/* บรรทัดแสดงผลของ 3 ฟิลด์ string */}
              <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 text-[#EBDCA6]">
                {recProductName || '-'} / ชำระเบี้ย {recPayYears || '-'} / คุ้มครอง {recCoverage || '-'}
              </div>
            </details>
          </Card>
        )
      })}
    </section>
  )
}
