// src/data/recommendedPlans.ts

export type Gender = 'male' | 'female'
export type BenefitKind = 'savings' | 'health'

export interface RecommendedRow {
  label: string;       // ป้ายในตาราง เช่น "ชาย (35 ปี)"
  sumAssured: number;  // ทุนประกัน
  annualPremium: number; // เบี้ยต่อปี
}

export interface RecommendedSet {
  savings: RecommendedRow[];
  health: RecommendedRow[];
}

/**
 * คืนค่าทุน/เบี้ยแนะนำอ้างอิงอายุ & เพศ (ค่าคงที่นำร่อง)
 * ในอนาคตคุณสามารถดึงจาก API หรือคำนวณจาก state ได้
 */
export function getRecommendedForAge(age: number = 35): RecommendedSet {
  // ตัวอย่าง baseline (คุณปรับสูตรหรือค่าตาม “แผน …” ได้เลย)
  const labelM = `ชาย (${age} ปี)`
  const labelF = `หญิง (${age} ปี)`

  const savingsBase = 2_000_000
  const savingsPremM = 60_000
  const savingsPremF = 55_000

  const healthBase = 1_000_000
  const healthPremM = 25_000
  const healthPremF = 23_000

  return {
    savings: [
      { label: labelM, sumAssured: savingsBase, annualPremium: savingsPremM },
      { label: labelF, sumAssured: savingsBase, annualPremium: savingsPremF },
    ],
    health: [
      { label: labelM, sumAssured: healthBase, annualPremium: healthPremM },
      { label: labelF, sumAssured: healthBase, annualPremium: healthPremF },
    ],
  }
}
