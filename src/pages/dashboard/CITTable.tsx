import React from 'react'
import Num from '../../components/Num'

type Props = {
  taxYear?: number
  income: number
  totalPremium: number
  totalGrossUp: number
  expense: number
  interest: number
  pbt_before: number
  pbt_afterPrem: number
  pbt_afterPremGross: number
  cit_before: number
  cit_afterPrem: number
  cit_afterPremGross: number
  disallow_base: number
  disallow_afterPrem_display: number
  disallow_afterPremGross_display: number
  trueTax_before: number
  CIT_RATE: number
}

export default function CITTable(p: Props) {
  return (
    <section id="cit-table-sec" className="mt-4">
      <h3 className="text-base md:text-lg font-semibold text-[#EBDCA6]">ภ.ง.ด.50 ของนิติบุคคล</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table">
          <thead className="text-[color:var(--ink-dim)]">
            <tr>
              <th className="py-2 pr-3 text-left">รายการ (ภ.ง.ด.50){p.taxYear ? ` — ปีภาษี ${p.taxYear}` : ''}</th>
              <th className="py-2 pr-3 text-right">ก่อนเข้าร่วมโครงการฯ</th>
              <th className="py-2 pr-3 text-right">หลังฯ: มีเบี้ย</th>
              <th className="py-2 pr-3 text-right">หลังฯ: เบี้ย + ภาษีออกแทน</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr><td className="py-2 pr-3 text-left">รายได้รวม (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={p.income} /></td><td className="py-2 pr-3 text-right"><Num v={p.income} /></td><td className="py-2 pr-3 text-right"><Num v={p.income} /></td></tr>
            <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">เบี้ยประกันฯกรมธรรม์นิติบุคคล (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={-p.totalPremium} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={-p.totalPremium} forceNeg /></td></tr>
            <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">ค่าภาษีออกแทนทุกทอด (ภ.ง.ด.50(1)) (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={0} /></td><td className="py-2 pr-3 text-right"><Num v={-p.totalGrossUp} forceNeg /></td></tr>
            <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">รายจ่ายรวม (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={p.expense} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={p.expense} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={p.expense} forceNeg /></td></tr>
            <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">ดอกเบี้ยจ่าย (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={-p.interest} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={-p.interest} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={-p.interest} forceNeg /></td></tr>
            <tr><td className="py-2 pr-3 text-left">กำไรก่อนภาษี (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={p.pbt_before} /></td><td className="py-2 pr-3 text-right"><Num v={p.pbt_afterPrem} /></td><td className="py-2 pr-3 text-right"><Num v={p.pbt_afterPremGross} /></td></tr>
            <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">เสียภาษีนิติบุคคล (บาท/ปี) ฐาน 20%</td><td className="py-2 pr-3 text-right"><Num v={p.cit_before} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={p.cit_afterPrem} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={p.cit_afterPremGross} forceNeg /></td></tr>
            <tr><td className="py-2 pr-3 text-left">บวกกลับค่าใช้จ่ายต้องห้าม (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={p.disallow_base} /></td><td className="py-2 pr-3 text-right"><Num v={p.disallow_afterPrem_display} /></td><td className="py-2 pr-3 text-right"><Num v={p.disallow_afterPremGross_display} /></td></tr>
            <tr className="text-[#FF7B7B]"><td className="py-2 pr-3 text-left">ภาษีจากส่วนที่บวกกลับ ฐาน 20%</td><td className="py-2 pr-3 text-right"><Num v={(p.disallow_base) * p.CIT_RATE} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={(p.disallow_afterPrem_display) * p.CIT_RATE} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={(p.disallow_afterPremGross_display) * p.CIT_RATE} forceNeg /></td></tr>
            <tr className="text-[#FF7B7B] font-bold"><td className="py-2 pr-3 text-left">ภาษีเงินได้ที่เสียจริง (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={p.trueTax_before} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={p.cit_afterPrem + (p.disallow_afterPrem_display * p.CIT_RATE)} forceNeg /></td><td className="py-2 pr-3 text-right"><Num v={p.cit_afterPremGross + (p.disallow_afterPremGross_display * p.CIT_RATE)} forceNeg /></td></tr>
            <tr className="text-gold font-bold"><td className="py-2 pr-3 text-left">ภาษีที่ลดลง</td><td className="py-2 pr-3 text-right">-</td><td className="py-2 pr-3 text-right"><Num v={Math.max(0, p.trueTax_before - (p.cit_afterPrem + (p.disallow_afterPrem_display * p.CIT_RATE)))} /></td><td className="py-2 pr-3 text-right"><Num v={Math.max(0, p.trueTax_before - (p.cit_afterPremGross + (p.disallow_afterPremGross_display * p.CIT_RATE)))} /></td></tr>
            <tr className="text-gold font-bold"><td className="py-2 pr-3 text-left">% ที่ลดลง</td><td className="py-2 pr-3 text-right">-</td>
              <td className="py-2 pr-3 text-right"><span className="block text-right">
                {p.trueTax_before > 0 ? (Math.max(0, p.trueTax_before - (p.cit_afterPrem + (p.disallow_afterPrem_display * p.CIT_RATE))) / p.trueTax_before * 100).toFixed(2) + '%' : '-'}
              </span></td>
              <td className="py-2 pr-3 text-right"><span className="block text-right">
                {p.trueTax_before > 0 ? (Math.max(0, p.trueTax_before - (p.cit_afterPremGross + (p.disallow_afterPremGross_display * p.CIT_RATE))) / p.trueTax_before * 100).toFixed(2) + '%' : '-'}
              </span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[color:var(--ink-dim)]">
        หมายเหตุ: “บวกกลับค่าใช้จ่ายต้องห้าม” อนุมานจากภาษีเงินได้ที่เสียจริง แล้วลดลงตามส่วนที่เปลี่ยนจากค่าใช้จ่ายต้องห้าม → ค่าใช้จ่ายหักได้ (เบี้ย/ภาษีออกแทน)
      </p>
    </section>
  )
}
