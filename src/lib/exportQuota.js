// src/lib/exportQuota.ts
// Utility ฝั่ง client (localStorage) — ใช้เป็น fallback/ทดสอบเท่านั้น
// ระบบจริงใช้ serverQuota.ts เป็นตัวเช็ค/หักโควต้าหลัก
import { getPdfMonthlyQuota } from './roles';
// key = userId + YYYYMM
function keyFor(userId) {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `bp:pdf_cnt:${userId}:${ym}`;
}
// อ่านจำนวนที่ใช้ไปในเดือนนี้ (ฝั่ง client)
function readUsed(userId) {
    try {
        const v = localStorage.getItem(keyFor(userId));
        const n = v ? parseInt(v, 10) : 0;
        return Number.isFinite(n) ? n : 0;
    }
    catch {
        return 0;
    }
}
// บันทึกจำนวนที่ใช้ไป (ฝั่ง client)
function writeUsed(userId, n) {
    try {
        localStorage.setItem(keyFor(userId), String(Math.max(0, n)));
    }
    catch { }
}
// ===== Public API (client utility) =====
// คืนค่าจำนวนคงเหลือแบบคำนวณฝั่ง client
// - null = ไม่จำกัด
export function getRemainingLocal(userId, plan) {
    const quota = getPdfMonthlyQuota(plan); // number | 'unlimited'
    if (quota === 'unlimited')
        return null;
    const used = readUsed(userId);
    return Math.max(0, quota - used);
}
// บวก 1 การใช้งาน (client)
export function noteExportLocal(userId, plan) {
    const quota = getPdfMonthlyQuota(plan);
    if (quota === 'unlimited')
        return;
    const used = readUsed(userId);
    writeUsed(userId, Math.min(quota, used + 1));
}
