// src/lib/serverQuota.ts
import { supabase } from './auth'

export type EdgeRes = {
  ok: boolean
  remaining: number | null
  reason?: string
  detail?: string
}

export async function canExportServer(): Promise<EdgeRes> {
  if (!supabase) return { ok: false, remaining: 0, reason: 'supabase_not_ready' }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { ok: false, remaining: 0, reason: 'unauthorized' }

  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  if (!baseUrl) return { ok: false, remaining: 0, reason: 'missing_supabase_url' }

  try {
    const res = await fetch(`${baseUrl}/functions/v1/can_export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    })

    const text = await res.text()
    let data: any = {}
    try { data = JSON.parse(text || '{}') } catch {}

    if (!res.ok) {
      return {
        ok: false,
        remaining: 0,
        reason: data?.reason || `http_${res.status}`,
        detail: data?.detail || text || undefined,
      }
    }
    return data as EdgeRes
  } catch (e: any) {
    return { ok: false, remaining: 0, reason: 'network_failed', detail: String(e?.message ?? e) }
  }
}

if (typeof window !== 'undefined') (window as any).canExportServer = canExportServer
