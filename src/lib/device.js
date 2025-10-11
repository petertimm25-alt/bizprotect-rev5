// src/lib/device.ts
import { supabase } from './auth';
const LS_DEVICE_ID = 'bp:device_id';
export function getDeviceId() {
    try {
        let id = localStorage.getItem(LS_DEVICE_ID);
        if (!id) {
            id =
                (crypto?.randomUUID?.() ||
                    `${Date.now()}-${Math.random().toString(36).slice(2)}`);
            localStorage.setItem(LS_DEVICE_ID, id);
        }
        return id;
    }
    catch {
        return `anon-${Date.now()}`;
    }
}
function guessDeviceName() {
    try {
        const ua = navigator.userAgent;
        if (/iPad|Macintosh/.test(ua) && 'ontouchend' in document)
            return 'iPadOS';
        if (/iPhone/.test(ua))
            return 'iPhone';
        if (/iPad/.test(ua))
            return 'iPad';
        if (/Android/.test(ua))
            return 'Android';
        if (/Mac OS X/.test(ua))
            return 'macOS';
        if (/Windows/.test(ua))
            return 'Windows';
        return navigator.platform || 'Unknown';
    }
    catch {
        return 'Unknown';
    }
}
function getUA() {
    try {
        return navigator.userAgent.slice(0, 255);
    }
    catch {
        return 'n/a';
    }
}
/** ลงทะเบียน/อัปเดตอุปกรณ์ (ใช้ RPC: upsert_device) */
export async function registerDevice(concurrency = 1) {
    if (!supabase)
        return;
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user)
        return;
    const device_id = getDeviceId();
    const device_name = guessDeviceName();
    const user_agent = getUA();
    const { error } = await supabase.rpc('upsert_device', {
        p_device_id: device_id,
        p_device_name: device_name,
        p_user_agent: user_agent,
        p_concurrency: concurrency,
    });
    if (error)
        console.warn('[device] upsert_device error:', error);
}
/** Heartbeat อัปเดต last_seen (ใช้ RPC: touch_device) */
export async function touchDevice() {
    if (!supabase)
        return;
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user)
        return;
    const device_id = getDeviceId();
    const { error } = await supabase.rpc('touch_device', { p_device_id: device_id });
    if (error)
        console.warn('[device] touch_device error:', error);
}
/** Subscribe การเพิกถอนสิทธิ์ของอุปกรณ์นี้ (UPDATE revoked=true / DELETE row) */
export function subscribeDeviceRevocation(onRevoked) {
    const client = supabase;
    if (!client)
        return { unsubscribe: () => { } };
    const device_id = getDeviceId();
    const channel = client
        .channel(`dev-revoke-${device_id}`)
        .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_devices',
        filter: `device_id=eq.${device_id}`,
    }, (payload) => {
        try {
            const newRow = payload?.new;
            if (newRow?.revoked)
                onRevoked();
        }
        catch { }
    })
        .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'user_devices',
        filter: `device_id=eq.${device_id}`,
    }, () => onRevoked())
        .subscribe((status) => {
        if (status === 'SUBSCRIBED')
            void touchDevice().catch(() => { });
    });
    return {
        unsubscribe: () => {
            try {
                client.removeChannel(channel);
            }
            catch { }
        },
    };
}
