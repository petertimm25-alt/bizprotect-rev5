// src/pages/TaxEngine.tsx
import React from 'react'
import Card from '../components/Card'
import NumberInput from '../components/NumberInput'
import { load, save } from '../lib/storage'
import { initialState } from '../lib/state'
import type { AppState } from '../lib/types'
import { useDebounceEffect } from '../lib/useDebounceEffect'
import { pitTax, marginalRate, progressiveGrossUp } from '../lib/tax'
import ExportPDF from '../components/ExportPDF'
import { useAuth } from '../lib/auth'
import { hasFeature, getDirectorLimit } from '../lib/roles'

function Num({ v, forceNeg }: { v?: number; forceNeg?: boolean }) {
  if (v === undefined || Number.isNaN(v)) return <span className="block text-right">-</span>
  const neg = forceNeg === true || (v as number) < 0
  const absVal = Math.abs(v as number)
  const txt = absVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (
    <span className={['block text-right tabular-nums', neg ? 'text-[#FF7B7B]' : ''].join(' ')}>
      {neg ? '-' : ''}{txt}
    </span>
  )
}

const fmt = (n?: number) =>
  n === undefined || Number.isNaN(n) ? '-' : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const emptyIfZero = (n?: number) => (n === 0 ? undefined : n)

export default function TaxEngine() {
  const [data, setData] = React.useState<AppState>(() => load<AppState>(initialState))
  useDebounceEffect(() => save(data), [data], 500)

  // ✅ สิทธิ์ฟีเจอร์ตามแผนผู้ใช้
  const { user } = useAuth()
  const plan = user?.plan ?? 'free'
  const canExport = !!user && hasFeature(plan, 'export_pdf')
  const limit = getDirectorLimit(plan as any) // 1 / 5 / 10
  const canEditPresenter = hasFeature(plan, 'agent_identity_on_pdf') // Pro/Ultra
  const canUploadLogo = hasFeature(plan, 'custom_branding')          // Ultra เท่านั้น

  // ✅ ถ้าจำนวนผู้บริหารเกินลิมิตจากแผน → ตัดอัตโนมัติ + แจ้งเตือนสั้น ๆ
  React.useEffect(() => {
    setData(s => {
      const ds = s.company.directors
      if (ds.length > limit) {
        if (typeof window !== 'undefined') {
          try {
            alert(`แพ็กเกจปัจจุบันรองรับผู้บริหารสูงสุด ${limit} คน รายการส่วนเกินถูกตัดให้แล้ว`)
          } catch {}
        }
        return { ...s, company: { ...s.company, directors: ds.slice(0, limit) } }
      }
      return s
    })
  }, [limit])

  // ตั้งค่า presenter ครั้งเดียวถ้ายังไม่มี (เพื่อใช้ใน Proposal/PDF)
  React.useEffect(() => {
    setData(s => (s as any).presenter
      ? s
      : {
          ...s,
          presenter: {
            name: 'สมคิด',
            phone: '08x-xxx-xxxx',
            email: 'somkid@company.com',
            company: '',        // ⬅️ ใหม่
            licenseNo: '',      // ⬅️ ใหม่
            logoDataUrl: undefined
          } as any
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const c = data.company
  const ds = c.directors

  // Company inputs
  const income = c.companyIncome ?? 0
  const expense = c.companyExpense ?? 0
  const interest = c.interestExpense ?? 0
  const actualCIT = c.actualCIT ?? 0
  const currentThaiYear = new Date().getFullYear() + 543
  const taxYear: number | undefined = c.taxYear

  // PIT params
  const personalExpense = 100000
  const personalAllowance = 160000

  // Directors: premiums & gross-up
  const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0)
  const gus = ds.map(d => {
    const base = d.annualSalary ?? 0
    const prem = d.personalInsurancePremium ?? 0
    const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
    const taxable = Math.max(0, base + prem + g - (personalExpense + personalAllowance))
    const r = marginalRate(taxable)
    return { name: d.name, rate: r, g }
  })
  const totalGrossUp = gus.reduce((s, g) => s + g.g, 0)

  // Corporate tax logic (base 20%)
  const CIT_RATE = 0.20
  const pbt_before = income - expense - interest
  const pbt_afterPrem = income - totalPremium - expense - interest
  const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest

  const cit_before = Math.max(0, pbt_before) * CIT_RATE
  const cit_afterPrem = Math.max(0, pbt_afterPrem) * CIT_RATE
  const cit_afterPremGross = Math.max(0, pbt_afterPremGross) * CIT_RATE

  // Infer disallowed add-backs from actual tax
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
  const canAdd = ds.length < limit

  const handleClear = () => {
    setData(s => ({
      ...s,
      company: {
        ...s.company,
        name: '',
        companyIncome: 0,
        companyExpense: 0,
        interestExpense: 0,
        corporateTaxRate: 0.20,
        actualCIT: 0,
        taxYear: undefined,
        directors: []
      }
    }))
  }

  // ⬇️ handler: อัปโหลดโลโก้ (Ultra)
  const handleLogoChange = (file?: File | null) => {
    if (!file) {
      setData(s => ({ ...s, presenter: { ...(s as any).presenter, logoDataUrl: undefined } as any }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setData(s => ({ ...s, presenter: { ...(s as any).presenter, logoDataUrl: dataUrl } as any }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gold">
          Tax Planning with Corporate Life Insurance — ภ.ง.ด.50 & 91
        </h2>

        {/* ✅ แสดง ExportPDF เฉพาะแผนที่มีสิทธิ์ */}
        {canExport ? (
          <ExportPDF state={data} />
        ) : (
          <button
            onClick={() => (window.location.href = '/pricing')}
            className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-4 py-2 text-sm hover:bg-gold/10"
            title="อัปเกรดเป็น Pro เพื่อใช้งาน Export PDF"
          >
            Upgrade to Export PDF
          </button>
        )}
      </div>

      {/* Sticky Summary */}
      <div className="sticky top-0 z-30 -mx-6 px-6 py-3 bg-[color:var(--page)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--page)]/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <label className="text-sm text-[color:var(--ink-dim)] flex items-center gap-2">
            ปีภาษีอ้างอิง:
            <input
              type="number"
              inputMode="numeric"
              className="w-24 rounded bg-white/5 px-2 py-1 ring-1 ring-white/10 text-right text-[color:var(--ink)] outline-none focus:ring-gold/60"
              value={taxYear ?? ''}
              placeholder={String(currentThaiYear)}
              onChange={(e) => {
                const v = e.target.value.trim()
                setData(s => ({
                  ...s,
                  company: { ...s.company, taxYear: v === '' ? undefined : Number(v) }
                }))
              }}
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => document.getElementById('directors-sec')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs px-3 py-1 rounded ring-1 ring-gold/40 hover:bg-gold/10">ไปผู้บริหาร</button>
            <button onClick={() => document.getElementById('cit-table-sec')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs px-3 py-1 rounded ring-1 ring-gold/40 hover:bg-gold/10">ไปตาราง ภ.ง.ด.50</button>
          </div>

          <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">กำไรก่อนภาษี</div>
              <div className="text-sm font-medium text-right">{fmt(pbt_before)}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">กำไรก่อนภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
              <div className="text-sm font-semibold text-right text-gold">{fmt(pbt_afterPremGross)}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">ภาษีงบจริง</div>
              <div className="text-sm font-medium text-right">{fmt(trueTax_before)}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">ภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
              <div className="text-sm font-semibold text-right text-gold">{fmt(trueTax_afterPremGross)}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-[10px] text-[color:var(--ink-dim)]">ภาษีลดลง (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
              <div className="text-sm font-semibold text-right text-gold">
                {fmt(taxSaved_afterPremGross)}{' '}
                <span className="text-[10px] text-gold/80">
                  ({trueTax_before > 0 ? taxSavedPct_afterPremGross.toFixed(2) : '0.00'}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Card */}
      <section className="grid gap-6 mt-6">
        <Card title="ข้อมูลบริษัท">
          <div className="mb-3 flex items-center">
            <div className="text-sm text-[color:var(--ink-dim)]">กรอกข้อมูลตั้งต้นของบริษัท</div>
            <button onClick={handleClear} className="ml-auto text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10">ล้างข้อมูล</button>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-[color:var(--ink-dim)]">ชื่อบริษัท</div>
            <input
              className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
              value={c.name ?? ''}
              onChange={e => setData(s => ({ ...s, company: { ...s.company, name: e.target.value } }))}
              placeholder="ชื่อบริษัท"
            />

            <div className="text-sm text-[color:var(--ink-dim)]">รายได้รวม (Income)</div>
            <NumberInput
              value={emptyIfZero(c.companyIncome)}
              onChange={v => setData(s => ({ ...s, company: { ...s.company, companyIncome: v ?? 0 } }))}
              placeholder="สมมุติฐาน หรือจาก DBD"
            />

            <div className="text-sm text-[color:var(--ink-dim)]">รายจ่ายรวม (Expense)</div>
            <NumberInput
              value={emptyIfZero(c.companyExpense)}
              onChange={v => setData(s => ({ ...s, company: { ...s.company, companyExpense: v ?? 0 } }))}
              placeholder="สมมุติฐาน หรือจาก DBD"
            />

            <div className="text-sm text-[color:var(--ink-dim)]">ดอกเบี้ยจ่าย (Interest expense)</div>
            <NumberInput
              value={emptyIfZero(interest)}
              onChange={v => setData(s => ({ ...s, company: { ...s.company, interestExpense: v ?? 0 } }))}
              placeholder="สมมุติฐาน หรือจาก DBD"
            />

            <div className="text-sm text-[color:var(--ink-dim)]">ภาษีเงินได้จริง</div>
            <NumberInput
              value={emptyIfZero(actualCIT)}
              onChange={v => setData(s => ({ ...s, company: { ...s.company, actualCIT: v ?? 0 } }))}
              placeholder="สมมุติฐาน หรือจาก DBD"
            />

            <div className="text-sm text-[color:var(--ink-dim)]">
              บวกกลับค่าใช้จ่ายต้องห้าม (คาดคะเนจากงบจริง):{' '}
              <span className="text-[color:var(--ink)]">{fmt(disallow_base)}</span>
            </div>

            <p className="mt-2 text-xs text-[color:var(--ink-dim)]">
              หมายเหตุ: คำนวณฐานภาษีนิติบุคคลอัตรา 20% และอนุมาน “บวกกลับค่าใช้จ่ายต้องห้าม” จากภาษีเงินได้ที่เสียจริง
              เพื่อสื่อผลเมื่อเปลี่ยนค่าใช้จ่ายต้องห้ามให้เป็นค่าใช้จ่ายหักได้ (เช่น เบี้ย + ภาษีออกแทน)
            </p>

            <div className="text-sm text-[color:var(--ink-dim)] mt-2">
              รวมเบี้ยทั้งหมด: <span className="text-[color:var(--ink)]">{fmt(totalPremium)}</span>
            </div>
            <div className="text-sm text-[color:var(--ink-dim)]">
              ภาษีออกแทนทุกทอด (รวม): <span className="text-[color:var(--ink)]">{fmt(totalGrossUp)}</span>
            </div>
            <div className="text-sm text-[color:var(--ink-dim)]">
              รวมเบี้ยและภาษีออกแทนทุกทอด (บันทึกเป็นค่าใช้จ่าย):{' '}
              <span className="text-[color:var(--ink)]">{fmt(combinedCost)}</span>
            </div>
          </div>
        </Card>

        {/* Directors */}
        <section id="directors-sec">
          <Card title="รายละเอียดผู้บริหาร">
            <div className="flex items-center justify-end gap-2 mb-3">
              <button
                onClick={() => setData(s => ({ ...s, company: { ...s.company, directors: s.company.directors.slice(0, -1) } }))}
                className="px-3 py-1 rounded border border-gold/40 hover:text-gold disabled:opacity-40"
                disabled={ds.length === 0}
                title={ds.length === 0 ? 'ไม่มีรายการให้ลบ' : 'ลบผู้บริหารคนสุดท้าย'}
              >
                - ลบ
              </button>
              <button
                onClick={() => (ds.length < limit) && setData(s => ({
                  ...s,
                  company: {
                    ...s.company,
                    directors: [
                      ...s.company.directors,
                      { id: String(Date.now()), name: `ผู้บริหาร ${s.company.directors.length + 1}`, annualSalary: undefined as any, personalInsurancePremium: undefined as any }
                    ]
                  }
                }))}
                className="px-3 py-1 rounded border border-gold/40 hover:text-gold disabled:opacity-40"
                disabled={ds.length >= limit}
                title={ds.length < limit ? 'เพิ่มผู้บริหาร' : `ครบสูงสุด ${limit} คนแล้ว`}
              >
                + เพิ่ม (สูงสุด {limit})
              </button>
            </div>

            {ds.map(it => (
              <div key={it.id} className="grid grid-cols-4 gap-2 items-center border-b border-white/10 py-2">
                <input
                  className="col-span-1 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                  value={it.name}
                  onChange={e => setData(s => ({
                    ...s,
                    company: { ...s.company, directors: s.company.directors.map(d => d.id === it.id ? { ...d, name: e.target.value } : d) }
                  }))}
                  placeholder="ตำแหน่ง"
                />
                <div className="col-span-2">
                  <NumberInput
                    value={emptyIfZero(it.annualSalary)}
                    onChange={v => setData(s => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map(d => d.id === it.id ? { ...d, annualSalary: v } : d) }
                    }))}
                    placeholder="เงินได้พึงประเมิน ม.40(1) (บาท/ปี)"
                  />
                </div>
                <div className="col-span-1">
                  <NumberInput
                    value={emptyIfZero(it.personalInsurancePremium)}
                    onChange={v => setData(s => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map(d => d.id === it.id ? { ...d, personalInsurancePremium: v } : d) }
                    }))}
                    placeholder="เบี้ยประกันฯ (บาท/ปี)"
                  />
                </div>
              </div>
            ))}
          </Card>
        </section>
      </section>

      {/* CIT Table 3 column — (เหมือนเดิม) */}
      {/* CIT Table 3 column */}
      <section id="cit-table-sec" className="mt-10">
        <h3 className="text-lg font-semibold text-gold mb-3">
          ภ.ง.ด.50 ของบริษัทจำกัด (โครงสร้างใหม่ — สื่อผลลดภาษี)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table">
            <thead className="text-[color:var(--ink-dim)]">
              <tr>
                <th className="py-2 pr-3 text-left">
                  รายการ (ภ.ง.ด.50){taxYear ? ` — ปีภาษี ${taxYear}` : ''}
                </th>
                <th className="py-2 pr-3 text-right">ก่อนเข้าร่วมโครงการฯ</th>
                <th className="py-2 pr-3 text-right">หลังฯ: มีเบี้ย</th>
                <th className="py-2 pr-3 text-right">หลังฯ: เบี้ย + ภาษีออกแทน</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr>
                <td className="py-2 pr-3 text-left">รายได้รวม (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={income} /></td>
                <td className="py-2 pr-3 text-right"><Num v={income} /></td>
                <td className="py-2 pr-3 text-right"><Num v={income} /></td>
              </tr>

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

              <tr className="text-[#FF7B7B]">
                <td className="py-2 pr-3 text-left">รายจ่ายรวม (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={expense} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={expense} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={expense} forceNeg /></td>
              </tr>
              <tr className="text-[#FF7B7B]">
                <td className="py-2 pr-3 text-left">ดอกเบี้ยจ่าย (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={-interest} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={-interest} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={-interest} forceNeg /></td>
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

              <tr>
                <td className="py-2 pr-3 text-left">บวกกลับค่าใช้จ่ายต้องห้าม (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_base} /></td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_afterPrem} /></td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_afterPremGross} /></td>
              </tr>
              <tr className="text-[#FF7B7B]">
                <td className="py-2 pr-3 text-left">ภาษีจากส่วนที่บวกกลับ ฐาน 20%</td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_tax_before} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_tax_afterPrem} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_tax_afterPremGross} forceNeg /></td>
              </tr>

              <tr className="text-[#FF7B7B] font-bold">
                <td className="py-2 pr-3 text-left">ภาษีเงินได้ที่เสียจริง (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={trueTax_before} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={trueTax_afterPrem} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={trueTax_afterPremGross} forceNeg /></td>
              </tr>

              {/*<tr>
                <td className="py-2 pr-3 text-left">กำไร(ขาดทุน) สุทธิ (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={pbt_before - trueTax_before} /></td>
                <td className="py-2 pr-3 text-right"><Num v={pbt_afterPrem - trueTax_afterPrem} /></td>
                <td className="py-2 pr-3 text-right"><Num v={pbt_afterPremGross - trueTax_afterPremGross} /></td>
              </tr>*/}

              <tr className="text-gold font-bold">
                <td className="py-2 pr-3 text-left">ภาษีที่ลดลง</td>
                <td className="py-2 pr-3 text-right">-</td>
                <td className="py-2 pr-3 text-right"><Num v={taxSaved_afterPrem} /></td>
                <td className="py-2 pr-3 text-right"><Num v={taxSaved_afterPremGross} /></td>
              </tr>
              <tr className="text-gold font-bold">
                <td className="py-2 pr-3 text-left">% ที่ลดลง</td>
                <td className="py-2 pr-3 text-right">-</td>
                <td className="py-2 pr-3 text-right">
                  <span className="block text-right">
                    {trueTax_before > 0 ? taxSavedPct_afterPrem.toFixed(2) + '%' : '-'}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right">
                  <span className="block text-right">
                    {trueTax_before > 0 ? taxSavedPct_afterPremGross.toFixed(2) + '%' : '-'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[color:var(--ink-dim)]">
          หมายเหตุ: “บวกกลับค่าใช้จ่ายต้องห้าม” อนุมานจากภาษีเงินได้ที่เสียจริง แล้วลดลงตามส่วนที่เปลี่ยนจากค่าใช้จ่ายต้องห้าม → ค่าใช้จ่ายหักได้ (เบี้ย/ภาษีออกแทน)
        </p>
      </section>

      {/* PIT table for directors */}
      <section className="mt-10">
        <h3 className="text-lg font-semibold text-gold mb-3">ภ.ง.ด.91  สำหรับกรรมการ (ทุกคน)</h3>
        <div className="space-y-4">
          {ds.map((it, idx) => {
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
              <details key={it.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3" open={idx === 0}>
                <summary className="flex items-center justify-between cursor-pointer select-none">
                  <div className="text-sm">
                    <span className="text-[color:var(--ink-dim)]">ผู้บริหาร:</span>{' '}
                    <span className="text-[color:var(--ink)] font-medium">{it.name || `ผู้บริหาร ${idx + 1}`}</span>
                  </div>
                  <div className="text-xs text-[color:var(--ink-dim)]">คลิกเพื่อดู/ซ่อนรายละเอียด</div>
                </summary>

                <div className="overflow-x-auto mt-3">
                  <table className="min-w-full text-sm table">
                    <thead className="text-[color:var(--ink-dim)]">
                      <tr>
                        <th className="py-2 pr-3 text-left">รายการ (ภ.ง.ด.91)</th>
                        <th className="py-2 pr-3 text-right">ก่อนเข้าร่วมโครงการฯ</th>
                        <th className="py-2 pr-3 text-right">หลังเข้าร่วมโครงการฯ มีค่าเบี้ยประกันชีวิต</th>
                        <th className="py-2 pr-3 text-right">หลังเข้าร่วมโครงการฯ มีค่าเบี้ยประกันฯ + ค่าภาษีสุดท้าย</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      <tr>
                        <td className="py-2 pr-3 text-left">เงินได้พึงประเมิน ม.40(1) (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={base} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={base} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={base} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-left">ค่าเบี้ยประกันฯ (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={prem} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={prem} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-left">ค่าภาษีออกแทนทุกทอด (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={g3} /></td>
                      </tr>
                      <tr className="text-[#FF7B7B]">
                        <td className="py-2 pr-3 text-left">หัก ค่าใช้จ่ายส่วนตัว (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={-100000} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={-100000} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={-100000} /></td>
                      </tr>
                      <tr className="text-[#FF7B7B]">
                        <td className="py-2 pr-3 text-left">หัก ค่าลดหย่อนส่วนตัว (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={-160000} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={-160000} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={-160000} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-left">เงินได้สุทธิ (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={tax1} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={tax2} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={tax3} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-left">ฐานภาษี</td>
                        <td className="py-2 pr-3 text-right">
                          <span className="block text-right">{(marginalRate(tax1) * 100).toFixed(0)}%</span>
                        </td>
                        <td className="py-2 pr-3 text-right">
                          <span className="block text-right">{(marginalRate(tax2) * 100).toFixed(0)}%</span>
                        </td>
                        <td className="py-2 pr-3 text-right">
                          <span className="block text-right">{(marginalRate(tax3) * 100).toFixed(0)}%</span>
                        </td>
                      </tr>
                      <tr className="text-[#FF7B7B]">
                        <td className="py-2 pr-3 text-left">ภาษีบุคคลฯ (PIT) (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={pit1} forceNeg /></td>
                        <td className="py-2 pr-3 text-right"><Num v={pit2} forceNeg /></td>
                        <td className="py-2 pr-3 text-right"><Num v={pit3} forceNeg /></td>
                      </tr>
                      <tr className="text-gold font-bold">
                        <td className="py-2 pr-3 text-left">เงินสุทธิกรรมการ (บาท/ปี)</td>
                        <td className="py-2 pr-3 text-right"><Num v={netY1} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={netY2} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={netY3} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-left">เงินได้ (บาท/เดือน)</td>
                        <td className="py-2 pr-3 text-right"><Num v={base / 12} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={base / 12} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={base / 12} /></td>
                      </tr>
                      <tr className="text-[#FF7B7B]">
                        <td className="py-2 pr-3 text-left">ภ.ง.ด.1 (บาท/เดือน)</td>
                        <td className="py-2 pr-3 text-right"><Num v={pit1 / 12} forceNeg /></td>
                        <td className="py-2 pr-3 text-right"><Num v={pit2 / 12} forceNeg /></td>
                        <td className="py-2 pr-3 text-right"><Num v={pit3 / 12} forceNeg /></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-left">ภาษีออกแทนทุกทอด (บาท/เดือน)</td>
                        <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={0} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={g3 / 12} /></td>
                      </tr>
                      <tr className="text-gold font-bold">
                        <td className="py-2 pr-3 text-left">เงินสุทธิกรรมการ (บาท/เดือน)</td>
                        <td className="py-2 pr-3 text-right"><Num v={(base / 12) - (pit1 / 12)} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={(base / 12) - (pit2 / 12)} /></td>
                        <td className="py-2 pr-3 text-right"><Num v={(base / 12) - ((pit3 / 12) - (g3 / 12))} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>
            )
          })}
        </div>
      </section>

      {/* ...ส่วนตาราง CIT/PIT คงเดิม... */}

      {/* ข้อมูลผู้นำเสนอ (ใช้ใน PDF) — Pro/Ultra เท่านั้น */}
      {canEditPresenter && (
        <section className="mt-8">
          <Card title="ข้อมูลผู้นำเสนอ (ใช้ในเอกสาร PDF)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-[color:var(--ink-dim)]">ชื่อ-สกุล</div>
                <input
                  className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                  value={(data as any).presenter?.name ?? ''}
                  onChange={e => setData(s => ({ ...s, presenter: { ...(s as any).presenter, name: e.target.value } as any }))}
                  placeholder="เช่น สมคิด ใจดี"
                />
              </div>
              <div>
                <div className="text-sm text-[color:var(--ink-dim)]">เบอร์โทร</div>
                <input
                  className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                  value={(data as any).presenter?.phone ?? ''}
                  onChange={e => setData(s => ({ ...s, presenter: { ...(s as any).presenter, phone: e.target.value } as any }))}
                  placeholder="08x-xxx-xxxx"
                />
              </div>
              <div>
                <div className="text-sm text-[color:var(--ink-dim)]">อีเมล</div>
                <input
                  type="email"
                  className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                  value={(data as any).presenter?.email ?? ''}
                  onChange={e => setData(s => ({ ...s, presenter: { ...(s as any).presenter, email: e.target.value } as any }))}
                  placeholder="somkid@company.com"
                />
              </div>

              {/* ⬇️ ฟิลด์ใหม่: บริษัท / เลขที่ใบอนุญาต */}
              <div>
                <div className="text-sm text-[color:var(--ink-dim)]">บริษัท</div>
                <input
                  className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                  value={(data as any).presenter?.company ?? ''}
                  onChange={e => setData(s => ({ ...s, presenter: { ...(s as any).presenter, company: e.target.value } as any }))}
                  placeholder="เช่น บริษัทนายหน้าประกัน จำกัด"
                />
              </div>
              <div>
                <div className="text-sm text-[color:var(--ink-dim)]">เลขที่ใบอนุญาต</div>
                <input
                  className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                  value={(data as any).presenter?.licenseNo ?? ''}
                  onChange={e => setData(s => ({ ...s, presenter: { ...(s as any).presenter, licenseNo: e.target.value } as any }))}
                  placeholder="เช่น ว000000"
                />
              </div>
            </div>

            {/* อัปโหลดโลโก้ — Ultra เท่านั้น */}
            {canUploadLogo && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                <div className="md:col-span-2">
                  <div className="text-sm text-[color:var(--ink-dim)]">โลโก้บริษัทของคุณ (จะแทนที่โลโก้ BizProtect บนเอกสาร)</div>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-gold/10 file:px-3 file:py-1 file:text-gold hover:file:bg-gold/20"
                    onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
                  />
                  <div className="text-xs text-[color:var(--ink-dim)] mt-1">แนะนำ PNG พื้นหลังโปร่ง ขนาดกว้าง ≥ 600px</div>
                  {(data as any).presenter?.logoDataUrl && (
                    <button
                      className="mt-2 text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10"
                      onClick={() => handleLogoChange(null)}
                    >
                      ลบโลโก้
                    </button>
                  )}
                </div>
                <div className="md:col-span-1">
                  <div className="text-sm text-[color:var(--ink-dim)] mb-2">พรีวิว</div>
                  <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-center h-28">
                    {(data as any).presenter?.logoDataUrl
                      ? <img src={(data as any).presenter.logoDataUrl} alt="logo preview" className="max-h-24 object-contain" />
                      : <span className="text-xs text-[color:var(--ink-dim)]">ยังไม่ได้เลือกโลโก้</span>}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>
      )}
      
    </main>
  )
}
