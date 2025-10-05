// src/lib/exportQuota.ts
import { Plan, getPdfMonthlyQuota } from './roles'

/** เก็บ usage ต่อผู้ใช้แบบรายเดือน */
type UsageState = {
  monthKey: string // e.g. "2025-09"
  used: number
}

const KEY = (userId: string) => `bp:pdfquota:${userId}`

function getMonthKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function readState(userId: string): UsageState {
  try {
    const raw = localStorage.getItem(KEY(userId))
    if (!raw) return { monthKey: getMonthKey(), used: 0 }
    const parsed = JSON.parse(raw) as UsageState
    // reset เมื่อเข้าเดือนใหม่
    if (parsed.monthKey !== getMonthKey()) {
      return { monthKey: getMonthKey(), used: 0 }
    }
    // ป้องกันข้อมูลพัง
    if (typeof parsed.used !== 'number' || parsed.used < 0) {
      return { monthKey: getMonthKey(), used: 0 }
    }
    return parsed
  } catch {
    return { monthKey: getMonthKey(), used: 0 }
  }
}

function writeState(userId: string, st: UsageState) {
  try {
    localStorage.setItem(KEY(userId), JSON.stringify(st))
  } catch {
    // เงียบไว้ (quota เป็น best-effort)
  }
}

/** เหลือโควต้าเท่าไร (null = ไม่จำกัด) */
export function getRemaining(userId: string, plan: Plan): number | null {
  const quota = getPdfMonthlyQuota(plan) // number | 'unlimited'
  if (quota === 'unlimited') return null

  const st = readState(userId)
  const remaining = Math.max(0, quota - st.used)
  return remaining
}

/** เช็คสิทธิ์ก่อนดาวน์โหลดทันที */
export function canExportNow(
  userId: string,
  plan: Plan
): { ok: boolean; remaining: number | null } {
  const quota = getPdfMonthlyQuota(plan)
  if (quota === 'unlimited') {
    return { ok: true, remaining: null }
  }
  const st = readState(userId)
  const remaining = Math.max(0, quota - st.used)
  return { ok: remaining > 0, remaining }
}

/** บันทึกการใช้ 1 ครั้ง (ข้ามถ้าแผนไม่จำกัด) */
export function noteExport(userId: string, plan: Plan): void {
  const quota = getPdfMonthlyQuota(plan)
  if (quota === 'unlimited') return
  const st = readState(userId)
  const next: UsageState = { monthKey: getMonthKey(), used: st.used + 1 }
  writeState(userId, next)
}
