// src/pages/RecommendedPlans.tsx
import React from 'react'
import Card from '../components/Card'
import NumberInput from '../components/NumberInput'
import { load, save } from '../lib/storage'
import { initialState } from '../lib/state'
import type { AppState } from '../lib/types'
import { useDebounceEffect } from '../lib/useDebounceEffect'

type Sex = 'male' | 'female'

const fmt = (n?: number) =>
  n === undefined || Number.isNaN(n)
    ? '-'
    : n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export default function RecommendedPlans() {
  // ใช้ AppState เดียวกับ Engine เพื่อ sync อัตโนมัติ
  const [data, setData] = React.useState<AppState>(() => load<AppState>(initialState))
  useDebounceEffect(() => save(data), [data], 400)

  const ds = data.company.directors
  const productName = 'My Style Legacy Ultra (Unitlinked)'
  const payYears = 7 // ✅ ค่าคงที่: ชำระเบี้ย 7 ปี เท่านั้น

  const updateDirector = (id: string, patch: Record<string, any>) => {
    setData(s => ({
      ...s,
      company: {
        ...s.company,
        directors: s.company.directors.map(d => (d.id === id ? { ...d, ...patch } : d)),
      },
    }))
  }

  // helpers
  const getSex = (d: any): Sex => (d.sex === 'female' ? 'female' : 'male')
  const getAge = (d: any): number => (typeof d.age === 'number' ? d.age : 35)
  const getSumAssured = (d: any): number => (typeof d.sumAssured === 'number' ? d.sumAssured : 10_000_000)
  const getPremium = (d: any): number => (typeof d.personalInsurancePremium === 'number' ? d.personalInsurancePremium : 200_000)
  const getSurr = (d: any, key: string): number | undefined =>
    typeof d[key] === 'number' ? d[key] : undefined

  const emptyState = ds.length === 0

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-xl font-semibold text-gold mb-6">แผนกรมธรรม์แนะนำ</h2>

      {/* ห่อส่วนหลักทั้งหมดด้วย space-y-6 เพื่อจัดระยะห่างระหว่างการ์ด */}
      <div className="space-y-6">
        {/* แบบประกันฯ (fixed) */}
        <Card title="แบบประกันฯ">
          <div className="grid grid-cols-1 gap-2 mb-3">
            <div className="text-base md:text-lg font-semibold text-gold">
              {productName}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* ชำระเบี้ย — แสดงเฉพาะ 7 ปี แบบอ่านอย่างเดียว */}
            <div>
              <div className="text-sm text-[color:var(--ink-dim)]">ชำระเบี้ย</div>
              <div className="mt-1 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
                {payYears} ปี
              </div>
            </div>

            {/* คุ้มครองถึง */}
            <div>
              <div className="text-sm text-[color:var(--ink-dim)]">คุ้มครองถึง</div>
              <div className="mt-1 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
                อายุ 99 ปี
              </div>
            </div>

            {/* ทุนประกันชีวิต (default) */}
            <div>
              <div className="text-sm text-[color:var(--ink-dim)]">ทุนประกันชีวิต (ขั้นต่ำ)</div>
              <div className="mt-1 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
                10,000,000 บาท
              </div>
            </div>
          </div>

          <div className="text-xs text-[color:var(--ink-dim)] mt-4">
            * หน้านี้กำหนด “ทุน/เบี้ย/มูลค่ารับซื้อคืน” รายกรรมการ และซิงค์ไป Engine อัตโนมัติ
          </div>
        </Card>

        {/* กรณีไม่มีกรรมการ */}
        {emptyState && (
          <Card title="ยังไม่มีรายชื่อกรรมการ">
            <div className="text-sm text-[color:var(--ink-dim)]">
              โปรดเพิ่มรายชื่อกรรมการในหน้า <span className="text-gold">Engine</span> ก่อน แล้วกลับมาหน้านี้เพื่อกำหนดรายละเอียดรายคน
            </div>
            <a href="/" className="inline-block mt-3 text-xs px-3 py-1 rounded ring-1 ring-gold/50 hover:bg-gold/10">
              ไปเพิ่มกรรมการใน Engine
            </a>
          </Card>
        )}

        {/* Accordion รายกรรมการ */}
        {!emptyState && (
          <section className="space-y-4">
            {ds.map((d, idx) => {
              const sex = getSex(d)
              const age = getAge(d)
              const sumAssured = getSumAssured(d)
              const yearlyPremium = getPremium(d)

              const surrY7 = getSurr(d, 'surrenderY7')
              const surrAge60 = getSurr(d, 'surrenderAge60')
              const surrAge70 = getSurr(d, 'surrenderAge70')
              const surrAge99 = getSurr(d, 'surrenderAge99')

              return (
                <details key={d.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4" open={idx === 0}>
                  <summary className="flex items-center justify-between cursor-pointer select-none">
                    <div className="text-sm">
                      <span className="text-[color:var(--ink-dim)]">กรรมการ:</span>{' '}
                      <span className="text-[color:var(--ink)] font-medium">{d.name || `ผู้บริหาร ${idx + 1}`}</span>
                    </div>
                    <div className="text-xs text-[color:var(--ink-dim)]">คลิกเพื่อดู/ซ่อน</div>
                  </summary>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            onChange={() => updateDirector(d.id, { sex: 'male' })}
                          />
                          <span>ชาย</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`sex-${d.id}`}
                            className="accent-gold"
                            checked={sex === 'female'}
                            onChange={() => updateDirector(d.id, { sex: 'female' })}
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
                          updateDirector(d.id, { age: v })
                        }}
                        className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                        placeholder="เช่น 35"
                      />
                    </div>

                    {/* ทุนประกันชีวิต */}
                    <div>
                      <div className="text-sm text-[color:var(--ink-dim)] mb-1">ทุนประกันชีวิต (บาท)</div>
                      <NumberInput
                        value={sumAssured}
                        onChange={(v) => updateDirector(d.id, { sumAssured: v ?? 0 })}
                        placeholder="เช่น 10,000,000"
                      />
                    </div>

                    {/* เบี้ยประกัน/ปี */}
                    <div>
                      <div className="text-sm text-[color:var(--ink-dim)] mb-1">เบี้ยประกัน (บาท/ปี)</div>
                      <NumberInput
                        value={yearlyPremium}
                        onChange={(v) => updateDirector(d.id, { personalInsurancePremium: v ?? 0 })}
                        placeholder="เช่น 200,000"
                      />
                    </div>
                  </div>

                  {/* มูลค่ารับซื้อคืนหน่วยลงทุน */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืน ปีที่ 7</div>
                      <NumberInput value={surrY7} onChange={(v) => updateDirector(d.id, { surrenderY7: v ?? undefined })} />
                    </div>
                    <div>
                      <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืน เมื่ออายุ 60 ปี</div>
                      <NumberInput value={surrAge60} onChange={(v) => updateDirector(d.id, { surrenderAge60: v ?? undefined })} />
                    </div>
                    <div>
                      <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืน เมื่ออายุ 70 ปี</div>
                      <NumberInput value={surrAge70} onChange={(v) => updateDirector(d.id, { surrenderAge70: v ?? undefined })} />
                    </div>
                    <div>
                      <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืนเมื่อสัญญาอายุ 99 ปี</div>
                      <NumberInput value={surrAge99} onChange={(v) => updateDirector(d.id, { surrenderAge99: v ?? undefined })} />
                    </div>
                  </div>
                </details>
              )
            })}
          </section>
        )}

        {/* ตารางรวม */}
        {!emptyState && (
          <Card title="ภาพรวมทุน & เบี้ย (ทุกกรรมการ) • สมมุติผลตอบแทนจากการลงทุนที่ 5%">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table">
                <thead className="text-[color:var(--ink-dim)]">
                  <tr>
                    <th className="py-2 pr-3 text-left">ผู้บริหาร</th>
                    <th className="py-2 pr-3 text-right">ทุนประกันชีวิต<br/>ถึงอายุ 99 ปี</th>
                    <th className="py-2 pr-3 text-right">เบี้ย/ปี<br/>ปีที่ 1</th>
                    <th className="py-2 pr-3 text-right">เบี้ยตลอดสัญญา<br/>ครบปีที่ 7</th>
                    <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>ปีที่ 7</th>
                    <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>เมื่ออายุ 60 ปี</th>
                    <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>เมื่ออายุ 70 ปี</th>
                    <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>เมื่ออายุ 99 ปี</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {ds.map(d => {
                    const sumAssured = getSumAssured(d)
                    const yearlyPremium = getPremium(d)
                    const accum7 = (yearlyPremium || 0) * 7
                    return (
                      <tr key={d.id}>
                        <td className="py-2 pr-3 text-left">{d.name || '-'}</td>
                        <td className="py-2 pr-3 text-right">{fmt(sumAssured)}</td>
                        <td className="py-2 pr-3 text-right">{fmt(yearlyPremium)}</td>
                        <td className="py-2 pr-3 text-right">{fmt(accum7)}</td>
                        <td className="py-2 pr-3 text-right">{fmt(d.surrenderY7)}</td>
                        <td className="py-2 pr-3 text-right">{fmt(d.surrenderAge60)}</td>
                        <td className="py-2 pr-3 text-right">{fmt(d.surrenderAge70)}</td>
                        <td className="py-2 pr-3 text-right">{fmt(d.surrenderAge99)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-[color:var(--ink-dim)] mt-4">
              * ตัวอย่างที่แสดงข้างต้นคำนวณจากอัตราผลตอบแทนสมมติโดยเฉลี่ยต่อปี 5% จาก แอปพลิเคชั่น AZD
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
