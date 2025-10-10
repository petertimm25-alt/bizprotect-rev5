// src/components/ExportPDF.tsx
import React from 'react'
import type { AppState } from '../lib/types'
import {
  Document, Page, Text, View, StyleSheet, Font, pdf, BlobProvider, Image,
} from '@react-pdf/renderer'
import { pitTax, marginalRate, progressiveGrossUp } from '../lib/tax'
import { useAuth } from '../lib/auth'
import { hasFeature } from '../lib/roles'
import { toast } from '../lib/toast'
import { useNavigate } from 'react-router-dom'

/* -------------------- Safe asset resolver -------------------- */
function getBaseUrl(): string {
  try {
    const b = (import.meta as any)?.env?.BASE_URL ?? (import.meta as any)?.env?.BASE
    if (typeof b === 'string' && b.length) return b.endsWith('/') ? b : b + '/'
  } catch {}
  try {
    const href = document.querySelector('base')?.getAttribute('href') || '/'
    return href.endsWith('/') ? href : href + '/'
  } catch {}
  return '/'
}
function asset(path: string) {
  const base = getBaseUrl()
  return base + path.replace(/^\//, '')
}

/* -------------------- Assets / Fonts -------------------- */
const F_REG  = asset('fonts/IBMPlexSansThaiLooped-Regular.ttf')
const F_SEMI = asset('fonts/IBMPlexSansThaiLooped-SemiBold.ttf')
const F_BOLD = asset('fonts/IBMPlexSansThaiLooped-Bold.ttf')
const BP_LOGO = asset('brand/BizProtectLogo.png')

try {
  Font.register({
    family: 'PlexThaiLooped',
    fonts: [
      { src: F_REG, fontWeight: 400 },
      { src: F_SEMI, fontWeight: 600 },
      { src: F_BOLD, fontWeight: 700 },
    ],
  })
} catch (e) {
  console.warn('PDF font register failed:', e)
}

/* -------------------- Theme -------------------- */
const THEME = {
  pageBg: '#FFFBF0',
  ink: '#2A2A2A',
  inkDim: '#6B6B6B',
  gold: '#D4AF37',
  border: '#E8DCC2',
  tableHeaderBg: '#FFF4D6',
  chipBg: '#F6EFD8',
  watermarkOpacity: 0.09,
}

const border = { borderStyle: 'solid' as const, borderColor: THEME.border }

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'PlexThaiLooped',
    fontSize: 9,
    color: THEME.ink,
    backgroundColor: THEME.pageBg,
  },
  content: { marginTop: 20 },
  afterBreakTopGap: { marginTop: 28 },
  h1: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: THEME.ink },
  h2: { fontSize: 10, fontWeight: 600, marginTop: 10, marginBottom: 4, color: THEME.ink },
  gold: { color: THEME.gold, fontWeight: 600 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  label: { color: THEME.inkDim },
  value: {},
  card: { ...border, borderWidth: 1, borderRadius: 6, padding: 8, marginBottom: 8, backgroundColor: '#FFFFFF' },
  table: {
    marginTop: 4,
    ...border,
    borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1,
    borderRadius: 6, backgroundColor: '#FFFFFF',
  },
  tr: {
    flexDirection: 'row',
    ...border,
    borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 1,
  },
  noBottom: { borderBottomWidth: 0 },
  th: { flex: 1, padding: 4, fontWeight: 600, backgroundColor: THEME.tableHeaderBg, lineHeight: 1.25, color: THEME.ink },
  td: { flex: 1, padding: 4, lineHeight: 1.25, color: THEME.ink },
  right: { textAlign: 'right' },
  note: { fontSize: 9, color: THEME.inkDim, marginTop: 6, lineHeight: 1.3 },
  pageNum: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    textAlign: 'center', color: THEME.inkDim, fontSize: 9,
  },
  wmBox: { position: 'absolute', top: '28%', left: 0, right: 0, alignItems: 'center', opacity: THEME.watermarkOpacity },
  wmImg: { width: 380, height: 380, objectFit: 'contain' },
  brand: { position: 'absolute', top: 10, right: 19, width: 40, objectFit: 'contain', opacity: 0.95 },
  presenterRow: { flexDirection: 'row', gap: 8 },
  presenterCol: { flex: 1 },
  presenterKV: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
  presenterLabel: { color: THEME.inkDim, minWidth: 100 },
  presenterValue: { flex: 1, textAlign: 'left' },
  planBox: { ...border, borderWidth: 1, borderRadius: 6, padding: 8, backgroundColor: '#FFFFFF', marginTop: 6, marginBottom: 6 },
  planTitle: { fontSize: 10, fontWeight: 600, color: THEME.ink, marginBottom: 2 },
  planText: { fontSize: 9, color: THEME.gold, fontWeight: 600 },
})

