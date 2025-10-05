// src/components/pdf/RecommendedCoveragePage.tsx
import React from 'react'
import type { AppState } from '../../lib/types'
import {
  Page, Text, View, StyleSheet, Image,
} from '@react-pdf/renderer'
import { pitTax, marginalRate, progressiveGrossUp } from '../../lib/tax'

// ---------- Styles ----------
const border = { borderStyle: 'solid' as const, borderColor: '#E5E7EB' }

const styles = StyleSheet.create({
  page: { padding: 22, fontFamily: 'PlexThaiLooped', fontSize: 9, color: '#0B1020' },
  h1: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  h2: { fontSize: 10, fontWeight: 600, marginTop: 10, marginBottom: 4 },
  gold: { color: '#D4AF37', fontWeight: 600 },

  card: { ...border, borderWidth: 1, borderRadius: 6, padding: 8, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  label: { color: '#64748B' },

  table: { marginTop: 4, ...border, borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 0 },
  tr: { flexDirection: 'row', ...border, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 1 },
  th: { flex: 1, padding: 4, fontWeight: 600, backgroundColor: '#F8FAFC', lineHeight: 1.25 },
  td: { flex: 1, padding: 4, lineHeight: 1.25 },
  right: { textAlign: 'right' },

  // brand at top-right (optional Ultra logo)
  brand: { position: 'absolute', top: 11, right: 20, width: 37, objectFit: 'contain', opacity: 0.95 },

  badge: {
    fontSize: 8, color: '#0B1020', backgroundColor: '#F1F5F9',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start'
  },

  note: { fontSize: 8, color: '#64748B', marginTop: 6, lineHeight: 1.3 },
})

// ---------- Utils ----------
const fmt = (n?: number) =>
  n === undefined || Number.isNaN(n)
    ? '-'
    : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ---------- Lightweight compute (อ้างอิง TaxEngine) ----------
function computeFromState(state: AppState) {
  const c = state.company
  const ds = c.directors

  const income = c.companyIncome ?? 0
  const expense = c.companyExpense ?? 0
  const interest = c.interestExpense ?? 0
  const actualCIT = c.actualCIT ?? 0
  const CIT_RATE = 0.20

  const personalExpense = 100000
  const personalAllowance = 160000

  const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0)
  const gus = ds.map(d => {
    const base = d.annualSalary ?? 0
    const prem = d.personalInsurancePremium ?? 0
    const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance)
    const taxable = Math.max(0, base + prem + g - (personalExpense + personalAllowance))
    const pit3 = pitTax(taxable)
    const pit1 = pitTax(Math.max(0, base - personalExpense - personalAllowance))
    const net1 = base - pit1
    const net3 = base - pit3 + g
    return { id: d.id, name: d.name, base, prem, g, net1, net3 }
  })
  const totalGrossUp = gus.reduce((s, g) => s + g.g, 0)

  const pbt_before = income - expense - interest
  const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest
  const cit_afterPremGross = Math.max(0, pbt_afterPremGross) * CIT_RATE

  // infer disallow from actual tax
  const cit_before = Math.max(0, pbt_before) * CIT_RATE
  const disallow_tax_before = Math.max(0, actualCIT - cit_before)
  const disallow_base = disallow_tax_before / CIT_RATE
  const disallow_afterPremGross = Math.max(0, disallow_base - totalPremium - totalGrossUp)
  const disallow_tax_afterPremGross = disallow_afterPremGross * CIT_RATE

  const trueTax_before = actualCIT
  const trueTax_afterPremGross = cit_afterPremGross + disallow_tax_afterPremGross
  const taxSaved_afterPremGross = Math.max(0, trueTax_before - trueTax_afterPremGross)

  return {
    ds,
    totalPremium,
    totalGrossUp,
    taxSaved_afterPremGross,
    pbt_before,
    trueTax_before,
  }
}

// ---------- Types ----------
type Sex = 'male' | 'female'

