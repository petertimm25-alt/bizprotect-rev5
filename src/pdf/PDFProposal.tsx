// src/pdf/PDFProposal.tsx
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AppState } from '../lib/types'
import { pitTax, marginalRate, progressiveGrossUp } from '../lib/tax'
import { RULINGS } from '../data/rulings'

// สีตามธีม
const NAVY = '#1A2A4F'
const GOLD = '#D4AF37'
const RED = '#D95C5C'
const INK = '#111111'
const INK_DIM = '#444444'

// สไตล์ PDF
const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, color: INK },
  h1: { fontSize: 18, marginBottom: 8, color: GOLD },
  h2: { fontSize: 14, marginTop: 12, marginBottom: 6, color: NAVY },
  p: { fontSize: 10, color: INK_DIM, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  table: { borderWidth: 0.5, borderColor: '#CCCCCC', width: '100%', marginTop: 6 },
  thead: { backgroundColor: NAVY, color: '#FFFFFF', flexDirection: 'row' },
  th: { flex: 1, padding: 6, fontSize: 10, fontWeight: 700 },
  tdrow: { flexDirection: 'row', borderTopWidth: 0.5, borderColor: '#DDDDDD' },
  td: { flex: 1, padding: 6, fontSize: 10 },
  tdRight: { textAlign: 'right' },
  neg: { color: RED },
  hi: { color: GOLD, fontWeight: 700 },
  small: { fontSize: 9, color: INK_DIM },
})

