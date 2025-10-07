import React from 'react'
import Card from '../../components/Card'
import NumberInput from '../../components/NumberInput'
import { pitTax, marginalRate, progressiveGrossUp } from '../../lib/tax'
import { emptyIfZero, fmt2 } from '../../components/Num'

type Sex = 'male' | 'female'

type Props = {
  directors: any[]
  limit: number
  setData: React.Dispatch<React.SetStateAction<any>>
  personalExpense: number
  personalAllowance: number
  recProductName: string
  recPayYears: string
  recCoverage: string
  setRecFields: (p: Partial<{ recProductName: string; recPayYears: string; recCoverage: string }>) => void
}

const getSex = (d: any): Sex => (d.sex === 'female' ? 'female' : 'male')
const getAge = (d: any): number => (typeof d.age === 'number' ? d.age : 35)
const getSumAssured = (d: any): number => (typeof d.sumAssured === 'number' ? d.sumAssured : 10_000_000)
const getPremium = (d: any): number => (typeof d.personalInsurancePremium === 'number' ? d.personalInsurancePremium : 200_000)
const getSurr = (d: any, key: string): number | undefined => (typeof d[key] === 'number' ? d[key] : undefined)

export default function DirectorsSection({
  directors, limit, setData, personalExpense, personalAllowance,
  recProductName, recPayYears, recCoverage, setRecFields
}: Props) {
  // อายุแบบ draft ต่อคน (ใน section นี้เท่านั้น)
  const [ageDraft, setAgeDraft] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    setAgeDraft(prev => {
      const next = { ...prev }
      directors.forEach(d => {
        if (next[d.id] === undefined) {
          next[d.id] = d.age != null ? String(d.age) : ''
        }
      })
      Object.keys(next).forEach(id => {
        if (!directors.find(d => d.id === id)) delete next[id]
      })
      return next
    })
  }, [directors])

  const addDirector = () =>
    directors.length < limit &&
    setData((s: any) => ({
      ...s,
      company: {
        ...s.company,
        directors: [
          ...s.company.directors,
          { id: String(Date.now()), name: `ผู้บริหาร ${s.company.directors.length + 1}`, annualSalary: undefined as any, personalInsurancePremium: undefined as any }
        ]
      }
    }))

  const removeLast = () =>
    setData((s: any) => ({ ...s, company: { ...s.company, directors: s.company.directors.slice(0, -1) } }))

  return (
    <section id="directors-sec" className="space-y-4">
      {/* ฟิลด์ “แบบประกันฯ แนะนำ” — กำหนดครั้งเดียว ใช้กับทุกกรรมการ */}
      <Card title="แบบประกันฯ แนะนำ (ใช้กับทุกกรรมการ)">
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
        <div className="text-xs text-[color:var(--ink-dim)] mt-2">* ทั้ง 3 ฟิลด์เก็บเป็น string เพื่อรองรับหลายบริษัทประกัน</div>
      </Card>

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
          disabled={directors.length >= limit}
          title={directors.length < limit ? 'เพิ่มผู้บริหาร' : `ครบสูงสุด ${limit} คนแล้ว`}
        >
          + เพิ่ม (สูงสุด {limit})
        </button>
      </div>

      {directors.length === 0 && (
        <Card title="ยังไม่มีรายชื่อกรรมการ">
          <div className="text-sm text-[color:var(--ink-dim)]">โปรดเพิ่มรายชื่อกรรมการในส่วนนี้ แล้วกำหนดรายละเอียดรายคน</div>
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

        // PIT trio preview
        const base = d.annualSalary ?? 0
        const prem = d.personalInsurancePremium ?? 0
        const g3 = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
        const tax1 = Math.max(0, base - personalExpense - personalAllowance)
        const pit1 = pitTax(tax1)
        const tax2 = Math.max(0, base + prem - personalExpense - personalAllowance)
        const pit2 = pitTax(tax2)
        const tax3 = Math.max(0, base + prem + g3 - personalExpense - personalAllowance)
        const pit3 = pitTax(tax3)
        const netY1 = base - pit1
        const netY2 = base - pit2
        const netY3 = base - pit3 + g3

        return (
          <Card key={d.id}>
            <details open={idx === 0}>
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <div className="text-l">
                  <span className="text-[#EBDCA6] font-medium">{d.name || `ผู้บริหาร ${idx + 1}`}</span>
                </div>
                <div className="text-xs text-[color:var(--ink-dim)]">คลิกเพื่อดู/ซ่อน</div>
              </summary>

              {/* ฟอร์มกรอก */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* ชื่อ/ตำแหน่ง */}
                <div>
                  <div className="text-sm text-[color:var(--ink-dim)] mb-1">ชื่อ/ตำแหน่ง</div>
                  <input
                    className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                    value={d.name}
                    onChange={e => setData((s: any) => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map((x: any) => x.id === d.id ? { ...x, name: e.target.value } : x) }
                    }))}
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
                        onChange={() => setData((s: any) => ({
                          ...s, company: { ...s.company, directors: s.company.directors.map((x: any) => x.id === d.id ? { ...x, sex: 'male' } : x) }
                        }))}
                      />
                      <span>ชาย</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`sex-${d.id}`}
                        className="accent-gold"
                        checked={sex === 'female'}
                        onChange={() => setData((s: any) => ({
                          ...s, company: { ...s.company, directors: s.company.directors.map((x: any) => x.id === d.id ? { ...x, sex: 'female' } : x) }
                        }))}
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
                        setData((s: any) => ({
                          ...s,
                          company: {
                            ...s.company,
                            directors: s.company.directors.map((x: any) =>
                              x.id === d.id ? { ...x, age: undefined as any } : x
                            )
                          }
                        }))
                        return
                      }
                      let n = Math.floor(Number(raw))
                      if (!Number.isNaN(n)) {
                        n = Math.max(1, Math.min(80, n))
                        setData((s: any) => ({
                          ...s,
                          company: {
                            ...s.company,
                            directors: s.company.directors.map((x: any) =>
                              x.id === d.id ? { ...x, age: n } : x
                            )
                          }
                        }))
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
                    value={emptyIfZero(d.annualSalary)}
                    onChange={v => setData((s: any) => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map((x: any) => x.id === d.id ? { ...x, annualSalary: v } : x) }
                    }))}
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
                    onChange={(v) => setData((s: any) => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map((x: any) => x.id === d.id ? { ...x, sumAssured: v ?? 0 } : x) }
                    }))}
                    placeholder="เช่น 10,000,000"
                  />
                </div>
                <div>
                  <div className="text-sm text-[color:var(--ink-dim)] mb-1">เบี้ยประกัน (บาท/ปี)</div>
                  <NumberInput
                    value={yearlyPremium}
                    onChange={(v) => setData((s: any) => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map((x: any) => x.id === d.id ? { ...x, personalInsurancePremium: v ?? 0 } : x) }
                    }))}
                    placeholder="เช่น 200,000"
                  />
                </div>
              </div>

              {/* มูลค่ารับซื้อคืน */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  ['มูลค่ารับซื้อคืน ปีที่ 7', 'surrenderY7', surrY7],
                  ['มูลค่ารับซื้อคืน เมื่ออายุ 60 ปี', 'surrenderAge60', surrAge60],
                  ['มูลค่ารับซื้อคืน เมื่ออายุ 70 ปี', 'surrenderAge70', surrAge70],
                  ['มูลค่ารับซื้อคืน เมื่ออายุ 99 ปี', 'surrenderAge99', surrAge99],
                ].map(([label, key, val]) => (
                  <div key={key as string}>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">{label}</div>
                    <NumberInput
                      value={val as number | undefined}
                      onChange={(v) => setData((s: any) => ({
                        ...s,
                        company: { ...s.company, directors: s.company.directors.map((x: any) => x.id === d.id ? { ...x, [key as string]: v ?? undefined } : x) }
                      }))}
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
