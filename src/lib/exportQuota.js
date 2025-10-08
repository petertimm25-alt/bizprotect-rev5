// src/lib/exportQuota.ts
import { getPdfMonthlyQuota } from './roles';
const KEY = (userId) => `bp:pdfquota:${userId}`;
function getMonthKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}
function readState(userId) {
    try {
        const raw = localStorage.getItem(KEY(userId));
        if (!raw)
            return { monthKey: getMonthKey(), used: 0 };
        const parsed = JSON.parse(raw);
        // reset เมื่อเข้าเดือนใหม่
        if (parsed.monthKey !== getMonthKey()) {
            return { monthKey: getMonthKey(), used: 0 };
        }
        // ป้องกันข้อมูลพัง
        if (typeof parsed.used !== 'number' || parsed.used < 0) {
            return { monthKey: getMonthKey(), used: 0 };
        }
        return parsed;
    }
    catch {
        return { monthKey: getMonthKey(), used: 0 };
    }
}
function writeState(userId, st) {
    try {
        localStorage.setItem(KEY(userId), JSON.stringify(st));
    }
    catch {
        // เงียบไว้ (quota เป็น best-effort)
    }
}
/** เหลือโควต้าเท่าไร (null = ไม่จำกัด) */
export function getRemaining(userId, plan) {
    const quota = getPdfMonthlyQuota(plan); // number | 'unlimited'
    if (quota === 'unlimited')
        return null;
    const st = readState(userId);
    const remaining = Math.max(0, quota - st.used);
    return remaining;
}
/** เช็คสิทธิ์ก่อนดาวน์โหลดทันที */
export function canExportNow(userId, plan) {
    const quota = getPdfMonthlyQuota(plan);
    if (quota === 'unlimited') {
        return { ok: true, remaining: null };
    }
    const st = readState(userId);
    const remaining = Math.max(0, quota - st.used);
    return { ok: remaining > 0, remaining };
}
/** บันทึกการใช้ 1 ครั้ง (ข้ามถ้าแผนไม่จำกัด) */
export function noteExport(userId, plan) {
    const quota = getPdfMonthlyQuota(plan);
    if (quota === 'unlimited')
        return;
    const st = readState(userId);
    const next = { monthKey: getMonthKey(), used: st.used + 1 };
    writeState(userId, next);
}