function fmt(n?: number) {
  if (n === undefined || Number.isNaN(n)) return '-'
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type PDFProposalProps = {
  state: AppState
}

export default function PDFProposal({ state }: PDFProposalProps) {
  const c = state.company
  const ds = c.directors
  const income = c.companyIncome ?? 0
  const expense = c.companyExpense ?? 0
  const interest = (c as any).interestExpense ?? 0
  const citRate = c.corporateTaxRate ?? 0.20

  // ส่วนบุคคล
  const personalExpense = 100000
  const personalAllowance = 160000

  const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0)

  // progressive gross-up per director
  const gus = ds.map(d => {
    const base = d.annualSalary ?? 0
    const prem = d.personalInsurancePremium ?? 0
    const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
    const taxable = Math.max(0, base + prem + g - (personalExpense + personalAllowance))
    const r = marginalRate(taxable)
    return { name: d.name, rate: r, g }
  })
  const totalGrossUp = gus.reduce((s, g) => s + g.g, 0)

  // CIT summary (หักดอกเบี้ยจ่าย)
  const pbt_before = income - expense - interest
  const pbt_afterPrem = income - totalPremium - expense - interest
  const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest

  const citBefore = Math.max(0, pbt_before) * citRate
  const citPrem   = Math.max(0, pbt_afterPrem) * citRate
  const citGross  = Math.max(0, pbt_afterPremGross) * citRate

  const taxSavedPrem  = (Math.max(0, pbt_before) - Math.max(0, pbt_afterPrem)) * citRate
  const taxSavedGross = (Math.max(0, pbt_before) - Math.max(0, pbt_afterPremGross)) * citRate

  const pctSavedPrem  = (citBefore > 0 ? ((citBefore - citPrem) / citBefore) * 100 : undefined)
  const pctSavedGross = (citBefore > 0 ? ((citBefore - citGross) / citBefore) * 100 : undefined)

  const netAfterBefore = pbt_before - citBefore
  const netAfterPrem   = pbt_afterPrem - citPrem
  const netAfterGross  = pbt_afterPremGross - citGross

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>BizProtect — Executive Tax Proposal</Text>
        <Text style={styles.p}>ข้อเสนอการวางแผนภาษีด้วยสวัสดิการเบี้ยประกันชีวิตและภาษีออกแทน (Gross-up) สำหรับผู้บริหาร</Text>

        <Text style={styles.h2}>ข้อมูลบริษัท</Text>
        <View style={styles.row}>
          <Text style={styles.p}>ชื่อบริษัท: {c.name || '-'}</Text>
          <Text style={styles.p}>อัตราภาษีนิติบุคคล (CIT): {(citRate * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.p}>รายได้รวม: {fmt(income)} บาท/ปี</Text>
          <Text style={styles.p}>รายจ่ายรวม: {fmt(expense)} บาท/ปี</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.p}>ดอกเบี้ยจ่าย: {fmt(interest)} บาท/ปี</Text>
          <Text style={styles.p}>รวมเบี้ย (ทุกผู้บริหาร): {fmt(totalPremium)} บาท/ปี</Text>
        </View>
        <Text style={styles.p}>ภาษีออกแทน (รวม): {fmt(totalGrossUp)} บาท/ปี</Text>

        <Text style={styles.h2}>ภ.ง.ด.50 ของบริษัทจำกัด</Text>
        {/* Table header */}
        <View style={[styles.table, styles.thead]}>
          <Text style={[styles.th, { flex: 1.4 }]}>รายการ</Text>
          <Text style={[styles.th, styles.tdRight]}>ก่อนโครงการ</Text>
          <Text style={[styles.th, styles.tdRight]}>มีเบี้ย</Text>
          <Text style={[styles.th, styles.tdRight]}>มีเบี้ย + ภาษีแทน</Text>
        </View>
        {/* Rows */}
        {[
          ['รายได้รวม (บาท/ปี)',              fmt(income), fmt(income), fmt(income)],
          ['เบี้ยประกันฯ นิติบุคคล (บาท/ปี)', fmt(0), fmt(totalPremium), fmt(totalPremium)],
          ['ค่าภาษีออกแทนทุกทอด (บาท/ปี)',    fmt(0), fmt(0), fmt(totalGrossUp)],
          ['รายจ่ายรวม (บาท/ปี)',              `-${fmt(expense)}`, `-${fmt(expense)}`, `-${fmt(expense)}`, 'neg'],
          ['ดอกเบี้ยจ่าย (บาท/ปี)',            `-${fmt(interest)}`, `-${fmt(interest)}`, `-${fmt(interest)}`, 'neg'],
          ['กำไรก่อนภาษี (บาท/ปี)',            fmt(pbt_before), fmt(pbt_afterPrem), fmt(pbt_afterPremGross)],
          ['เสียภาษีนิติบุคคล (บาท/ปี)',      `-${fmt(citBefore)}`, `-${fmt(citPrem)}`, `-${fmt(citGross)}`, 'neg'],
          ['ภาษีลดลง (บาท/ปี)',                 '-', fmt(taxSavedPrem), fmt(taxSavedGross), 'hi'],
          ['% ที่ลดลง',                          '-', pctSavedPrem !== undefined ? `${pctSavedPrem.toFixed(2)}%` : '-', pctSavedGross !== undefined ? `${pctSavedGross.toFixed(2)}%` : '-', 'hi'],
          ['กำไร(ขาดทุน) สุทธิ (บาท/ปี)',       fmt(netAfterBefore), fmt(netAfterPrem), fmt(netAfterGross), 'hi'],
        ].map((row, idx) => (
          <View key={idx} style={styles.tdrow}>
            <Text style={[styles.td, { flex: 1.4 }]}>{row[0] as string}</Text>
            <Text style={[styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})]}>{row[1] as string}</Text>
            <Text style={[styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})]}>{row[2] as string}</Text>
            <Text style={[styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})]}>{row[3] as string === 'neg' || row[3] === 'hi' ? row[3] && (row[0] as string).includes('%') ? row[4] as any : row[3] as any : row[3] as string}</Text>
          </View>
        ))}

        <Text style={styles.h2}>ภ.ง.ด.91 สำหรับผู้บริหาร</Text>
        {ds.map((it, i) => {
          const base = it.annualSalary ?? 0
          const prem = it.personalInsurancePremium ?? 0
          const g3 = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
          const tax1 = Math.max(0, base - personalExpense - personalAllowance)
          const tax2 = Math.max(0, base + prem - personalExpense - personalAllowance)
          const tax3 = Math.max(0, base + prem + g3 - personalExpense - personalAllowance)
          const pit1 = pitTax(tax1)
          const pit2 = pitTax(tax2)
          const pit3 = pitTax(tax3)
          const netY1 = base - pit1
          const netY2 = base - pit2
          const netY3 = base - pit3 + g3
          return (
            <View key={it.id} style={{ marginTop: 6 }}>
              <Text style={styles.p}>ผู้บริหาร: {it.name || `ผู้บริหาร ${i + 1}`}</Text>
              <View style={[styles.table, styles.thead]}>
                <Text style={[styles.th, { flex: 1.4 }]}>รายการ (ภ.ง.ด.91)</Text>
                <Text style={[styles.th, styles.tdRight]}>ก่อนโครงการ</Text>
                <Text style={[styles.th, styles.tdRight]}>มีเบี้ย</Text>
                <Text style={[styles.th, styles.tdRight]}>มีเบี้ย + ภาษีแทน</Text>
              </View>
              {[
                ['เงินได้พึงประเมิน ม.40(1) (บาท/ปี)', fmt(base), fmt(base), fmt(base)],
                ['ค่าเบี้ยประกันฯ (บาท/ปี)',            fmt(0), fmt(prem), fmt(prem)],
                ['ค่าภาษีออกแทนทุกทอด (บาท/ปี)',       fmt(0), fmt(0), fmt(g3)],
                ['หัก ค่าใช้จ่ายส่วนตัว (บาท/ปี)',      `-${fmt(100000)}`, `-${fmt(100000)}`, `-${fmt(100000)}`, 'neg'],
                ['หัก ค่าลดหย่อนส่วนตัว (บาท/ปี)',     `-${fmt(160000)}`, `-${fmt(160000)}`, `-${fmt(160000)}`, 'neg'],
                ['เงินได้สุทธิ (บาท/ปี)',                fmt(tax1), fmt(tax2), fmt(tax3)],
                ['ฐานภาษี (marginal)',                   `${(marginalRate(tax1)*100).toFixed(0)}%`, `${(marginalRate(tax2)*100).toFixed(0)}%`, `${(marginalRate(tax3)*100).toFixed(0)}%`],
                ['ภาษีบุคคลฯ (PIT) (บาท/ปี)',           `-${fmt(pit1)}`, `-${fmt(pit2)}`, `-${fmt(pit3)}`, 'neg'],
                ['เงินสุทธิกรรมการ (ปี) (บาท/ปี)',      fmt(netY1), fmt(netY2), fmt(netY3), 'hi'],
                ['เงินสุทธิกรรมการ (บาท/เดือน)',        fmt((base - pit1)/12), fmt((base - pit2)/12), fmt((base - pit3 + g3)/12), 'hi'],
              ].map((row, idx) => (
                <View key={idx} style={styles.tdrow}>
                  <Text style={[styles.td, { flex: 1.4 }]}>{row[0] as string}</Text>
                  <Text style={[styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})]}>{row[1] as string}</Text>
                  <Text style={[styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})]}>{row[2] as string}</Text>
                  <Text style={[styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})]}>{row[3] as string === 'neg' || row[3] === 'hi' ? row[3] as any : row[3] as string}</Text>
                </View>
              ))}
            </View>
          )
        })}

        <Text style={styles.h2}>ข้อหารือสรรพากรที่เกี่ยวข้อง</Text>
        {RULINGS.slice(0, 2).map((r, i) => (
          <Text key={r.docNo} style={styles.p}>
            {i + 1}. {r.docNo} — {r.topic} — {r.summary} ({r.url})
          </Text>
        ))}

        <Text style={styles.h2}>ข้อกำกับ/Compliance</Text>
        <Text style={styles.small}>
          การคำนวณในเอกสารนี้เป็นการประมาณการเบื้องต้น โดยอ้างอิงอัตราภาษีปัจจุบัน (CIT 20% และ PIT แบบอัตราก้าวหน้า)
          ผู้ใช้งานควรตรวจสอบกับผู้เชี่ยวชาญด้านบัญชี/ภาษี และจัดเตรียมเอกสารประกอบให้ครบถ้วนตามหลักเกณฑ์กรมสรรพากร
        </Text>
      </Page>
    </Document>
  )
}
