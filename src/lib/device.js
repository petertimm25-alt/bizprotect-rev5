// src/lib/device.ts
import { supabase } from './auth';
const DEVKEY = 'bp:device_id';
/** บังคับให้ได้ Supabase client ที่ไม่ null (ถ้าไม่พร้อมจะ throw) */
function requireSupabase() {
    if (!supabase)
        throw new Error('Supabase is not configured');
    return supabase;
}
export function getDeviceId() {
    if (typeof window === 'undefined')
        return 'ssr';
    let id = localStorage.getItem(DEVKEY);
    if (!id) {
        id = (crypto?.randomUUID?.() || String(Math.random())).toString();
        localStorage.setItem(DEVKEY, id);
    }
    return id;
}
export function getDeviceName() {
    if (typeof navigator === 'undefined')
        return 'unknown';
    const p = navigator.platform || '';
    const v = navigator.vendor || '';
    return [p, v].filter(Boolean).join(' · ');
}
/** ลงทะเบียน/อัปเดตอุปกรณ์ และบังคับให้เหลือแค่ 1 ตัว (หรือ N ถ้าส่งค่าเข้ามา) */
export async function registerDevice(maxDevices = 1) {
    const sb = requireSupabase();
    const device_id = getDeviceId();
    const device_name = getDeviceName();
    const user_agent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    await sb.rpc('upsert_device', {
        p_device_id: device_id,
        p_device_name: device_name,
        p_user_agent: user_agent,
        p_max_devices: maxDevices,
    });
}
/** heart-beat: อัปเดต last_seen */
export async function touchDevice() {
    const sb = requireSupabase();
    const device_id = getDeviceId();
    await sb.rpc('touch_device', { p_device_id: device_id });
}
/** subscribe เมื่อ device ถูก revoke → caller ควร signOut() */
export function subscribeDeviceRevocation(onRevoked) {
    if (!supabase) {
        return { unsubscribe() { } };
    }
    const sb = requireSupabase();
    const device_id = getDeviceId();
    const ch = sb
        .channel('dev_' + device_id)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_devices', filter: `device_id=eq.${device_id}` }, (payload) => {
        const row = payload.new || {};
        if (row.revoked)
            onRevoked();
    })
        .subscribe();
    return {
        unsubscribe() {
            try {
                sb.removeChannel(ch);
            }
            catch { }
        }
    };
}
