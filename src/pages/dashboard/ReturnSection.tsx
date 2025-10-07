import React from 'react'
import Card from '../../components/Card'
import { fmt0 } from '../../components/Num'

const getSumAssured = (d: any): number => (typeof d.sumAssured === 'number' ? d.sumAssured : 10_000_000)
const getPremium = (d: any): number => (typeof d.personalInsurancePremium === 'number' ? d.personalInsurancePremium : 200_000)

export default function ReturnSection({ directors }: { directors: any[] }) {
  if (directors.length === 0) return null
  return (
    <section id="return-sec">
      <Card title="ภาพรวมทุน & เบี้ย (ทุกกรรมการ) • สมมุติผลตอบแทนจากการลงทุนที่ 5%">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table">
            <thead className="text-[color:var(--ink-dim)]">
              <tr>
                <th className="py-2 pr-3 text-left">ผู้บริหาร</th>
                <th className="py-2 pr-3 text-right">ทุนประกันชีวิต<br/>ถึงอายุ 99 ปี</th>
                <th className="py-2 pr-3 text-right">เบี้ย/ปี<br/>ปีที่ 1</th>
                <th className="py-2 pr-3 text-right">เบี้ยสะสม<br/>ครบปีที่ 7</th>
                <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>ปีที่ 7</th>
                <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>เมื่ออายุ 60 ปี</th>
                <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>เมื่ออายุ 70 ปี</th>
                <th className="py-2 pr-3 text-right">มูลค่ารับซื้อคืน<br/>เมื่ออายุ 99 ปี</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {directors.map((d: any) => {
                const sumAssured = getSumAssured(d)
                const yearlyPremium = getPremium(d)
                const accum7 = (yearlyPremium || 0) * 7
                return (
                  <tr key={d.id}>
                    <td className="py-2 pr-3 text-left">{d.name || '-'}</td>
                    <td className="py-2 pr-3 text-right">{fmt0(sumAssured)}</td>
                    <td className="py-2 pr-3 text-right">{fmt0(yearlyPremium)}</td>
                    <td className="py-2 pr-3 text-right">{fmt0(accum7)}</td>
                    <td className="py-2 pr-3 text-right">{fmt0(d.surrenderY7)}</td>
                    <td className="py-2 pr-3 text-right">{fmt0(d.surrenderAge60)}</td>
                    <td className="py-2 pr-3 text-right">{fmt0(d.surrenderAge70)}</td>
                    <td className="py-2 pr-3 text-right">{fmt0(d.surrenderAge99)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-[color:var(--ink-dim)] mt-4">
          * ตัวอย่างที่แสดงคำนวณจากอัตราผลตอบแทนสมมติโดยเฉลี่ยต่อปี 5% จากแอป AZD
        </div>
      </Card>
    </section>
  )
}
