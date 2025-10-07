import React from 'react'
import ExportPDF from '../components/ExportPDF'
import { load, save } from '../lib/storage'
import { initialState } from '../lib/state'
import type { AppState } from '../lib/types'
import { useDebounceEffect } from '../lib/useDebounceEffect'
import { marginalRate, pitTax, progressiveGrossUp } from '../lib/tax' // (บางอันใช้ในลูก ๆ)
import { useAuth } from '../lib/auth'
import { hasFeature, getDirectorLimit } from '../lib/roles'

import StickySummary from './dashboard/StickySummary'
import CompanySection from './dashboard/CompanySection'
import DirectorsSection from './dashboard/DirectorsSection'
import CITTable from './dashboard/CITTable'
import PITSection from './dashboard/PITSection'
import ReturnSection from './dashboard/ReturnSection'
import PresenterSection from './dashboard/PresenterSection'

export default function UnifiedDashboard() {
  const [data, setData] = React.useState<AppState>(() => load<AppState>(initialState))
  useDebounceEffect(() => save(data), [data], 500)

  // Entitlements
  const { user } = useAuth()
  const plan = user?.plan ?? 'free'
  const canExport = !!user && hasFeature(plan, 'export_pdf')
  const limit = getDirectorLimit(plan as any)
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

  // ===== default “แบบประกันฯ แนะนำ” 3 ฟิลด์ (string) =====
  React.useEffect(() => {
    setData(s => {
      const cur: any = s
      if (cur.recProductName && cur.recPayYears && cur.recCoverage) return s
      return {
        ...s,
        recProductName: cur.recProductName ?? 'My Style Legacy Ultra (Unit Linked)',
        recPayYears: cur.recPayYears ?? '7 ปี',
        recCoverage: cur.recCoverage ?? 'ถึงอายุ 99 ปี',
      }
    })
  }, [])

  // ------------- Shortcuts / derived -------------
  const c = data.company
  const ds = c.directors

  const income = c.companyIncome ?? 0
  const expense = c.companyExpense ?? 0
  const interest = c.interestExpense ?? 0
  const actualCIT = c.actualCIT ?? 0
  const currentThaiYear = new Date().getFullYear() + 543
  const taxYear: number | undefined = c.taxYear

  const personalExpense = 100000
  const personalAllowance = 160000

  const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0)
  const gus = ds.map(d => {
    const base = d.annualSalary ?? 0
    const prem = d.personalInsurancePremium ?? 0
    const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
    return { g }
  })
  const totalGrossUp = gus.reduce((s, g) => s + g.g, 0)

  const CIT_RATE = 0.20
  const pbt_before = income - expense - interest
  const pbt_afterPrem = income - totalPremium - expense - interest
  const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest

  const cit_before = Math.max(0, pbt_before) * CIT_RATE
  const cit_afterPrem = Math.max(0, pbt_afterPrem) * CIT_RATE
  const cit_afterPremGross = Math.max(0, pbt_afterPremGross) * CIT_RATE

  const disallow_tax_before = Math.max(0, actualCIT - cit_before)
  const disallow_base = disallow_tax_before / CIT_RATE

  const disallow_afterPrem = Math.max(0, disallow_base - totalPremium)
  const disallow_afterPremGross = Math.max(0, disallow_base - totalPremium - totalGrossUp)

  const trueTax_before = actualCIT
  const trueTax_afterPrem = cit_afterPrem + (disallow_afterPrem * CIT_RATE)
  const trueTax_afterPremGross = cit_afterPremGross + (disallow_afterPremGross * CIT_RATE)

  const taxSaved_afterPremGross = Math.max(0, trueTax_before - trueTax_afterPremGross)
  const taxSavedPct_afterPremGross = trueTax_before > 0 ? (taxSaved_afterPremGross / trueTax_before) * 100 : 0
  const combinedCost = totalPremium + totalGrossUp

  const disallow_afterPrem_display = pbt_afterPrem < 0 ? 0 : disallow_afterPrem
  const disallow_afterPremGross_display = pbt_afterPremGross < 0 ? 0 : disallow_afterPremGross

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

  const setTaxYear = (v: number | undefined) =>
    setData(s => ({ ...s, company: { ...s.company, taxYear: v } }))

  const handleCompanyChange = (patch: Partial<any>) =>
    setData(s => ({ ...s, company: { ...s.company, ...patch } }))

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

  // helper: scroll ไปยัง element ตาม id แล้วอัปเดต hash โดยไม่เปลี่ยนหน้า
  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (history.replaceState) history.replaceState(null, '', `#${id}`)
  }

  const recProductName = (data as any).recProductName as string
  const recPayYears   = (data as any).recPayYears as string
  const recCoverage   = (data as any).recCoverage as string
  const setRecFields = (p: Partial<{ recProductName: string; recPayYears: string; recCoverage: string }>) =>
    setData(s => ({ ...(s as any), ...p } as any))

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      {/* ===== Header ===== */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold text-[#EBDCA6]">Keyman Corporate Policy Calculator</h2>
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
      <StickySummary
        taxYear={taxYear}
        currentThaiYear={currentThaiYear}
        setTaxYear={setTaxYear}
        taxSaved_afterPremGross={taxSaved_afterPremGross}
        taxSavedPct_afterPremGross={taxSavedPct_afterPremGross}
        combinedCost={combinedCost}
      />

      {/* ===== Company Section ===== */}
      <CompanySection
        company={c}
        interest={interest}
        actualCIT={actualCIT}
        disallow_base={disallow_base}
        onChange={handleCompanyChange}
        onClear={handleClearCompany}
      />

      {/* ===== Directors ===== */}
      <DirectorsSection
        directors={ds}
        limit={limit}
        setData={setData}
        personalExpense={personalExpense}
        personalAllowance={personalAllowance}
        recProductName={recProductName}
        recPayYears={recPayYears}
        recCoverage={recCoverage}
        setRecFields={setRecFields}
      />

      {/* ===== CIT Table ===== */}
      <CITTable
        taxYear={taxYear}
        income={income}
        totalPremium={totalPremium}
        totalGrossUp={totalGrossUp}
        expense={expense}
        interest={interest}
        pbt_before={pbt_before}
        pbt_afterPrem={pbt_afterPrem}
        pbt_afterPremGross={pbt_afterPremGross}
        cit_before={cit_before}
        cit_afterPrem={cit_afterPrem}
        cit_afterPremGross={cit_afterPremGross}
        disallow_base={disallow_base}
        disallow_afterPrem_display={disallow_afterPrem_display}
        disallow_afterPremGross_display={disallow_afterPremGross_display}
        trueTax_before={trueTax_before}
        CIT_RATE={CIT_RATE}
      />

      {/* ===== PIT (per director) ===== */}
      <PITSection
        directors={ds}
        personalExpense={personalExpense}
        personalAllowance={personalAllowance}
      />

      {/* ===== Return overview ===== */}
      <ReturnSection directors={ds} />

      {/* ===== Presenter Info ===== */}
      {canEditPresenter && (
        <PresenterSection
          data={data}
          setData={setData}
          canUploadLogo={canUploadLogo}
          handleLogoChange={handleLogoChange}
        />
      )}
    </main>
  )
}
