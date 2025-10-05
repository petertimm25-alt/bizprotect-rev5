// src/lib/roles.ts
export type Plan = 'free' | 'pro' | 'ultra'

export type Feature =
  | 'export_pdf'            // ปุ่ม Export (ให้ Free ด้วย แต่มีโควต้าและลายน้ำ)
  | 'no_watermark'          // ไม่มีลายน้ำใน PDF
  | 'agent_identity_on_pdf' // แสดงข้อมูลผู้เสนอในเอกสาร
  | 'knowledge_full'        // เข้าถึง "ข้อหารือกรมสรรพากร" เต็ม
  | 'proposal_builder'      // Proposal Builder (หน้าเฉพาะ Ultra)
  | 'custom_branding'       // ใส่โลโก้ลูกค้า/ถอดโลโก้ระบบ (Ultra)
  | 'autosave'
  | 'priority_support'
  | 'director_limit_1'
  | 'director_limit_5'
  | 'director_limit_10'

export const PLAN_FEATURES: Record<Plan, Feature[]> = {
  // Free: ใช้ Export ได้ 3 ครั้ง/เดือน และมีลายน้ำ
  free: [
    'export_pdf',
    'autosave',
    'director_limit_1',
    // ไม่มี 'no_watermark'
    // ไม่มี agent identity/knowledge/proposal
  ],

  // Pro: ไม่มีลายน้ำ, โควตา 30 ครั้ง/เดือน, เพิ่มข้อมูลผู้เสนอในเอกสาร
  pro: [
    'export_pdf',
    'no_watermark',
    'agent_identity_on_pdf',
    'knowledge_full',
    'autosave',
    'director_limit_5',
  ],

  // Ultra: ไม่จำกัด, ไม่มีลายน้ำ, feature เต็ม
  ultra: [
    'export_pdf',
    'no_watermark',
    'agent_identity_on_pdf',
    'knowledge_full',
    'autosave',
    'custom_branding',
    'proposal_builder',
    'priority_support',
    'director_limit_10',
  ],
}

export function hasFeature(plan: Plan, feature: Feature) {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false
}

export function isUltra(plan?: Plan | null): boolean {
  return plan === 'ultra'
}

export function isProOrUltra(plan?: Plan | null): boolean {
  return plan === 'pro' || plan === 'ultra'
}

// จำกัดจำนวนผู้บริหารตามแผน
export function getDirectorLimit(plan?: Plan | null): number {
  if (!plan) return 1
  if (hasFeature(plan, 'director_limit_10')) return 10
  if (hasFeature(plan, 'director_limit_5')) return 3
  return 1
}

// โควต้า Export PDF ต่อเดือน (ตามสรุปล่าสุด)
// - Free: 3 ครั้ง/เดือน (มีลายน้ำ)
// - Pro: 30 ครั้ง/เดือน (ไม่มีลายน้ำ)
// - Ultra: ไม่จำกัด (ไม่มีลายน้ำ)
export type PdfMonthlyQuota = number | 'unlimited'

export function getPdfMonthlyQuota(plan: Plan): PdfMonthlyQuota {
  switch (plan) {
    case 'free':
      return 3
    case 'pro':
      return 30
    case 'ultra':
      return 'unlimited'
    default:
      return 0
  }
}
