// src/lib/serverQuota.ts
import { supabase } from './auth';
export async function canExportServer() {
    if (!supabase)
        return { ok: false, remaining: 0, reason: 'supabase_not_ready' };
    const { data: { session } } = await supabase.auth.getSession();
    if (!session)
        return { ok: false, remaining: 0, reason: 'unauthorized' };
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!baseUrl)
        return { ok: false, remaining: 0, reason: 'missing_supabase_url' };
    try {
        const res = await fetch(`${baseUrl}/functions/v1/can_export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({}),
        });
        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text || '{}');
        }
        catch { }
        if (!res.ok) {
            return {
                ok: false,
                remaining: 0,
                reason: data?.reason || `http_${res.status}`,
                detail: data?.detail || text || undefined,
            };
        }
        return data;
    }
    catch (e) {
        return { ok: false, remaining: 0, reason: 'network_failed', detail: String(e?.message ?? e) };
    }
}
if (typeof window !== 'undefined')
    window.canExportServer = canExportServer;