/* -------------------- Helpers -------------------- */
const fmt = (n?: number) =>
  n === undefined || Number.isNaN(n)
    ? '-'
    : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function chunkRows<T>(rows: T[], sizeFirst: number, sizeNext: number): T[][] {
  if (rows.length <= sizeFirst) return [rows]
  const pages: T[][] = []
  pages.push(rows.slice(0, sizeFirst))
  let idx = sizeFirst
  while (idx < rows.length) {
    pages.push(rows.slice(idx, idx + sizeNext))
    idx += sizeNext
  }
  return pages
}

/* -------------------- Calculations -------------------- */
function buildComputed(state: AppState) {
  const c = state.company
  const ds = c.directors

  const income = c.companyIncome ?? 0
  const expense = c.companyExpense ?? 0
  const interest = c.interestExpense ?? 0
  const actualCIT = c.actualCIT ?? 0
  const taxYear: number | undefined = c.taxYear
  const CIT_RATE = 0.2

  const personalExpense = 100000
  const personalAllowance = 160000

  const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0)
  const gus = ds.map(d => {
    const base = d.annualSalary ?? 0
    const prem = d.personalInsurancePremium ?? 0
    const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
    const taxable = Math.max(0, base + prem + g - (personalExpense + personalAllowance))
    const rate = marginalRate(taxable)
    const pit3 = pitTax(taxable)
    const pit1 = pitTax(Math.max(0, base - personalExpense - personalAllowance))
    const net1 = base - pit1
    const net3 = base - pit3 + g
    const sumAssured = (d as any)?.sumAssured ?? 0
    const surrenderY7 = (d as any)?.surrenderY7
    const surrenderAge60 = (d as any)?.surrenderAge60
    const surrenderAge70 = (d as any)?.surrenderAge70
    const surrenderAge99 = (d as any)?.surrenderAge99
    return { id: d.id, name: d.name, base, prem, g, rate, pit1, net1, pit3, net3, sumAssured, surrenderY7, surrenderAge60, surrenderAge70, surrenderAge99 }
  })
  const totalGrossUp = gus.reduce((s, g) => s + g.g, 0)

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
  const disallow_tax_afterPrem = disallow_afterPrem * CIT_RATE
  const disallow_tax_afterPremGross = disallow_afterPremGross * CIT_RATE

  const trueTax_before = actualCIT
  const trueTax_afterPrem = cit_afterPrem + disallow_tax_afterPrem
  const trueTax_afterPremGross = cit_afterPremGross + disallow_tax_afterPremGross

  const taxSaved_afterPrem = Math.max(0, trueTax_before - trueTax_afterPrem)
  const taxSaved_afterPremGross = Math.max(0, trueTax_before - trueTax_afterPremGross)

  const taxSavedPct_afterPrem = trueTax_before > 0 ? (taxSaved_afterPrem / trueTax_before) * 100 : 0
  const taxSavedPct_afterPremGross = trueTax_before > 0 ? (taxSaved_afterPremGross / trueTax_before) * 100 : 0

  // รวม presenter (รองรับ agentCode ใหม่)
  const presenter = (state as any)?.presenter || {
    name: '', phone: '', email: '', company: '', licenseNo: '', agentCode: '', logoDataUrl: undefined
  }

  return {
    c, ds, gus,
    income, expense, interest, actualCIT, taxYear,
    totalPremium, totalGrossUp, combinedCost: totalPremium + totalGrossUp,
    pbt_before, pbt_afterPrem, pbt_afterPremGross,
    cit_before, cit_afterPrem, cit_afterPremGross,
    disallow_base, disallow_afterPrem, disallow_afterPremGross,
    disallow_tax_before, disallow_tax_afterPrem, disallow_tax_afterPremGross,
    trueTax_before, trueTax_afterPrem, trueTax_afterPremGross,
    taxSaved_afterPrem, taxSaved_afterPremGross,
    taxSavedPct_afterPrem, taxSavedPct_afterPremGross,
    presenter,
  }
}

