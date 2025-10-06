// src/pages/Dashboard.tsx
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

type Sex = 'male' | 'female'

// ---------- Small UI helpers ----------
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
const fmt0 = (n?: number) =>
  n === undefined || Number.isNaN(n) ? '-' : n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmt2 = (n?: number) =>
  n === undefined || Number.isNaN(n) ? '-' : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const emptyIfZero = (n?: number) => (n === 0 ? undefined : n)

// ---------- Page ----------
export default function UnifiedDashboard() {
  const [data, setData] = React.useState<AppState>(() => load<AppState>(initialState))
  useDebounceEffect(() => save(data), [data], 500)

  // ---- Draft state สำหรับช่อง "อายุ" ให้พิมพ์ได้ลื่น ๆ ----
  const [ageDraft, setAgeDraft] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    setAgeDraft(prev => {
      const next = { ...prev }
      const ds = data.company.directors
      ds.forEach(d => {
        if (next[d.id] === undefined) {
          next[d.id] = d.age != null ? String(d.age) : ''
        }
      })
      // ล้าง draft ของคนที่ถูกลบออกไป
      Object.keys(next).forEach(id => {
        if (!ds.find(d => d.id === id)) delete next[id]
      })
      return next
    })
  }, [data.company.directors])

  // Entitlements
  const { user } = useAuth()
  const plan = user?.plan ?? 'free'
  const canExport = !!user && hasFeature(plan, 'export_pdf')
  const limit = getDirectorLimit(plan as any) // 1 / 5 / 10 (กำหนดใน roles; pro จะเป็น 3 ตามที่คุณตั้งไว้ใน lib)
  const canEditPresenter = hasFeature(plan, 'agent_identity_on_pdf')
  const canUploadLogo = hasFeature(plan, 'custom_branding')

  // Trim directors if exceeds plan limit
  React.useEffect(() => {
    setData(s => {
      const ds = s.company.directors
      if (ds.length > limit) {
        try { alert(`แพ็กเกจปัจจุบันรองรับผู้บริหารสูงสุด ${limit} คน รายการส่วนเกินถูกตัดให้แล้ว`) } catch {}
        return { ...s, company: { ...s.company, directors: ds.slice(0, limit) } }
      }
      return s
    })
  }, [limit])

  // Ensure presenter defaults once
  React.useEffect(() => {
    setData(s => (s as any).presenter
      ? s
      : {
          ...s,
          presenter: {
            name: 'สมคิด',
            phone: '08x-xxx-xxxx',
            email: 'somkid@company.com',
            company: '',
            licenseNo: '',
            logoDataUrl: undefined
          } as any
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------- State shortcuts -------------
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

  // Directors gross-up / premiums
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

  // CIT (20%)
  const CIT_RATE = 0.20
  const pbt_before = income - expense - interest
  const pbt_afterPrem = income - totalPremium - expense - interest
  const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest

  const cit_before = Math.max(0, pbt_before) * CIT_RATE
  const cit_afterPrem = Math.max(0, pbt_afterPrem) * CIT_RATE
  const cit_afterPremGross = Math.max(0, pbt_afterPremGross) * CIT_RATE

  // Infer add-back from actual tax
  const disallow_tax_before = Math.max(0, actualCIT - cit_before)
  const disallow_base = disallow_tax_before / CIT_RATE

  const disallow_afterPrem = Math.max(0, disallow_base - totalPremium)
  const disallow_afterPremGross = Math.max(0, disallow_base - totalPremium - totalGrossUp)

  const disallow_tax_afterPrem = disallow_afterPrem * CIT_RATE
  const disallow_tax_afterPremGross = disallow_afterPremGross * CIT_RATE

  // True tax
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

  // UX: rule for display (per your request)
  const disallow_afterPrem_display = pbt_afterPrem < 0 ? 0 : disallow_afterPrem
  const disallow_afterPremGross_display = pbt_afterPremGross < 0 ? 0 : disallow_afterPremGross

  // Presenter logo upload
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

  // Plan (static mapping)
  const productName = 'My Style Legacy Ultra (Unit Linked)'
  const payYears = 7

  // Helpers for Recommended area
  const getSex = (d: any): Sex => (d.sex === 'female' ? 'female' : 'male')
  const getAge = (d: any): number => (typeof d.age === 'number' ? d.age : 35)
  const getSumAssured = (d: any): number => (typeof d.sumAssured === 'number' ? d.sumAssured : 10_000_000)
  const getPremium = (d: any): number => (typeof d.personalInsurancePremium === 'number' ? d.personalInsurancePremium : 200_000)
  const getSurr = (d: any, key: string): number | undefined => (typeof d[key] === 'number' ? d[key] : undefined)
  const emptyState = ds.length === 0

  const handleClearCompany = () => {
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      {/* ===== Header ===== */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gold">
          โปรแกรมจำลอง ผลประโยชน์ทางภาษีนิติบุคคล และผลกระทบทางภาษีต่อบุคคลธรรมดา<br/>จากโครงการกรมธรรม์ฯนิติบุคคล (Corporate Policy Project Scenario)
        </h2>
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

      {/* ===== Sticky Summary ===== */}
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
            <a href="#company-sec" className="text-xs px-3 py-1 rounded ring-1 ring-gold/40 hover:bg-gold/10">ไปข้อมูลบริษัท</a>
            <a href="#directors-sec" className="text-xs px-3 py-1 rounded ring-1 ring-gold/40 hover:bg-gold/10">ไปผู้บริหาร</a>
            <a href="#cit-table-sec" className="text-xs px-3 py-1 rounded ring-1 ring-gold/40 hover:bg-gold/10">ไปตาราง ภ.ง.ด.50</a>
            <a href="#return-sec" className="text-xs px-3 py-1 rounded ring-1 ring-gold/40 hover:bg-gold/10">ไปผลตอบแทน</a>
          </div>

          
          <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-3 mt-3">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-sm font-semibold text-[color:var(--ink-dim)]">ภาษีลดลง (หลังฯ)</div>
            <div className="text-sm font-semibold text-right text-gold">
              {fmt2(taxSaved_afterPremGross)}{' '}
              <span className="text-sm text-white/80">
                ({trueTax_before > 0 ? taxSavedPct_afterPremGross.toFixed(2) : '0.00'}%)
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-sm font-semibold text-[color:var(--ink-dim)]">บันทึกเป็นค่าใช้จ่าย(เบี้ย+ภาษีอออกแทน)</div>
            <div className="text-sm font-semibold text-right text-gold">{fmt2(combinedCost)}</div>
          </div>
        </div>
        </div>
      </div>

      {/*<section id="summary-sec">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">กำไรก่อนภาษี(งบจริง)</div>
            <div className="text-sm font-medium text-right">{fmt2(pbt_before)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">กำไรก่อนภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
            <div className="text-sm font-semibold text-right text-gold">{fmt2(pbt_afterPremGross)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">ภาษี(งบจริง)</div>
            <div className="text-sm font-medium text-right">{fmt2(trueTax_before)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">ภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</div>
            <div className="text-sm font-semibold text-right text-gold">{fmt2(trueTax_afterPremGross)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">ภาษีลดลง (หลังฯ)</div>
            <div className="text-sm font-semibold text-right text-gold">
              {fmt2(taxSaved_afterPremGross)}{' '}
              <span className="text-sm text-white/80">
                ({trueTax_before > 0 ? taxSavedPct_afterPremGross.toFixed(2) : '0.00'}%)
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">เบี้ย (รวม)</div>
            <div className="text-sm font-semibold text-right">{fmt2(totalPremium)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">ภาษีออกแทนทุกทอด (รวม)</div>
            <div className="text-sm font-semibold text-right">{fmt2(totalGrossUp)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[12px] text-[color:var(--ink-dim)]">บันทึกเป็นค่าใช้จ่าย(เบี้ย+ภาษีอออกแทน)</div>
            <div className="text-sm font-semibold text-right text-gold">{fmt2(combinedCost)}</div>
          </div>
        </div>
      </section>*/}

      {/* ===== ข้อมูลบริษัท ===== */}
      <section id="company-sec" className="grid gap-6"> 
        <Card title="ข้อมูลบริษัท">
          <div className="mb-3 flex items-center">
            <div className="text-sm text-[color:var(--ink-dim)]">กรอกข้อมูลตั้งต้นของบริษัท</div>
            <button onClick={handleClearCompany} className="ml-auto text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10">ล้างข้อมูล</button>
          </div>

          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
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

             <div className="text-sm text-[color:var(--ink-dim)]">บวกกลับค่าใช้จ่ายต้องห้าม<br/>(คำนวณจากงบจริง)</div>
            <span className="text-[#FF4D4D] font-bold">{fmt2(disallow_base)}</span>
          </div>
        </Card>

        {/* ===== รายละเอียดผู้บริหาร + แผนแนะนำ (รวม UI ใน accordion เดียว) ===== */}
        <section id="directors-sec" className="space-y-4">
          <div className="flex items-center justify-end gap-2">
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

          {ds.length === 0 && (
            <Card title="ยังไม่มีรายชื่อกรรมการ">
              <div className="text-sm text-[color:var(--ink-dim)]">
                โปรดเพิ่มรายชื่อกรรมการในส่วนนี้ แล้วกำหนดรายละเอียดรายคน
              </div>
            </Card>
          )}

          {ds.map((d, idx) => {
            const sex = getSex(d)
            const age = getAge(d)
            const sumAssured = getSumAssured(d)
            const yearlyPremium = getPremium(d)

            const surrY7 = getSurr(d, 'surrenderY7')
            const surrAge60 = getSurr(d, 'surrenderAge60')
            const surrAge70 = getSurr(d, 'surrenderAge70')
            const surrAge99 = getSurr(d, 'surrenderAge99')

            // PIT trio for accordion preview
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
              <Card>
              <details key={d.id} open={idx === 0}>
                <summary className="flex items-center justify-between cursor-pointer select-none">
                  <div className="text-sm">
                    <span className="text-[color:var(--ink-dim)]">กรรมการ:</span>{' '}
                    <span className="text-[color:var(--ink)] font-medium">{d.name || `ผู้บริหาร ${idx + 1}`}</span>
                  </div>
                  <div className="text-xs text-[color:var(--ink-dim)]">คลิกเพื่อดู/ซ่อน</div>
                </summary>

                {/* ฟอร์มกรอก */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* ชื่อ */}
                  <div>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">ชื่อ/ตำแหน่ง</div>
                    <input
                      className="w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60"
                      value={d.name}
                      onChange={e => setData(s => ({
                        ...s,
                        company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, name: e.target.value } : x) }
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
                          onChange={() => setData(s => ({
                            ...s, company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, sex: 'male' } : x) }
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
                          onChange={() => setData(s => ({
                            ...s, company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, sex: 'female' } : x) }
                          }))}
                        />
                        <span>หญิง</span>
                      </label>
                    </div>
                  </div>

                  {/* อายุ — direct input แบบ draft + sync onBlur */}
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
                          setData(s => ({
                            ...s,
                            company: {
                              ...s.company,
                              directors: s.company.directors.map(x =>
                                x.id === d.id ? { ...x, age: undefined as any } : x
                              )
                            }
                          }))
                          return
                        }
                        let n = Math.floor(Number(raw))
                        if (!Number.isNaN(n)) {
                          n = Math.max(1, Math.min(80, n))
                          setData(s => ({
                            ...s,
                            company: {
                              ...s.company,
                              directors: s.company.directors.map(x =>
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
                      onChange={v => setData(s => ({
                        ...s,
                        company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, annualSalary: v } : x) }
                      }))}
                      placeholder="เช่น 1,200,000"
                    />
                  </div>
                </div>

                {/* แผน & ตัวเลขกรมธรรม์ */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* แบบประกัน (static) */}
                  <div className="md:col-span-2">
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">แบบประกันฯ แนะนำ</div>
                    <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 text-[#EBDCA6] text-bold">
                      {productName} / ชำระเบี้ย {payYears} ปี / คุ้มครองถึงอายุ 99 ปี
                    </div>
                  </div>

                  {/* ทุน/ปี */}
                  <div>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">ทุนประกันชีวิต (บาท)</div>
                    <NumberInput
                      value={sumAssured}
                      onChange={(v) => setData(s => ({
                        ...s,
                        company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, sumAssured: v ?? 0 } : x) }
                      }))}
                      placeholder="เช่น 10,000,000"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">เบี้ยประกัน (บาท/ปี)</div>
                    <NumberInput
                      value={yearlyPremium}
                      onChange={(v) => setData(s => ({
                        ...s,
                        company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, personalInsurancePremium: v ?? 0 } : x) }
                      }))}
                      placeholder="เช่น 200,000"
                    />
                  </div>
                </div>

                {/* มูลค่ารับซื้อคืนหน่วยลงทุน */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืน ปีที่ 7</div>
                    <NumberInput value={surrY7} onChange={(v) => setData(s => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, surrenderY7: v ?? undefined } : x) }
                    }))} />
                  </div>
                  <div>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืน เมื่ออายุ 60 ปี</div>
                    <NumberInput value={surrAge60} onChange={(v) => setData(s => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, surrenderAge60: v ?? undefined } : x) }
                    }))} />
                  </div>
                  <div>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืน เมื่ออายุ 70 ปี</div>
                    <NumberInput value={surrAge70} onChange={(v) => setData(s => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, surrenderAge70: v ?? undefined } : x) }
                    }))} />
                  </div>
                  <div>
                    <div className="text-sm text-[color:var(--ink-dim)] mb-1">มูลค่ารับซื้อคืน เมื่ออายุ 99 ปี</div>
                    <NumberInput value={surrAge99} onChange={(v) => setData(s => ({
                      ...s,
                      company: { ...s.company, directors: s.company.directors.map(x => x.id === d.id ? { ...x, surrenderAge99: v ?? undefined } : x) }
                    }))} />
                  </div>
                </div>

                {/* Preview PIT (สรุปสั้น) */}
                <div className="mt-4 text-xs text-[color:var(--ink-dim)]">
                  พรีวิว ภ.ง.ด.91: เงินสุทธิ/ปี ก่อนฯ {fmt2(netY1)} • หลังฯมีเบี้ย {fmt2(netY2)} • หลังฯมีเบี้ย+ภาษีแทน {fmt2(netY3)}
                </div>
              </details>
              </Card>
            )
          })}
        </section>
      </section>

      {/* ===== CIT Table ===== */}
      <section id="cit-table-sec" className="mt-4">
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

              {/* ✅ Rule: หาก "กำไรก่อนภาษี" ในคอลัมน์นั้น < 0 ให้แสดง "บวกกลับค่าใช้จ่ายต้องห้าม" เป็น 0 */}
              <tr>
                <td className="py-2 pr-3 text-left">บวกกลับค่าใช้จ่ายต้องห้าม (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_base} /></td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_afterPrem_display} /></td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_afterPremGross_display} /></td>
              </tr>

              <tr className="text-[#FF7B7B]">
                <td className="py-2 pr-3 text-left">ภาษีจากส่วนที่บวกกลับ ฐาน 20%</td>
                <td className="py-2 pr-3 text-right"><Num v={disallow_tax_before} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={(disallow_afterPrem_display) * CIT_RATE} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={(disallow_afterPremGross_display) * CIT_RATE} forceNeg /></td>
              </tr>

              <tr className="text-[#FF7B7B] font-bold">
                <td className="py-2 pr-3 text-left">ภาษีเงินได้ที่เสียจริง (บาท/ปี)</td>
                <td className="py-2 pr-3 text-right"><Num v={trueTax_before} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={cit_afterPrem + (disallow_afterPrem_display * CIT_RATE)} forceNeg /></td>
                <td className="py-2 pr-3 text-right"><Num v={cit_afterPremGross + (disallow_afterPremGross_display * CIT_RATE)} forceNeg /></td>
              </tr>

              <tr className="text-gold font-bold">
                <td className="py-2 pr-3 text-left">ภาษีที่ลดลง</td>
                <td className="py-2 pr-3 text-right">-</td>
                <td className="py-2 pr-3 text-right"><Num v={Math.max(0, trueTax_before - (cit_afterPrem + (disallow_afterPrem_display * CIT_RATE)))} /></td>
                <td className="py-2 pr-3 text-right"><Num v={Math.max(0, trueTax_before - (cit_afterPremGross + (disallow_afterPremGross_display * CIT_RATE)))} /></td>
              </tr>
              <tr className="text-gold font-bold">
                <td className="py-2 pr-3 text-left">% ที่ลดลง</td>
                <td className="py-2 pr-3 text-right">-</td>
                <td className="py-2 pr-3 text-right">
                  <span className="block text-right">
                    {trueTax_before > 0 ? (Math.max(0, trueTax_before - (cit_afterPrem + (disallow_afterPrem_display * CIT_RATE))) / trueTax_before * 100).toFixed(2) + '%' : '-'}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right">
                  <span className="block text-right">
                    {trueTax_before > 0 ? (Math.max(0, trueTax_before - (cit_afterPremGross + (disallow_afterPremGross_display * CIT_RATE))) / trueTax_before * 100).toFixed(2) + '%' : '-'}
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

      {/* ===== PIT table for directors ===== */}
      {!emptyState && (
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gold mb-3">ภ.ง.ด.91 สำหรับกรรมการ (ทุกคน)</h3>
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
                          <td className="py-2 pr-3 text-right"><span className="block text-right">{(marginalRate(tax1) * 100).toFixed(0)}%</span></td>
                          <td className="py-2 pr-3 text-right"><span className="block text-right">{(marginalRate(tax2) * 100).toFixed(0)}%</span></td>
                          <td className="py-2 pr-3 text-right"><span className="block text-right">{(marginalRate(tax3) * 100).toFixed(0)}%</span></td>
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
      )}

      {/* ===== รวมตารางทุน & เบี้ยทุกกรรมการ ===== */}
        {!emptyState && (
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
                  {ds.map(d => {
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
              * ตัวอย่างที่แสดงข้างต้นคำนวณจากอัตราผลตอบแทนสมมติโดยเฉลี่ยต่อปี 5% จาก แอปพลิเคชั่น AZD
            </div>
          </Card>
          </section>
        )}

      {/* ===== Presenter Info ===== */}
      {canEditPresenter && (
        <section className="mt-6">
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

              {/* บริษัท / ใบอนุญาต */}
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
                  <div className="text-sm text-[color:var(--ink-dim)]">โลโก้บริษัทของคุณ หรือ ไลน์ QR Code (จะแทนที่โลโก้ BizProtect บนเอกสาร)</div>
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
