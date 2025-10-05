import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { load } from '../lib/storage'
import { initialState } from '../lib/state'
import type { AppState } from '../lib/types'
import { pitTax, marginalRate, progressiveGrossUp } from '../lib/tax'
import { RULINGS } from '../data/rulings'
import ExportPDF from '../components/ExportPDF'
import { useAuth } from '../lib/auth'
import { isUltra } from '../lib/roles'
import { toast } from '../lib/toast'

function Num({ v, forceNeg }: { v?: number; forceNeg?: boolean }) {
  if (v === undefined || Number.isNaN(v)) return <span className="block text-right">-</span>
  const neg = forceNeg === true || (v as number) < 0
  const absVal = Math.abs(v as number)
  const txt = absVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return <span className={['block text-right tabular-nums', neg ? 'text-[#FF7B7B]' : ''].join(' ')}>{neg ? '-' : ''}{txt}</span>
}
const fmt = (n?: number) =>
  n === undefined || Number.isNaN(n) ? '-' : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ProposalBuilder() {
  // ✅ Ultra เท่านั้น
  const { user } = useAuth()
  const navigate = useNavigate()
  const allow = !!user && isUltra(user.plan)
  React.useEffect(() => {
    if (!allow) {
      toast('ฟีเจอร์ “Proposal” ใช้ได้เฉพาะแผน Ultra')
      navigate('/pricing', { replace: true })
    }
  }, [allow, navigate])
  if (!allow) return null

  const data = React.useMemo<AppState>(() => load<AppState>(initialState), [])
  const c = data.company
  const ds = c.directors

  // Inputs
  const income = c.companyIncome ?? 0
  const expense = c.companyExpense ?? 0
  const interest = (c as any).interestExpense ?? 0
  const actualCIT = (c as any).actualCIT ?? 0
  const taxYear: number | undefined = (c as any).taxYear

  // Directors totals
  const personalExpense = 100000
  const personalAllowance = 160000

  const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0)
  const gus = ds.map(d => {
    const base = d.annualSalary ?? 0
    const prem = d.personalInsurancePremium ?? 0
    const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
    const taxable = Math.max(0, base + prem + g - (personalExpense + personalAllowance))
    const r = marginalRate(taxable)
    return { id: d.id, name: d.name, base, prem, g, rate: r }
  })
  const totalGrossUp = gus.reduce((s, g) => s + g.g, 0)

  // Corporate tax model
  const CIT_RATE = 0.20
  const pbt_before = income - expense - interest
  const pbt_afterPrem = income - totalPremium - expense - interest
  const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest

  const cit_before = Math.max(0, pbt_before) * CIT_RATE
  const cit_afterPrem = Math.max(0, pbt_afterPrem) * CIT_RATE
  const cit_afterPremGross = Math.max(0, pbt_afterPremGross) * CIT_RATE

  // Infer add-back (disallow) from actual tax
  const disallow_tax_before = Math.max(0, actualCIT - cit_before)
  const disallow_base = disallow_tax_before / CIT_RATE
  const disallow_afterPrem = Math.max(0, disallow_base - totalPremium)
  const disallow_afterPremGross = Math.max(0, disallow_base - totalPremium - totalGrossUp)
  const disallow_tax_afterPrem = disallow_afterPrem * CIT_RATE
  const disallow_tax_afterPremGross = disallow_afterPremGross * CIT_RATE

  // True tax by scenarios
  const trueTax_before = actualCIT
  const trueTax_afterPrem = cit_afterPrem + disallow_tax_afterPrem
  const trueTax_afterPremGross = cit_afterPremGross + disallow_tax_afterPremGross

  // Savings
  const taxSaved_afterPrem = Math.max(0, trueTax_before - trueTax_afterPrem)
  const taxSaved_afterPremGross = Math.max(0, trueTax_before - trueTax_afterPremGross)
  const taxSavedPct_afterPrem = trueTax_before > 0 ? (taxSaved_afterPrem / trueTax_before) * 100 : 0
  const taxSavedPct_afterPremGross = trueTax_before > 0 ? (taxSaved_afterPremGross / trueTax_before) * 100 : 0

  const combinedCost = totalPremium + totalGrossUp
  const otherCosts_before = expense + interest
  const otherCosts_afterPrem = expense + interest
  const otherCosts_afterPremGross = expense + interest

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gold">Proposal</h2>
          <div className="text-sm text-[color:var(--ink-dim)]">
            {taxYear ? `ปีภาษีอ้างอิง: ${taxYear}` : 'ปีภาษีอ้างอิง: -'}
          </div>
        </div>
        <ExportPDF state={data} />
      </div>

      {/* 1) ข้อมูลบริษัท */}
      <section className="grid gap-6">
        <Card title="ข้อมูลบริษัท (สรุป)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ชื่อบริษัท */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">ชื่อบริษัท</div>
              <div className="text-sm font-medium">{c.name || '-'}</div>
            </div>

            {/* กำไรก่อนภาษี */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">กำไรก่อนภาษี</div>
              <div className="text-sm font-medium text-right">{fmt(pbt_before)}</div>
            </div>

            {/* ภาษีงบจริง + ค่าบวกกลับ */}
            <div className="rounded-lg bg-white/5 p-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-[color:var(--ink-dim)]">ภาษีงบจริง</div>
                <div className="text-sm font-medium"><Num v={trueTax_before} /></div>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <div className="text-[10px] text-[color:var(--ink-dim)]">ค่าบวกกลับ (คาดคะเนจากงบจริง)</div>
                <div className="text-sm font-medium"><Num v={disallow_base} /></div>
              </div>
            </div>

            {/* กำไรก่อนภาษี (หลังฯ) */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">กำไรก่อนภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
              <div className="text-sm font-semibold text-right text-gold">{fmt(pbt_afterPremGross)}</div>
            </div>

            {/* ภาษี (หลังฯ) */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">ภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
              <div className="text-sm font-semibold text-right text-gold">{fmt(trueTax_afterPremGross)}</div>
            </div>

            {/* ภาษีลดลง (หลังฯ) */}
            <div className="rounded-lg bg-white/5 p-3 md:col-span-2">
              <div className="text-[10px] text-[color:var(--ink-dim)]">ภาษีลดลง (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
              <div className="text-sm font-semibold text-right text-gold">
                {fmt(taxSaved_afterPremGross)}{' '}
                <span className="text-[10px] text-gold/80">
                  ({trueTax_before > 0 ? taxSavedPct_afterPremGross.toFixed(2) : '0.00'}%)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2) รายจ่ายบริษัท */}
        <Card title="รายจ่ายบริษัท (แผนที่เสนอ)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">เบี้ยรวมทั้งหมด</div>
              <div className="text-sm font-medium text-right">{fmt(totalPremium)}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">ภาษีออกแทนทั้งหมด</div>
              <div className="text-sm font-medium text-right">{fmt(totalGrossUp)}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">เบี้ยรวม + ภาษีออกแทนทั้งหมด</div>
              <div className="text-sm font-medium text-right">{fmt(totalPremium + totalGrossUp)}</div>
            </div>
          </div>
        </Card>

        {/* 3) ตาราง ภ.ง.ด.50 (กระชับสำหรับ Proposal) */}
        <section id="cit-table-sec">
          <Card title={`ภ.ง.ด.50 ของบริษัทจำกัด${taxYear ? ` — ปีภาษี ${taxYear}` : ''}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table">
                <thead className="text-[color:var(--ink-dim)]">
                  <tr>
                    <th className="py-2 pr-3 text-left">รายการ (ภ.ง.ด.50)</th>
                    <th className="py-2 pr-3 text-right">ก่อนเข้าร่วมโครงการฯ</th>
                    <th className="py-2 pr-3 text-right">หลังฯ: มีเบี้ย</th>
                    <th className="py-2 pr-3 text-right">หลังฯ: เบี้ย + ภาษีออกแทน</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr><td className="py-2 pr-3 text-left">รายได้รวม (บาท/ปี)</td><td className="py-2 pr-3 text-right"><Num v={income} /></td><td className="py-2 pr-3 text-right"><Num v={income} /></td><td className="py-2 pr-3 text-right"><Num v={income} /></td></tr>

                  <tr className="text-[#FF7B7B]">
                    <td className="py-2 pr-3 text-left">เบี้ยประกันฯกรมธรรม์นิติบุคคล (บาท/ปี)</td>
                    <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={-totalPremium} forceNeg /></td>
                    <td className="py-2 pr-3 text-right"><Num v={-totalPremium} forceNeg /></td>
                  </tr>
                  <tr className="text-[#FF7B7B]">
                    <td className="py-2 pr-3 text-left">ค่าภาษีออกแทนทุกทอด (ภ.ง.ด.50(1)) (บาท/ปี)</td>
                    <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={-totalGrossUp} forceNeg /></td>
                  </tr>

                  {/* ✅ รวมรายจ่ายอื่นเป็นแถวเดียว เพื่อความกระชับ */}
                  <tr className="text-[#FF7B7B]">
                    <td className="py-2 pr-3 text-left">รายจ่ายอื่น (รวมค่าใช้จ่าย + ดอกเบี้ย)</td>
                    <td className="py-2 pr-3 text-right"><Num v={-(otherCosts_before)} forceNeg /></td>
                    <td className="py-2 pr-3 text-right"><Num v={-(otherCosts_afterPrem)} forceNeg /></td>
                    <td className="py-2 pr-3 text-right"><Num v={-(otherCosts_afterPremGross)} forceNeg /></td>
                  </tr>

                  <tr>
                    <td className="py-2 pr-3 text-left">กำไรก่อนภาษี (บาท/ปี)</td>
                    <td className="py-2 pr-3 text-right"><Num v={pbt_before} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={pbt_afterPrem} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={pbt_afterPremGross} /></td>
                  </tr>
                  <tr className="text-[#FF7B7B]">
                    <td className="py-2 pr-3 text-left">เสียภาษีนิติบุคคล (บาท/ปี) ฐาน 20%</td>
                    <td className="py-2 pr-3 text-right"><Num v={cit_before} forceNeg /></td>
                    <td className="py-2 pr-3 text-right"><Num v={cit_afterPrem} forceNeg /></td>
                    <td className="py-2 pr-3 text-right"><Num v={cit_afterPremGross} forceNeg /></td>
                  </tr>

                  {/* ✅ ตัดแถวรายละเอียด “บวกกลับ” ออก เพื่อความกะทัดรัด */}

                  <tr className="text-[#FF7B7B]">
                    <td className="py-2 pr-3 text-left">ภาษีเงินได้ที่เสียจริง (บาท/ปี)</td>
                    <td className="py-2 pr-3 text-right"><Num v={trueTax_before} forceNeg /></td>
                    <td className="py-2 pr-3 text-right"><Num v={trueTax_afterPrem} forceNeg /></td>
                    <td className="py-2 pr-3 text-right"><Num v={trueTax_afterPremGross} forceNeg /></td>
                  </tr>

                  <tr>
                    <td className="py-2 pr-3 text-left">กำไร(ขาดทุน) สุทธิ (บาท/ปี)</td>
                    <td className="py-2 pr-3 text-right"><Num v={pbt_before - trueTax_before} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={pbt_afterPrem - trueTax_afterPrem} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={pbt_afterPremGross - trueTax_afterPremGross} /></td>
                  </tr>

                  <tr className="text-gold font-bold">
                    <td className="py-2 pr-3 text-left">ภาษีที่ลดลง</td>
                    <td className="py-2 pr-3 text-right">-</td>
                    <td className="py-2 pr-3 text-right"><Num v={taxSaved_afterPrem} /></td>
                    <td className="py-2 pr-3 text-right"><Num v={taxSaved_afterPremGross} /></td>
                  </tr>
                  <tr className="text-gold font-bold">
                    <td className="py-2 pr-3 text-left">% ที่ลดลง</td>
                    <td className="py-2 pr-3 text-right">-</td>
                    <td className="py-2 pr-3 text-right"><span className="block text-right">{trueTax_before > 0 ? taxSavedPct_afterPrem.toFixed(2) + '%' : '-'}</span></td>
                    <td className="py-2 pr-3 text-right"><span className="block text-right">{trueTax_before > 0 ? taxSavedPct_afterPremGross.toFixed(2) + '%' : '-'}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-[color:var(--ink-dim)]">
              หมายเหตุ: รายจ่ายอื่น = ค่าใช้จ่ายรวม + ดอกเบี้ย (รวมเป็นแถวเดียวเพื่อความกระชับในการนำเสนอ)
            </p>
          </Card>
        </section>

        {/* 4) ตารางผู้บริหาร */}
        <Card title="ตารางผู้บริหาร (ผลกระทบภาษีรายบุคคล)">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm table">
              <thead className="text-[color:var(--ink-dim)]">
                <tr>
                  <th className="py-2 pr-3 text-left">ผู้บริหาร</th>
                  <th className="py-2 pr-3 text-right">เงินได้พึงประเมิน ม.40(1)</th>
                  <th className="py-2 pr-3 text-right">PIT ก่อนฯ</th>
                  <th className="py-2 pr-3 text-right">เงินสุทธิ ก่อนฯ</th>
                  <th className="py-2 pr-3 text-right">PIT หลังฯ: เบี้ย + ภาษีออกแทน</th>
                  <th className="py-2 pr-3 text-right">ภาษีออกแทนทุกทอด</th>
                  <th className="py-2 pr-3 text-right">เงินสุทธิ หลังฯ: เบี้ย + ภาษีออกแทน</th>
                  <th className="py-2 pr-3 text-right">ได้กรมธรรม์จากค่าเบี้ย</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {ds.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-3 text-center text-[color:var(--ink-dim)]">ยังไม่มีข้อมูลผู้บริหาร</td>
                  </tr>
                )}
                {ds.map(it => {
                  const base = it.annualSalary ?? 0
                  const prem = it.personalInsurancePremium ?? 0
                  // ก่อนฯ
                  const tax1 = Math.max(0, base - personalExpense - personalAllowance)
                  const pit1 = pitTax(tax1)
                  const netY1 = base - pit1
                  // หลังฯ: เบี้ย + ภาษีออกแทน
                  const g3 = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
                  const tax3 = Math.max(0, base + prem + g3 - personalExpense - personalAllowance)
                  const pit3 = pitTax(tax3)
                  const netY3 = base - pit3 + g3

                  return (
                    <tr key={it.id}>
                      <td className="py-2 pr-3 text-left">{it.name || '-'}</td>
                      <td className="py-2 pr-3 text-right"><Num v={base} /></td>
                      <td className="py-2 pr-3 text-right text-[#FF7B7B]"><Num v={pit1} forceNeg /></td>
                      <td className="py-2 pr-3 text-right"><Num v={netY1} /></td>
                      <td className="py-2 pr-3 text-right text-[#FF7B7B]"><Num v={pit3} forceNeg /></td>
                      <td className="py-2 pr-3 text-right"><Num v={g3} /></td>
                      <td className="py-2 pr-3 text-right text-gold font-semibold"><Num v={netY3} /></td>
                      <td className="py-2 pr-3 text-right"><Num v={prem} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* อ้างอิงข้อหารือ (โชว์ 2 รายการ) */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold text-gold mb-3">ข้อหารือสรรพากรที่เกี่ยวข้อง</h3>
        <ul className="space-y-2">
          {RULINGS.slice(0, 2).map((r, i) => (
            <li key={r.docNo} className="flex items-start gap-3">
              <span className="mt-0.5 text-[color:var(--ink-dim)]">{i + 1}.</span>
              <div className="min-w-0">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline break-words" title={`${r.docNo} • ${r.topic}`}>
                  {r.docNo}
                </a>
                <span className="ml-2 text-[color:var(--ink)]">เรื่อง: {r.topic}</span>
                <div className="text-xs text-[color:var(--ink-dim)]">แนววินิจฉัย: {r.summary}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