/* -------------------- Reusable Page Wrapper -------------------- */
function PageWithBrand({
  children,
  showWatermark,
  brandLogo,
}: {
  children: React.ReactNode
  showWatermark: boolean
  brandLogo?: string
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.content}>{children}</View>
      {showWatermark && (
        <View style={styles.wmBox} fixed>
          <Image src={BP_LOGO} style={styles.wmImg} />
        </View>
      )}
      <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      {brandLogo ? <Image src={brandLogo} style={styles.brand} fixed /> : null}
    </Page>
  )
}

/* -------------------- PDF Doc -------------------- */
function ProposalPDF({ state, plan }: { state: AppState; plan: 'free' | 'pro' | 'ultra' }) {
  const v = buildComputed(state)
  const showWatermark = plan === 'free'
  const brandLogo = plan === 'ultra' && v.presenter?.logoDataUrl ? (v.presenter.logoDataUrl as string) : undefined

  const directorRows = v.gus.map(g => ({
    key: g.id,
    cells: [ g.name || '-', fmt(g.base), fmt(g.pit1), fmt(g.pit3), fmt(g.g), fmt(g.net1), fmt(g.net3), fmt((g as any).sumAssured ?? 0) ],
  }))

  const HeaderRow = ({ headers }: { headers: string[] }) => (
    <View style={styles.tr}>
      {headers.map((h, i) => (
        <Text key={i} style={[styles.th, i === 0 ? {} : styles.right]}>{h}</Text>
      ))}
    </View>
  )

  const BodyRows = ({ rows }: { rows: { key: string; cells: (string | number)[] }[] }) => (
    <>
      {rows.map((r) => (
        <View key={r.key} style={styles.tr}>
          {r.cells.map((c, j) => (
            <Text key={j} style={[styles.td, j === 0 ? {} : styles.right]}>{c as any}</Text>
          ))}
        </View>
      ))}
    </>
  )

  const fundRows = v.gus.map(g => {
    const accum7 = (g as any).prem ? ((g as any).prem as number) * 7 : 0
    return {
      key: g.id,
      cells: [
        g.name || '-',
        fmt((g as any).sumAssured ?? 0),
        fmt((g as any).prem ?? 0),
        fmt(accum7),
        fmt((g as any).surrenderY7),
        fmt((g as any).surrenderAge60),
        fmt((g as any).surrenderAge70),
        fmt((g as any).surrenderAge99),
      ],
    }
  })

  return (
    <Document>
      {/* PAGE 1 */}
      <PageWithBrand showWatermark={showWatermark} brandLogo={brandLogo}>
        <Text style={styles.h1}>
          ข้อเสนอโครงการกรมธรรม์ประกันชีวิตนิติบุคคล {v.taxYear ? `• ปีภาษี ${v.taxYear}` : ''}
        </Text>

        {/* ข้อมูลบริษัท */}
        <View style={styles.card}>
          <Text style={styles.h2}>ข้อมูลบริษัท</Text>
          <View style={styles.row}><Text style={styles.label}>ชื่อบริษัท</Text><Text style={styles.value}>{v.c.name || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>กำไรก่อนภาษี (งบจริง)</Text><Text style={styles.value}>{fmt(v.pbt_before)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>ภาษี (งบจริง)</Text><Text style={styles.value}>{fmt(v.trueTax_before)}</Text></View>
          <View style={styles.row}><Text style={[styles.label, { color: 'red' }]}>ค่าบวกกลับ (คาดคะเนจากงบจริง)</Text><Text style={[styles.value,{color: 'red'}]}>{fmt(v.disallow_base)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>กำไรก่อนภาษี (หลังเข้าร่วมโครงการฯ: เบี้ย + ภาษีออกแทน)</Text><Text style={[styles.value, styles.gold]}>{fmt(v.pbt_afterPremGross)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>ภาษี (หลังเข้าร่วมโครงการฯ: เบี้ย + ภาษีออกแทน)</Text><Text style={[styles.value, styles.gold]}>{fmt(v.trueTax_afterPremGross)}</Text></View>
          <View style={styles.row}><Text style={[styles.label, {fontWeight: 700}]}>ภาษีลดลง (หลังเข้าร่วมโครงการฯ)</Text><Text style={[styles.value, styles.gold]}>{fmt(v.taxSaved_afterPremGross)} ({v.taxSavedPct_afterPremGross.toFixed(2)}%)</Text></View>
        </View>

        {/* รายจ่ายบริษัท */}
        <View style={styles.card}>
          <Text style={styles.h2}>รายจ่ายบริษัท (แผนที่เสนอ)</Text>
          <View style={styles.row}><Text style={styles.label}>เบี้ยรวมทั้งหมด</Text><Text style={styles.value}>{fmt(v.totalPremium)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>ภาษีออกแทนทั้งหมด</Text><Text style={styles.value}>{fmt(v.totalGrossUp)}</Text></View>
          <View style={styles.row}><Text style={[styles.label, {fontWeight: 700}]}>เบี้ยรวม + ภาษีออกแทนทั้งหมด</Text><Text style={[styles.value, {fontWeight: 700}]}>{fmt(v.combinedCost)}</Text></View>
        </View>

        {/* ตาราง ภ.ง.ด.50 */}
        <Text style={styles.h2}>ภ.ง.ด.50 ของบริษัทฯ</Text>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, { flex: 2 }]}>รายการ</Text>
            <Text style={[styles.th, styles.right]}>ก่อนฯ</Text>
            <Text style={[styles.th, styles.right]}>หลังฯ: มีเบี้ย</Text>
            <Text style={[styles.th, styles.right]}>หลังฯ: เบี้ย+ภาษีสุดท้าย</Text>
          </View>

          {[
            ['รายได้รวม (บาท/ปี)', v.income, v.income, v.income],
            ['เบี้ยประกันฯกรมธรรม์นิติบุคคล (บาท/ปี)', 0, -v.totalPremium, -v.totalPremium],
            ['ค่าภาษีออกแทนทุกทอด (ภ.ง.ด.50(1)) (บาท/ปี)', 0, 0, -v.totalGrossUp],
            ['รายจ่ายรวม/ดอกเบี้ยจ่าย (บาท/ปี)', -(v.expense + v.interest), -(v.expense + v.interest), -(v.expense + v.interest)],
            ['กำไรก่อนภาษี (บาท/ปี)', v.pbt_before, v.pbt_afterPrem, v.pbt_afterPremGross],
            ['ภาษีเงินได้ที่เสียจริง (บาท/ปี)', -v.trueTax_before, -v.trueTax_afterPrem, -v.trueTax_afterPremGross],
          ].map((r, i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, { flex: 2 }]}>{r[0] as string}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(r[1] as number)}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(r[2] as number)}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(r[3] as number)}</Text>
            </View>
          ))}

          <View style={styles.tr}>
            <Text style={[styles.td, { flex: 2, fontWeight: 600, color: THEME.gold }]}>ภาษีที่ลดลง</Text>
            <Text style={styles.td}></Text>
            <Text style={[styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }]}>{fmt(v.taxSaved_afterPrem)}</Text>
            <Text style={[styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }]}>{fmt(v.taxSaved_afterPremGross)}</Text>
          </View>
          <View style={[styles.tr, styles.noBottom]}>
            <Text style={[styles.td, { flex: 2, fontWeight: 600, color: THEME.gold }]}>% ที่ลดลง</Text>
            <Text style={styles.td}></Text>
            <Text style={[styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }]}>{v.trueTax_before > 0 ? `${v.taxSavedPct_afterPrem.toFixed(2)}%` : '-'}</Text>
            <Text style={[styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }]}>{v.trueTax_before > 0 ? `${v.taxSavedPct_afterPremGross.toFixed(2)}%` : '-'}</Text>
          </View>
        </View>
      </PageWithBrand>

      {/* PAGE 2+ */}
      <PageWithBrand showWatermark={showWatermark} brandLogo={brandLogo}>
        {/* ตารางผู้บริหาร */}
        <Text style={styles.h2}>ตารางผู้บริหาร (ผลกระทบภาษีรายบุคคล)</Text>
        {chunkRows(directorRows, 10, 18).map((rows, pageIdx) => (
          <View key={`dir-page-${pageIdx}`} style={pageIdx > 0 ? [styles.table, styles.afterBreakTopGap] : styles.table} break={pageIdx > 0}>
            <HeaderRow headers={['ผู้บริหาร','เงินได้ ม.40(1)','PIT ก่อนฯ','PIT หลังฯ','ภาษีออกแทน','เงินสุทธิ ก่อนฯ','เงินสุทธิ หลังฯ','มีทุนประกันชีวิต']} />
            {rows.length === 0 ? (
              <View style={[styles.tr, styles.noBottom]}>
                <Text style={[styles.td, { flex: 8, textAlign: 'center', color: THEME.inkDim }]}>ยังไม่มีข้อมูลผู้บริหาร</Text>
              </View>
            ) : (<BodyRows rows={rows} />)}
          </View>
        ))}

        {/* ทุนประกันฯ & เบี้ย */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.h2}>ทุนประกันฯ & เบี้ย ของผู้บริหารรายบุคคล • สมมุติผลตอบแทนจากการลงทุนที่ 5%</Text>

          <View style={styles.planBox}>
            <Text style={styles.planTitle}>แบบประกันฯ แนะนำ </Text>
            <Text style={styles.planText}>My Style Legacy Ultra (Unit Linked)</Text>
            <Text style={styles.planText}>ชำระเบี้ย 7 ปี</Text>
            <Text style={styles.planText}>คุ้มครองถึงอายุ 99 ปี</Text>
          </View>

          <Text style={styles.note}>* ตัวอย่างที่แสดงคำนวณจากอัตราผลตอบแทนสมมติโดยเฉลี่ยต่อปี 5% จากแอปฯ AZD</Text>
          {/* ตารางภาพรวมทุน & เบี้ย (ผู้บริหารทุกท่าน) */}
          {chunkRows(fundRows, fundRows.length >= 7 ? 6 : 6, 18).map((rows, pageIdx) => (
            <View
              key={`fund-page-${pageIdx}`}
              style={pageIdx > 0 ? [styles.table, styles.afterBreakTopGap] : styles.table}
              break={pageIdx > 0}
              wrap={false}
            >
              <HeaderRow headers={[
                'ผู้บริหาร',
                'ทุนประกันชีวิต',
                'เบี้ย/ปี',
                'เบี้ยสะสม ปีที่ 7',
                '**กรมฯ ปีที่ 7',
                '**อายุ 60 ปี',
                '**อายุ 70 ปี',
                '**อายุ 99 ปี'
              ]} />
              <BodyRows rows={rows} />
            </View>
          ))}

        </View>

        {/* ผู้เสนอ — แสดงใน PRO/ULTRA แน่ๆ */}
        {(hasFeature('pro', 'agent_identity_on_pdf') && (true /* keep visible for pro */)) &&
          (true) /* explicit allow */ }
        {(true) && ( // ง่ายสุด: ให้แสดงเสมอหากแผนคือ pro/ultra
          <View style={[styles.card, styles.afterBreakTopGap]} wrap={false} break>
            <Text style={styles.h2}>ผู้เสนอ</Text>
            <View style={styles.presenterRow}>
              <View style={styles.presenterCol}>
                <View style={styles.presenterKV}><Text style={styles.presenterLabel}>ชื่อผู้เสนอ</Text><Text style={styles.presenterValue}>{(v.presenter as any)?.name || '-'}</Text></View>
                <View style={styles.presenterKV}><Text style={styles.presenterLabel}>เบอร์โทร</Text><Text style={styles.presenterValue}>{(v.presenter as any)?.phone || '-'}</Text></View>
                <View style={styles.presenterKV}><Text style={styles.presenterLabel}>อีเมล</Text><Text style={styles.presenterValue}>{(v.presenter as any)?.email || '-'}</Text></View>
              </View>
              <View style={styles.presenterCol}>
                <View style={styles.presenterKV}><Text style={styles.presenterLabel}>บริษัท</Text><Text style={styles.presenterValue}>{(v.presenter as any)?.company || '-'}</Text></View>
                <View style={styles.presenterKV}><Text style={styles.presenterLabel}>เลขที่ใบอนุญาต</Text><Text style={styles.presenterValue}>{(v.presenter as any)?.licenseNo || '-'}</Text></View>
                <View style={styles.presenterKV}><Text style={styles.presenterLabel}>รหัสตัวแทน</Text><Text style={styles.presenterValue}>{(v.presenter as any)?.agentCode || '-'}</Text></View>
              </View>
            </View>
          </View>
        )}
      </PageWithBrand>
    </Document>
  )
}

