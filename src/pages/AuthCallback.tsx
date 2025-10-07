import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'

export default function AuthCallback() {
  const nav = useNavigate()
  const [msg, setMsg] = React.useState('กำลังตรวจสอบสิทธิ์…')

  React.useEffect(() => {
    const run = async () => {
      try {
        if (!supabase) throw new Error('Supabase ไม่พร้อม')

        // รองรับทั้ง query (?code, ?token_hash) และ hash (#access_token, #code ...)
        const search = new URLSearchParams(window.location.search)
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

        const code = search.get('code') || hash.get('code')
        const token_hash = search.get('token_hash') || hash.get('token_hash')
        const type = search.get('type') || hash.get('type')
        const access_token = hash.get('access_token')
        const refresh_token = hash.get('refresh_token')

        // 1) OAuth / PKCE: ?code=
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          nav('/dashboard', { replace: true })
          return
        }

        // 2) Magic link: ?token_hash=&type=magiclink
        if (token_hash) {
          const { error } = await supabase.auth.verifyOtp({
            type: (type as any) || 'magiclink',
            token_hash
          })
          if (error) throw error
          nav('/dashboard', { replace: true })
          return
        }

        // 3) บางผู้ให้บริการส่งกลับแบบ hash token (implicit)
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          nav('/dashboard', { replace: true })
          return
        }

        // ไม่พบอะไรเลย → แจ้งชัดเจน
        setMsg('ลิงก์ไม่ถูกต้อง: ไม่พบ code หรือ token_hash')
      } catch (e: any) {
        setMsg(e?.message || 'ไม่สามารถยืนยันตัวตนได้')
      }
    }
    run()
  }, [nav])

  return (
    <div className="min-h-screen grid place-items-center bg-[#0b1220] text-white">
      <p className="text-sm opacity-80">{msg}</p>
    </div>
  )
}
