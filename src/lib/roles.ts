// src/lib/roles.ts
export type Plan = 'free' | 'pro' | 'ultra'

export type FeatureKey =
  | 'export_pdf'
  | 'no_watermark'
  | 'agent_identity_on_pdf'
  | 'knowledge_full'
  | 'custom_branding'
  | 'proposal_builder'
  | 'priority_support'

// ===== Feature matrix =====
// Free: พื้นฐาน (ห้าม Export, ไม่มี knowledge)
// Pro : ขายหลัก — Export ไม่จำกัด + ลบวอเตอร์มาร์ก + ใส่ผู้เสนอ + priority
//       *** ปิด knowledge (ตามคำสั่ง) ***
// Ultra: ครบทุกอย่าง รวม Custom Branding / Proposal Builder / Knowledge
const FEATURE_MATRIX: Record<Plan, Record<FeatureKey, boolean>> = {
  free: {
    export_pdf: false,
    no_watermark: false,
    agent_identity_on_pdf: false,
    knowledge_full: false,
    custom_branding: false,
    proposal_builder: false,
    priority_support: false,
  },
  pro: {
    export_pdf: true,
    no_watermark: true,
    agent_identity_on_pdf: true,
    knowledge_full: false, // <<< ปิดการเข้าถึง Knowledge สำหรับ Pro
    custom_branding: false,
    proposal_builder: false,
    priority_support: true,
  },
  ultra: {
    export_pdf: true,
    no_watermark: true,
    agent_identity_on_pdf: true,
    knowledge_full: true,
    custom_branding: true,
    proposal_builder: true,
    priority_support: true,
  },
}

export function hasFeature(plan: Plan, key: FeatureKey): boolean {
  return !!FEATURE_MATRIX[plan]?.[key]
}

// ===== เพดานจำนวนกรรมการ =====
export function getDirectorLimit(plan: Plan): number {
  switch (plan) {
    case 'free':  return 1
    case 'pro':   return 5
    case 'ultra': return 10
  }
}

// ===== โควตา Export PDF ต่อเดือน =====
// Free = 0 (กดไม่ได้), Pro/Ultra = ไม่จำกัด
export type PdfQuota = number | 'unlimited'
export function getPdfMonthlyQuota(plan: Plan): PdfQuota {
  switch (plan) {
    case 'free':  return 0
    case 'pro':
    case 'ultra': return 'unlimited'
  }
}

// ===== helpers =====
export const isPro   = (p?: Plan) => p === 'pro' || p === 'ultra'
export const isUltra = (p?: Plan) => p === 'ultra'
