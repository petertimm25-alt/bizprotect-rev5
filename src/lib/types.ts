// src/lib/types.ts

export type Sex = 'male' | 'female'

export type Director = {
  id: string
  name: string
  annualSalary?: number
  allowance?: number
  personalInsurancePremium?: number

  // ✅ ฟิลด์ใหม่ (รองรับ RecommendedPlans)
  sex?: Sex
  age?: number
  sumAssured?: number

  // มูลค่ารับซื้อคืนหน่วยลงทุน (user input)
  surrenderY7?: number
  surrenderAge60?: number
  surrenderAge70?: number
  surrenderAge80?: number
  surrenderAge99?: number
}

export type Company = {
  id: string
  name: string
  corporateTaxRate: number
  companyIncome?: number
  companyExpense?: number
  /** เพิ่มเติมเพื่อเลิกใช้ (as any) */
  interestExpense?: number
  actualCIT?: number
  taxYear?: number
  directors: Director[]
}

export type Presenter = {
  name: string
  phone?: string
  email?: string
  company?: string
  licenseNo?: string
  logoDataUrl?: string
}

export type AppState = {
  company: Company
  /** ผู้เสนอเอกสาร (optional) */
  presenter?: Presenter
}
