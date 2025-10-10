/** สร้าง seed คงที่ต่อเบราว์เซอร์ (ครั้งแรกสุ่ม แล้วเก็บไว้ใน localStorage) */
function getSeed() {
    let s = localStorage.getItem('bp:seed');
    if (!s) {
        s = crypto?.randomUUID?.() || String(Math.random());
        localStorage.setItem('bp:seed', s);
    }
    return s;
}
/** แฮชง่าย ๆ ให้ได้ string คงที่ต่อเบราว์เซอร์/เครื่อง */
export function getDeviceHash() {
    const raw = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        getSeed(),
    ].join('|');
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
        h = (h << 5) - h + raw.charCodeAt(i);
        h |= 0;
    }
    return String(h);
}
/** เรียก Edge Function เพื่อลงทะเบียนอุปกรณ์นี้ */
export async function registerDevice(supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token)
        return { ok: false, reason: 'no-session' };
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register_device`;
    const payload = {
        device_hash: getDeviceHash(),
        user_agent: navigator.userAgent,
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    }).catch(() => null);
    if (!res)
        return { ok: false, reason: 'network' };
    let json = null;
    try {
        json = await res.json();
    }
    catch { }
    if (!res.ok)
        return { ok: false, reason: json?.reason || `http-${res.status}` };
    return json?.ok ? { ok: true } : { ok: false, reason: json?.reason || 'unknown' };
}