export default function RecommendedCoveragePage({
  state,
  plan,
  brandLogoDataUrl,
  age = 35,
  sex = 'male',
}: {
  state: AppState
  plan: 'free' | 'pro' | 'ultra'
  brandLogoDataUrl?: string
  age?: number
  sex?: Sex
}) {
  const v = computeFromState(state)

  // Heuristics เบื้องต้นสำหรับ “งบประมาณ” และ “ทุนแนะนำ”
  // - งบลงทุนสวัสดิการ (ตัวตั้ง): ใช้สัดส่วนของภาษีที่ประหยัดได้
  const budgetYear = v.taxSaved_afterPremGross || 0
  const budgetMonth = budgetYear / 12

  // - ทุนชีวิตขั้นต่ำ: 5 เท่าของรายได้รวมกรรมการ (ตัวอย่าง)
  const totalAnnualSalary = v.ds.reduce((s, d) => s + (d.base ?? 0), 0)
  const suggestedLifeSA = Math.max(1_000_000, totalAnnualSalary * 5)

  // - เงื่อนไขเพศ/อายุ เพื่อเปรียบเทียบเบี้ย (mock ตัวเลขไว้ก่อน)
  const sexFactor = sex === 'male' ? 1.0 : 0.93
  const ageFactor = age <= 35 ? 1.0 : age <= 45 ? 1.25 : 1.5

  // “ตัวอย่างแผน” — ข้อมูล mock (ไว้ดูโครง/ดีไซน์ก่อน)
  const savingsPlans = [
    {
      name: 'สวัสดิการเงินออม (ออม 10 ปี, คุ้มครอง 20 ปี)',
      sa: suggestedLifeSA,
      monthly: Math.round((budgetMonth * 0.55) * sexFactor * ageFactor),
      yearly: Math.round((budgetYear * 0.55) * sexFactor * ageFactor),
      notes: 'เน้นสร้างวินัยออม + คุ้มครองชีวิตพื้นฐาน',
    },
    {
      name: 'สวัสดิการเงินออม (บำนาญเริ่มอายุ 60)',
      sa: Math.round(suggestedLifeSA * 0.6),
      monthly: Math.round((budgetMonth * 0.45) * sexFactor * ageFactor),
      yearly: Math.round((budgetYear * 0.45) * sexFactor * ageFactor),
      notes: 'ทยอยรับบำนาญ, เหมาะกับกลุ่มผู้บริหารระยะกลาง-ยาว',
    },
  ]

  const healthPlans = [
    {
      name: 'สวัสดิการสุขภาพ (IPD + OPD มาตรฐาน)',
      sa: Math.round(suggestedLifeSA * 0.25),
      monthly: Math.round((budgetMonth * 0.35) * sexFactor * ageFactor),
      yearly: Math.round((budgetYear * 0.35) * sexFactor * ageFactor),
      notes: 'ความคุ้มครองผู้ป่วยใน/นอกพื้นฐาน วงเงินเหมาะสม',
    },
    {
      name: 'สวัสดิการสุขภาพ (IPD สูง + OPD)',
      sa: Math.round(suggestedLifeSA * 0.35),
      monthly: Math.round((budgetMonth * 0.55) * sexFactor * ageFactor),
      yearly: Math.round((budgetYear * 0.55) * sexFactor * ageFactor),
      notes: 'วงเงินสูง เน้นโรงพยาบาลเอกชนชั้นนำ',
    },
  ]

  return (
    <Page size="A4" style={styles.page}>
      {brandLogoDataUrl && <Image src={brandLogoDataUrl} style={styles.brand} />}

      <Text style={styles.h1}>ทุน & แผนประกันที่แนะนำ</Text>
      <View style={styles.row}>
        <Text style={styles.label}>อายุที่ใช้คำนวณเบื้องต้น</Text>
        <Text>{age} ปี • {sex === 'male' ? 'เพศชาย' : 'เพศหญิง'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>งบสวัสดิการโดยประมาณ (อิงภาษีที่ประหยัดได้)</Text>
        <Text><Text style={styles.gold}>{fmt(budgetYear)}</Text> บาท/ปี (<Text style={styles.gold}>{fmt(budgetMonth)}</Text> บาท/เดือน)</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>ทุนชีวิตขั้นแนะนำ (เบื้องต้น)</Text>
        <Text style={styles.gold}>{fmt(suggestedLifeSA)} บาท</Text>
      </View>

      {/* สวัสดิการเงินออม */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={styles.h2}>สวัสดิการเงินออม (ตัวอย่างแผน)</Text>
          <Text style={styles.badge}>Mock เพื่อทดสอบเลย์เอาต์</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tr}>
            {['แผน', 'ทุนคุ้มครอง (SA)', 'เบี้ย/เดือน', 'เบี้ย/ปี', 'หมายเหตุ'].map((h, i) => (
              <Text key={i} style={[styles.th, i === 0 ? {} : styles.right]}>{h}</Text>
            ))}
          </View>
          {savingsPlans.map((p, i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, { flex: 2 }]}>{p.name}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(p.sa)}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(p.monthly)}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(p.yearly)}</Text>
              <Text style={[styles.td]}>{p.notes}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* สวัสดิการสุขภาพ */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={styles.h2}>สวัสดิการสุขภาพ (ตัวอย่างแผน)</Text>
          <Text style={styles.badge}>Mock เพื่อทดสอบเลย์เอาต์</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tr}>
            {['แผน', 'วงเงิน (อ้างอิง SA)', 'เบี้ย/เดือน', 'เบี้ย/ปี', 'หมายเหตุ'].map((h, i) => (
              <Text key={i} style={[styles.th, i === 0 ? {} : styles.right]}>{h}</Text>
            ))}
          </View>
          {healthPlans.map((p, i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, { flex: 2 }]}>{p.name}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(p.sa)}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(p.monthly)}</Text>
              <Text style={[styles.td, styles.right]}>{fmt(p.yearly)}</Text>
              <Text style={[styles.td]}>{p.notes}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* หมายเหตุ */}
      <Text style={styles.note}>
        * หน้านี้เป็นต้นแบบเพื่อทดสอบการแสดงผล สามารถเชื่อมข้อมูลแผนจริง/เรตเบี้ยจริงของบริษัทประกันภายหลังได้
        ตัวเลขเบี้ยคำนวณหยาบ ๆ จาก “ภาษีที่ประหยัดได้” เพื่อให้เห็นสัดส่วนงบประมาณเบื้องต้น
      </Text>
    </Page>
  )
}