/* -------------------- UI: ปุ่ม + iPad = เปิดแท็บใหม่ / อื่นๆ = โมดัล -------------------- */
export default function ExportPDF({ state }: { state: AppState }) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const { user, ent, plan } = useAuth()
  const navigate = useNavigate()

  const canExport = !!user && ent.export_pdf

  // ตรวจจับ iOS/iPadOS
  const isIOS = React.useMemo(() => {
    const ua = navigator.userAgent || ''
    const iOS = /iPad|iPhone|iPod/.test(ua)
    const iPadOS = navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1
    return iOS || iPadOS
  }, [])

  // iOS เปิดแท็บใหม่ทันที โดย "จอง" แท็บก่อน (sync) แล้วใส่ blob URL ทีหลัง (async)
  const openInNewTabIOS = async () => {
    const w = window.open('', '_blank') // ต้องเปิดทันทีจาก gesture
    if (!w) {
      toast('เบราว์เซอร์บล็อคป๊อปอัพ โปรดอนุญาตการเปิดแท็บใหม่')
      return
    }
    try {
      const blob = await pdf(<ProposalPDF state={state} plan={(plan ?? 'free') as 'free'|'pro'|'ultra'} />).toBlob()
      const url = URL.createObjectURL(blob)
      w.location.href = url
      // เคลียร์เมื่อผู้ใช้ปิดแท็บเองไม่ได้ เราเลยไม่ revoke ทันที
    } catch (err) {
      console.error('export (iOS new tab) failed:', err)
      try { w.close() } catch {}
      toast('สร้างไฟล์ไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  const onPrimaryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!canExport) {
      try { toast('ฟีเจอร์ Export PDF ใช้ได้ในแผน PRO/ULTRA กรุณาอัปเกรด') } catch {}
      navigate('/pricing')
      return
    }
    if (isIOS) {
      void openInNewTabIOS() // เปิดแท็บใหม่เลย (ไม่เปิดโมดัล)
    } else {
      setOpen(true)          // อุปกรณ์อื่นใช้โมดัล
    }
  }

  const downloadNow = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!canExport) {
      try { toast('ฟีเจอร์ Export PDF ใช้ได้ในแผน PRO/ULTRA กรุณาอัปเกรด') } catch {}
      navigate('/pricing')
      return
    }
    if (busy) return
    setBusy(true)
    try {
      const blob = await pdf(<ProposalPDF state={state} plan={(plan ?? 'free') as 'free'|'pro'|'ultra'} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'BizProtect-Proposal.pdf'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
      toast('ดาวน์โหลดแล้ว')
    } catch (err) {
      console.error('export failed:', err)
      toast('สร้างไฟล์ไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onPrimaryClick}
        className="rounded-xl px-4 py-2 md:h-12 bg-[var(--brand-accent)] text-[#0B1B2B] font-semibold hover:brightness-95"
        title="Export PDF"
      >
        Export PDF
      </button>

      {/* อุปกรณ์ non-iOS เท่านั้นถึงใช้โมดัล */}
      {open && canExport && !isIOS && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-xl bg-[color:var(--page)] ring-1 ring-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <div className="text-sm text-[color:var(--ink-dim)]">ตัวอย่างเอกสาร (Preview)</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadNow}
                  disabled={busy}
                  className="text-xs px-3 py-1 rounded ring-1 ring-gold/50 hover:bg-gold/10 disabled:opacity-50"
                >
                  {busy ? 'กำลังสร้าง…' : 'ดาวน์โหลด'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10"
                >
                  ปิด
                </button>
              </div>
            </div>

            <div className="h-[80vh] bg-black/10">
              <BlobProvider document={<ProposalPDF state={state} plan={(plan ?? 'free') as 'free'|'pro'|'ultra'} />}>
                {({ url, loading, error }) => {
                  if (loading) return <div className="p-6 text-center text-sm">กำลังสร้างตัวอย่าง…</div>
                  if (error) {
                    console.error('PDF preview error:', error)
                    return <div className="p-6 text-center text-sm text-red-400">สร้างตัวอย่างไม่สำเร็จ</div>
                  }
                  return <iframe src={url || undefined} className="w-full h-full" title="PDF Preview" />
                }}
              </BlobProvider>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
