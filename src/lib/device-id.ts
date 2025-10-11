// src/lib/device-id.ts
// สร้าง/อ่าน/เก็บ device_id แบบถาวร (localStorage) + เสริม cookie (ออปชัน)

const STORAGE_KEY = 'bp:device_id'
const COOKIE_NAME = 'bp_device_id'

/** ตรวจว่าเป็น UUID (ยอมรับ v4 ทั่วไป) หรือรูปแบบ dev-* สำหรับดีบัก */
function isValidId(id: string | null | undefined): id is string {
  if (!id || typeof id !== 'string') return false
  // uuid v4 (คร่าว ๆ) หรือ dev-xxxxxxxx
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const devLike  = /^dev-[a-z0-9]{6,}$/i
  return uuidLike.test(id) || devLike.test(id)
}

/** สุ่ม UUID ด้วย Web Crypto ถ้ามี; ถ้าไม่มีใช้ fallback */
function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // fallback แบบง่าย ๆ
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(-4)
  return `${s4()}${s4()}-${s4()}-4${s4().slice(1)}-${((8 + Math.random()*4) | 0).toString(16)}${s4().slice(1)}-${s4()}${s4()}${s4()}`
}

/** อ่านจาก localStorage */
export function readDeviceId(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return isValidId(v) ? v : null
  } catch {
    return null
  }
}

/** เขียนลง localStorage (+ cookie ออปชัน) */
export function writeDeviceId(id: string, opts?: { alsoCookie?: boolean; cookieDays?: number }) {
  try { localStorage.setItem(STORAGE_KEY, id) } catch {}
  if (opts?.alsoCookie) {
    try {
      const days = Math.max(1, opts.cookieDays ?? 365)
      const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString()
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; Expires=${expires}; Path=/; SameSite=Lax`
    } catch {}
  }
}

/** ลบค่า (สำหรับ debug เท่านั้น) */
export function clearDeviceId() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
  try { document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax` } catch {}
}

/** อ่าน cookie (เผื่ออยากตรวจเทียบ) */
export function readCookieDeviceId(): string | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
    const v = m ? decodeURIComponent(m[1]) : null
    return isValidId(v) ? v : null
  } catch { return null }
}

/**
 * ใช้ตัวเดียวพอ: สร้างถ้ายังไม่มี แล้วคืนค่าเสมอ
 * - เก็บใน localStorage
 * - ออปชัน: mirror เป็น cookie เพื่อให้อ่านง่ายจากฝั่งเซิร์ฟเวอร์/Edge
 */
export function getOrCreateDeviceId(opts?: { alsoCookie?: boolean; cookieDays?: number }): string {
  // 1) ลองอ่านจาก localStorage ก่อน
  const existing = readDeviceId()
  if (existing) {
    // sync cookie ถ้าขอ
    if (opts?.alsoCookie) writeDeviceId(existing, { alsoCookie: true, cookieDays: opts.cookieDays })
    return existing
  }

  // 2) เผื่อมีใน cookie (กรณีเคยเซ็ตแบบ cookie มาก่อน)
  const fromCookie = readCookieDeviceId()
  if (fromCookie) {
    writeDeviceId(fromCookie, { alsoCookie: !!opts?.alsoCookie, cookieDays: opts?.cookieDays })
    return fromCookie
  }

  // 3) ไม่มีก็สร้างใหม่
  const id = genId()
  writeDeviceId(id, { alsoCookie: !!opts?.alsoCookie, cookieDays: opts?.cookieDays })
  return id
}
