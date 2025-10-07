import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/auth'

export default function AuthCallback() {
  const nav = useNavigate()
  const loc = useLocation()

  React.useEffect(() => {
    async function run() {
      try {
        if (!supabase) throw new Error('Supabase is not ready')
        const hash = window.location.hash
        if (!hash || (!hash.includes('access_token') && !hash.includes('code'))) {
          // กรณีเปิดจากอีเมลบนอุปกรณ์บางชนิด ลิงก์อาจมาแบบ query
          const qs = new URLSearchParams(window.location.search)
          if (!qs.get('code')) throw new Error('ลิงก์ไม่ถูกต้อง: ไม่พบ code หรือ token')
        }
        // Supabase JS v2 จะ handle เองผ่าน listener → แค่รอสักครู่แล้วเปลี่ยนหน้า
        setTimeout(() => {
          const state = (loc.state as any) || {}
          const to = state.from || '/dashboard'
          nav(to, { replace: true })
        }, 400)
      } catch {
        nav('/login', { replace: true })
      }
    }
    run()
  }, [nav, loc.state])

  return (
    <div className="px-6 py-10 text-center text-sm text-[color:var(--ink-dim)]">
      กำลังตรวจสอบสิทธิ์…
    </div>
  )
}
