// วิธีคำนวณแบบ Mock สำหรับ Unit-Linked (ใช้ทดสอบ UX/Flow)
// สมมติฐานหลัก:
// - Premium charge: ปีที่ 1 = 5%, ปีถัดไป = 2%
// - Admin fee: 0.6% ต่อปี (คิดรายเดือน = 0.6%/12 ของมูลค่ากองทุน ณ ต้นเดือน)
// - COI (Cost of Insurance): คิดรายเดือนจากอัตรา/1000/12 × NAR (SumAssured - Fund Value, ขั้นต่ำ 0)
// - ผลตอบแทนกองทุน: อัตรารายปี (เช่น 5%) คิดรายเดือนแบบคงที่ r/12
// - Death benefit (แบบ A): Max(SA, Fund) — ใช้เพื่อหา NAR เท่านั้น
// หมายเหตุ: ตัวเลข COI เป็นสูตรประมาณการเพื่อ mock เท่านั้น

export type Sex = 'male' | 'female'

export interface SimInput {
  age: number;            // อายุเริ่มต้น
  sex: Sex;               // เพศ
  sumAssured: number;     // ทุนประกัน (บาท)
  annualPremium: number;  // เบี้ยรายปี (บาท)
  premiumTermYears: number; // ระยะเวลาชำระเบี้ย (เช่น 7)
  returnRate: number;     // ผลตอบแทนต่อปี (เช่น 0.05 = 5%)
  months?: number;        // จำนวนเดือนที่จำลอง (เช่น 360 = 30 ปี)
}

export interface MonthPoint {
  month: number;           // เดือนที่ n (เริ่ม 1)
  age: number;             // อายุ (ทศนิยม)
  fundStart: number;       // มูลค่ากองทุนก่อนหักค่าธรรมเนียม/COI/ผลตอบแทน (ต้นเดือน)
  contribution: number;    // เงินเข้ากองทุนสุทธิหลังหัก premium charge (เดือนนี้)
  adminFee: number;        // ค่าธรรมเนียมบริหาร (เดือนนี้)
  coi: number;             // ค่า COI (เดือนนี้)
  fundEnd: number;         // มูลค่ากองทุนปลายเดือน (หลังคิดผลตอบแทน)
}

export interface YearPoint {
  year: number;
  age: number;
  paidThisYear: number;     // เบี้ยรวมปีนี้
  surrenderValue: number;   // มูลค่ารับซื้อคืนหน่วยลงทุน ณ สิ้นปี (≈ fundEnd ของเดือน ธ.ค.)
  totalPaid: number;        // เบี้ยสะสมถึงสิ้นปี
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

// อัตรา COI สมมติ (ต่อ 1,000/ปี) — mock แบบง่าย
// - ฐานอายุ 35: ชาย 1.20, หญิง 1.00
// - เพิ่มหลัง 35: +0.10 ต่อปี
// - ลดก่อน 35: -0.05 ต่อปี (ไม่ต่ำกว่า 0.30)
function mockCoiRatePerThousand(sex: Sex, age: number): number {
  const baseAt35 = sex === 'male' ? 1.20 : 1.00
  const diff = age - 35
  const adj = diff >= 0 ? 0.10 * diff : -0.05 * Math.abs(diff)
  return clamp(baseAt35 + adj, 0.30, 8.00) // ใส่เพดานกันหลุด
}

export function simulateUnitLinked(input: SimInput) {
  const {
    age, sex, sumAssured, annualPremium, premiumTermYears, returnRate, months = 360,
  } = input

  const rMonthly = returnRate / 12
  const adminMonthlyRate = 0.006 / 12 // 0.6% ต่อปี
  const premiumMonthly = annualPremium / 12

  const points: MonthPoint[] = []

  let fund = 0
  let totalPaid = 0

  for (let m = 1; m <= months; m++) {
    const yearIndex = Math.ceil(m / 12) // ปีที่เท่าไร (เริ่มที่ 1)
    const monthInYear = ((m - 1) % 12) + 1
    const currAge = age + (m - 1) / 12

    // 1) Premium เข้าเดือนนี้ไหม (ภายในระยะชำระเบี้ยเท่านั้น)
    let contribGross = 0
    if (yearIndex <= premiumTermYears) {
      contribGross = premiumMonthly
    }

    // 2) Premium charge
    const premiumChargeRate = yearIndex === 1 ? 0.05 : 0.02
    const contribution = contribGross * (1 - premiumChargeRate)

    // 3) ค่าธรรมเนียมบริหารจากกองทุนต้นเดือน
    const fundStart = fund
    const adminFee = fundStart * adminMonthlyRate

    // 4) COI จาก NAR และอัตรา COI (ต่อ 1,000/ปี -> ต่อเดือน)
    const coiRatePerTh = mockCoiRatePerThousand(sex, Math.floor(currAge))
    const deathBenefit = Math.max(sumAssured, fundStart)
    const netAmountAtRisk = Math.max(0, deathBenefit - fundStart)
    const coiMonthly = (coiRatePerTh / 1000) * (netAmountAtRisk) / 12

    // 5) ปรับกองทุน: +contribution - admin - coi
    fund = fundStart + contribution - adminFee - coiMonthly
    if (fund < 0) fund = 0

    // 6) ทบผลตอบแทนสิ้นเดือน
    fund = fund * (1 + rMonthly)

    // สะสมเบี้ย
    totalPaid += contribGross

    points.push({
      month: m,
      age: currAge,
      fundStart,
      contribution,
      adminFee,
      coi: coiMonthly,
      fundEnd: fund,
    })
  }

  return { months: points }
}

export function summarizeYearly(input: SimInput): YearPoint[] {
  const sim = simulateUnitLinked(input)
  const out: YearPoint[] = []
  let totalPaid = 0
  for (let y = 1; y <= Math.ceil((input.months ?? 360) / 12); y++) {
    const slice = sim.months.slice((y - 1) * 12, y * 12)
    if (slice.length === 0) break
    const paidThisYear = y <= input.premiumTermYears ? input.annualPremium : 0
    totalPaid += paidThisYear
    out.push({
      year: y,
      age: Math.floor(input.age + y - 1),
      paidThisYear,
      surrenderValue: slice[slice.length - 1].fundEnd,
      totalPaid,
    })
  }
  return out
}
