// src/lib/serverQuota.ts
// เรียก Supabase Edge Function: can_export
// - peek    => ดูยอดคงเหลือ (ไม่หักโควต้า) ใช้ตอนแสดง badge
// - consume => หักโควต้าจริง ใช้ก่อนสร้าง/ดาวน์โหลดไฟล์
import { supabase } from './auth';
// ฟังก์ชันหลักที่ UI เรียกใช้
export async function canExportServer(opts) {
    try {
        if (!supabase) {
            return { ok: false, remaining: 0, reason: 'env_not_ready' };
        }
        // ต้องมี session เพื่อให้ Edge Function ยืนยันตัวตน (RLS)
        const { data: sessData } = await supabase.auth.getSession();
        const session = sessData.session;
        if (!session?.access_token) {
            return { ok: false, remaining: 0, reason: 'unauthorized' };
        }
        // เรียกผ่าน SDK จะจัดการ CORS/headers ให้ (เลี่ยงปัญหา preflight)
        const body = { mode: opts?.peek ? 'peek' : 'consume' };
        const { data, error } = await supabase.functions.invoke('can_export', {
            body,
        });
        if (error) {
            // error.message อาจมีรายละเอียด CORS/Network ได้
            return {
                ok: false,
                remaining: 0,
                reason: 'network_failed',
                detail: error.message ?? 'invoke error',
            };
        }
        // คาดหวังรูปแบบข้อมูลตอบกลับจากฟังก์ชัน
        // { ok: boolean, remaining: number|null, reason?: string }
        const r = data;
        if (typeof r?.ok !== 'boolean' || !('remaining' in r)) {
            return { ok: false, remaining: 0, reason: 'bad_response' };
        }
        return {
            ok: !!r.ok,
            remaining: r.remaining === null
                ? null
                : typeof r.remaining === 'number'
                    ? r.remaining
                    : 0,
            reason: r.reason,
        };
    }
    catch (e) {
        return {
            ok: false,
            remaining: 0,
            reason: 'network_failed',
            detail: e?.message || String(e),
        };
    }
}
