import React from 'react'
import { pitTax, marginalRate, progressiveGrossUp } from '../../lib/tax'
import Num from '../../components/Num'

type Props = {
  directors: any[]
  personalExpense: number
  personalAllowance: number
}

export default function PITSection({ directors, personalExpense, personalAllowance }: Props) {
  if (directors.length === 0) return null
  return (
    <section className="mt-6">
      <h3 className="text-base md:text-lg font-semibold text-[#EBDCA6]">ภ.ง.ด.91 สำหรับผู้บริหารรายบุคคล</h3>
      <div className="space-y-4">
        {directors.map((it, idx) => {
          const base = it.annualSalary ?? 0
          const prem = it.personalInsurancePremium ?? 0
          const tax1 = Math.max(0, base - personalExpense - personalAllowance)
          const pit1 = pitTax(tax1)
          const tax2 = Math.max(0, base + prem - personalExpense - personalAllowance)
          const pit2 = pitTax(tax2)
          const g3 = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
          const tax3 = Math.max(0, base + prem + g3 - personalExpense - personalAllowance)
          const pit3 = pitTax(tax3)
          const netY1 = base - pit1
          const netY2 = base - pit2
          const netY3 = base - pit3 + g3

          return (
            <details key={it.id} className="rounded-xl bg-gradient-to-b from-[#142440]/80 to-[#0B1529]/80 ring-1 ring-[#D4AF37]/20 p-3" open={idx === 0}>
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <div className="text-sm">
                  <span className="text-[#EBDCA6] font-medium">{it.name || `ผู้บริหาร ${idx + 1}`}</span>
                </div>
                <div className="text-xs text-[color:var(--ink-dim)]">คลิกเพื่อดู/ซ่อนรายละเอียด</div>
              </summary>

              <div className="overflow-x-auto mt-3">
                <table className="min-w-full text-sm table">
                  <thead className="text-[color:var(--ink-dim)]">
                    <tr>
                      <th className="py-2 pr-3 text-left">รายการ (ภ.ง.ด.91)</th>
                      <th className="py-2 pr-3 text-right">ก่อนเข้าร่วมโครงการฯ</th>
                      <th className="py-2 pr-3 text-right">หลังฯ มีค่าเบี้ยประกันชีวิต</th>
                      <th className="py-2 pr-3 text-right">หลังฯ มีค่าเบี้ย + ค่าภาษีสุดท้าย</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr><td className="py-2 pr-3 text-left">เงินได้พึงประเมิน ม.40(1) (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={base} /></td><td className="py-2 pr-3 text-right"><Num v={base} /></td><td className="py-2 pr-3 text-right"><Num v={base} /></td></tr>
                    <tr><td className="py-2 pr-3 text-left">ค่าเบี้ยประกันฯ (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={prem} /></td><td className="py-2 pr-3 text-right"><Num v={prem} /></td></tr>
                    <tr><td className="py-2 pr-3 text-left">ค่าภาษีออกแทนทุกทอด (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={g3} /></td></tr>
                    <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">หัก ค่าใช้จ่ายส่วนตัว (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={-100000} /></td><td className="py-2 pr-3 text-right"><Num v={-100000} /></td><td className="py-2 pr-3 text-right"><Num v={-100000} /></td></tr>
                    <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">หัก ค่าลดหย่อนส่วนตัว (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={-160000} /></td><td className="py-2 pr-3 text-right"><Num v={-160000} /></td><td className="py-2 pr-3 text-right"><Num v={-160000} /></td></tr>
                    <tr><td className="py-2 pr-3 text-left">เงินได้สุทธิ (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={tax1} /></td><td className="py-2 pr-3 text-right"><Num v={tax2} /></td><td className="py-2 pr-3 text-right"><Num v={tax3} /></td></tr>
                    <tr><td className="py-2 pr-3 text-left">ฐานภาษี</td><td className="py-2 pr-3 text-right"><span className="block text-right">{(marginalRate(tax1) * 100).toFixed(0)}%</span></td><td className="py-2 pr-3 text-right"><span className="block text-right">{(marginalRate(tax2) * 100).toFixed(0)}%</span></td><td className="py-2 pr-3 text-right"><span className="block text-right">{(marginalRate(tax3) * 100).toFixed(0)}%</span></td></tr>
                    <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">ภาษีบุคคลฯ (PIT) (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={pit1} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={pit2} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={pit3} forceNeg /></td></tr>
                    <tr className="text-gold font-bold"><td className="py-2 pr-3 text-left">เงินสุทธิกรรมการ (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={netY1} /></td><td className="py-2 pr-3 text-right"><Num v={netY2} /></td><td className="py-2 pr-3 text-right"><Num v={netY3} /></td></tr>
                    <tr><td className="py-2 pr-3 text-left">เงินได้ (บาท/เดือน)</td><td className="py-2 pr-3 text-right"><Num v={base / 12} /></td><td className="py-2 pr-3 text-right"><Num v={base / 12} /></td><td className="py-2 пр-3 text-right"><Num v={base / 12} /></td></tr>
                    <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">ภ.ง.ด.1 (บาท/เดือน)</td><td className="py-2 pr-3 text-right"><Num v={pit1 / 12} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={pit2 / 12} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={pit3 / 12} forceNeg /></td></tr>
                    <tr><td className="py-2 pr-3 text-left">ภาษีออกแทนทุกทอด (บาท/เดือน)</td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={g3 / 12} /></td></tr>
                    <tr className="text-gold font-bold"><td className="py-2 pr-3 text-left">เงินสุทธิกรรมการ (บาท/เดือน)</td><td className="py-2 pr-3 text-right"><Num v={(base / 12) - (pit1 / 12)} /></td><td className="py-2 pr-3 text-right"><Num v={(base / 12) - (pit2 / 12)} /></td><td className="py-2 pr-3 text-right"><Num v={(base / 12) - ((pit3 / 12) - (g3 / 12))} /></td></tr>
                  </tbody>
                </table>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
